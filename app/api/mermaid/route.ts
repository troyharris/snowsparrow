import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
import { getPromptForTask } from "@/lib/ai/config/prompts";

export async function POST(request: Request) {
  try {
    const { inputText, promptType = "default", toolId } = await request.json();

    if (!inputText?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    if (!["default", "technical"].includes(promptType)) {
      return NextResponse.json(
        { error: "Invalid prompt type" },
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
    const model = await getModelForTask(toolId);
    const prompt = await getPromptForTask(toolId, promptType, inputText);

    try {
      // Generate the Mermaid code
      const mermaidCode = await openRouterClient.generateMermaidCode(
        model,
        prompt.messages
      );

      // Basic validation of generated Mermaid code
      if (!mermaidCode?.trim()) {
        throw new Error("Generated Mermaid code is empty");
      }

      if (
        !mermaidCode.toLowerCase().includes("flowchart") &&
        !mermaidCode.toLowerCase().includes("graph")
      ) {
        throw new Error("Generated code is not a valid Mermaid flowchart");
      }

      return NextResponse.json({ mermaidCode });
    } catch (genError) {
      console.error("Error generating Mermaid code:", genError);
      return NextResponse.json(
        {
          error:
            "Failed to generate valid flowchart. Please try rephrasing your description.",
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
