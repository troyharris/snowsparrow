import { NextResponse, NextRequest } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
import { getPromptByName, processPrompt } from "@/lib/ai/config/prompts";
import { createClient } from "@/utils/supabase/server";
import { isAuthenticated } from "@/utils/supabase/middleware"; // Import isAuthenticated

export async function POST(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, history, modelId, promptId, toolId } = await request.json();
    console.log("Chat API received message:", message);
    console.log("Chat API received history:", history);
    console.log("Chat API received modelId:", modelId);
    console.log("Chat API received promptId:", promptId);
    console.log("Chat API received toolId:", toolId);

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    // Create Supabase clients: standard for user data, service role for protected tables
    const supabase = await createClient(); // Standard client for user profile
    const supabaseService = await createClient(true); // Service role client for models/prompts
    console.log("Supabase clients created");

    // --- Fetch User Profile ---
    let userFullName = "User"; // Default value
    let userJobTitle = "Employee"; // Default value
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      // Proceed with default values
    } else if (user) {
      console.log("Fetching profile for user ID:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, job_title")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Proceed with default values
      } else if (profile) {
        userFullName = profile.full_name || userFullName;
        userJobTitle = profile.job_title || userJobTitle;
        console.log(`Profile found: Name=${userFullName}, Title=${userJobTitle}`);
      } else {
        console.log("No profile found for user, using defaults.");
      }
    } else {
       console.log("No authenticated user found after check, using defaults.");
    }

    // --- Model Selection ---
    // Priority: 1. modelId from request (user selection), 2. Model linked via tool_models, 3. Fallback
    let model;
    if (modelId) {
      console.log(`Attempting to use modelId from request: ${modelId}`);
      // Use service client for models table
      const { data: modelData, error: modelError } = await supabaseService
        .from("models")
        .select("*")
        .eq("id", modelId)
        .single();

      if (modelError) {
        console.error(`Error fetching model by ID ${modelId}:`, modelError);
        console.log(`Falling back to model determined by toolId: ${toolId}`);
        model = await getModelForTask(toolId); // Fallback to tool-specific model
      } else {
        console.log(`Using model specified in request: ${modelData.name}`);
        model = modelData;
      }
    } else {
      console.log(`No modelId in request, determining model via toolId: ${toolId}`);
      model = await getModelForTask(toolId); // Determine model based on tool
    }
    console.log("Final selected model:", model);


    // --- Prompt Selection ---
    // Priority: 1. promptId from request (user selection), 2. Prompt linked via tool_id, 3. 'chat_default', 4. Generic fallback
    let promptContent;
    let selectedPromptName = "Generic Fallback"; // For logging

    if (promptId) {
      console.log(`Attempting to use promptId from request: ${promptId}`);
      // Use service client for prompts table
      const { data: promptData, error: promptError } = await supabaseService
        .from("prompts")
        .select("*")
        .eq("id", promptId)
        .single();

      if (promptError) {
        console.error(`Error fetching prompt by ID ${promptId}:`, promptError);
        console.log(`Falling back to prompt determined by toolId: ${toolId}`);
        // If fetching selected prompt fails, fall through to tool-specific logic below
      } else {
        selectedPromptName = promptData.name;
        console.log(`Using prompt specified in request: ${selectedPromptName}`);
        promptContent = await processPrompt(promptData);
      }
    }
    
    // If no promptId provided OR fetching prompt by ID failed, try finding prompt by toolId
    if (!promptContent) {
        console.log(`No promptId in request or fetch failed. Attempting to fetch prompt associated with toolId: ${toolId}`);
        // Use service client for prompts table
        const { data: toolPromptData, error: toolPromptError } = await supabaseService
          .from("prompts")
          .select("*")
          .eq("tool_id", toolId) // Fetch prompt linked to the tool
          .limit(1); // Assuming one primary prompt per tool

        if (toolPromptError) {
            console.error(`Error fetching prompt for toolId ${toolId}:`, toolPromptError);
            // Fallback if error occurs during tool prompt fetch
        } else if (toolPromptData && toolPromptData.length > 0) {
            const toolPrompt = toolPromptData[0];
            selectedPromptName = toolPrompt.name;
            console.log(`Using tool-specific prompt: ${selectedPromptName}`);
            promptContent = await processPrompt(toolPrompt);
        }
    }

    // If still no prompt content, try the 'chat_default' prompt
    if (!promptContent) {
        console.log(`No tool-specific prompt found or fetch failed. Checking for 'chat_default' prompt.`);
        const defaultPrompt = await getPromptByName("chat_default");
        if (defaultPrompt) {
            selectedPromptName = defaultPrompt.name;
            console.log(`Using 'chat_default' prompt.`);
            promptContent = await processPrompt(defaultPrompt);
        }
    }

    // Final fallback to generic prompt
    if (!promptContent) {
        console.log(`No specific, tool-specific, or default prompt found. Using generic system prompt.`);
        promptContent = "You are a helpful AI assistant. Provide accurate, helpful, and concise responses.";
        selectedPromptName = "Generic Fallback";
    }
    console.log(`Final selected prompt name for system message: ${selectedPromptName}`);

    // --- Inject Profile Data into Prompt ---
    // This happens *after* processPrompt has handled static injects
    if (promptContent) {
      promptContent = promptContent
        .replace(/{{fullName}}/g, userFullName)
        .replace(/{{jobTitle}}/g, userJobTitle);
      console.log("Prompt content after profile injection:", promptContent);
    }

    // Format messages for OpenRouter
    // Always start with the system message
    const formattedMessages = [
      {
        role: "system",
        content: promptContent,
      }
    ];

    // Add message history if provided
    if (history && Array.isArray(history)) {
      // Add all previous messages from history
      formattedMessages.push(...history);
    }

    // Add the current user message
    formattedMessages.push({
      role: "user",
      content: message,
    });

    console.log("Formatted messages:", JSON.stringify(formattedMessages, null, 2));

    try {
      // Generate the response
      console.log("Generating response with OpenRouter");
      const aiResponse = await openRouterClient.generateText(
        model,
        formattedMessages
      );
      console.log("Response generated successfully");

      return NextResponse.json({ response: aiResponse });
    } catch (genError) {
      console.error("Error generating response:", genError);
      console.error("Error details:", JSON.stringify(genError, null, 2));
      return NextResponse.json(
        {
          error:
            "Failed to generate response. Please try rephrasing your question.",
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
