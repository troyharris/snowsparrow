import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
import { getPromptForTask } from "@/lib/ai/config/prompts";

export async function POST(request: Request) {
  try {
    const { message, history, toolId } = await request.json();
    console.log("BCP API received message:", message);
    console.log("BCP API received history:", history);

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for accessing protected tables
    console.log("Creating Supabase client with service role");
    // const supabase = await createClient(true);
    console.log("Supabase client created with service role");

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    // Get the model and prompt for the task
    console.log("Getting model and prompt for BCP task");
    const model = await getModelForTask(toolId);
    const prompt = await getPromptForTask(toolId, "default", message);
    console.log("Selected model:", model);

    // Format messages for OpenRouter
    // Always start with the system message and prompt messages
    const formattedMessages = [...prompt.messages];

    // Add message history if provided
    if (history && Array.isArray(history)) {
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
