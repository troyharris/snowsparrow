import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
import { getPromptForTask } from "@/lib/ai/config/prompts";

export async function POST(request: Request) {
  try {
    const { message, toolId } = await request.json();
    console.log("Handbook API received message:", message);
    console.log("Handbook API received toolId:", toolId);

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    // Get the appropriate model and prompt for the task
    console.log("Getting model and prompt for handbook task");
    const model = await getModelForTask(toolId);
    console.log("Model for handbook task:", model);

    console.log("Getting prompt for handbook task");
    try {
      const prompt = await getPromptForTask(toolId, "default", message);
      console.log("Prompt for handbook task retrieved successfully");

      try {
        // Generate the response
        console.log("Generating response with OpenRouter");
        const aiResponse = await openRouterClient.generateText(
          model,
          prompt.messages
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
    } catch (promptError) {
      console.error("Error getting prompt:", promptError);
      console.error("Error details:", JSON.stringify(promptError, null, 2));
      return NextResponse.json(
        {
          error:
            promptError instanceof Error
              ? promptError.message
              : "Failed to get prompt for handbook task",
        },
        { status: 500 }
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
