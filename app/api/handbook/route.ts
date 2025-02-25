import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
import { handbookPrompts } from "@/lib/ai/prompts/handbook";
import { readFileSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    // Get the appropriate model and prompt for the task
    const model = getModelForTask("handbook");
    const prompt = handbookPrompts.default;

    // Read the handbook text from the file
    const handbookPath = path.join(process.cwd(), "lib/ai/data/handbook.txt");
    const handbookText = readFileSync(handbookPath, "utf8");

    const systemPrompt = prompt.systemPrompt.replace(
      "[HANDBOOK_TEXT]",
      handbookText
    );

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    try {
      // Generate the response
      const aiResponse = await openRouterClient.generateText(model, messages);

      return NextResponse.json({ response: aiResponse });
    } catch (genError) {
      console.error("Error generating response:", genError);
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
