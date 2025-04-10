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

    // Create Supabase client with service role for accessing protected tables
    console.log("Creating Supabase client with service role");
    const supabase = await createClient(true);
    console.log("Supabase client created with service role");

    // Get the model - either from modelId or default for chat task
    let model;
    if (modelId) {
      console.log(`Getting model by ID: ${modelId}`);
      const { data: modelData, error: modelError } = await supabase
        .from("models")
        .select("*")
        .eq("id", modelId)
        .single();

      if (modelError) {
        console.error("Error fetching model by ID:", modelError);
        console.log("Falling back to default model for chat task");
        model = await getModelForTask(toolId);
      } else {
        model = modelData;
      }
    } else {
      console.log("Using default model for chat task");
      model = await getModelForTask(toolId);
    }

    console.log("Selected model:", model);

    // Get the prompt - either from promptId or use a default system prompt
    let promptContent;
    //let messages;

    if (promptId) {
      console.log(`Getting prompt by ID: ${promptId}`);
      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", promptId)
        .single();

      if (promptError) {
        console.error("Error fetching prompt by ID:", promptError);
        console.log("Falling back to default chat prompt");
        
        // Check if chat_default prompt exists
        const defaultPrompt = await getPromptByName("chat_default");
        
        if (defaultPrompt) {
          console.log("Using chat_default prompt");
          promptContent = await processPrompt(defaultPrompt);
        } else {
          console.log("No default chat prompt found, using generic system prompt");
          promptContent = "You are a helpful AI assistant. Provide accurate, helpful, and concise responses.";
        }
      } else {
        console.log("Using selected prompt:", promptData.name);
        promptContent = await processPrompt(promptData);
      }
    } else {
      console.log("No prompt ID provided, checking for default chat prompt");
      
      // Check if chat_default prompt exists
      const defaultPrompt = await getPromptByName("chat_default");
      
      if (defaultPrompt) {
        console.log("Using chat_default prompt");
        promptContent = await processPrompt(defaultPrompt);
      } else {
        console.log("No default chat prompt found, using generic system prompt");
        promptContent = "You are a helpful AI assistant. Provide accurate, helpful, and concise responses.";
      }
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
