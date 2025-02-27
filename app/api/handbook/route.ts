import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
import { getPromptByName, getPromptForTask } from "@/lib/ai/config/prompts";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    console.log("Handbook API received message:", message);

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    // Check if the handbook_default prompt exists directly using Supabase client with service role
    console.log("Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role
    console.log("Supabase client created with service role");

    console.log("Checking if handbook_default prompt exists directly");
    const { data: promptData, error: promptError } = await supabase
      .from("prompts")
      .select("*")
      .eq("name", "handbook_default")
      .single();

    if (promptError) {
      console.error(
        "Error fetching handbook_default prompt directly:",
        promptError
      );
      console.error("Error details:", JSON.stringify(promptError, null, 2));
    } else {
      console.log("Prompt exists check result (direct):", promptData);
    }

    // Continue with the regular flow using the service role-enabled functions
    console.log("Checking if handbook_default prompt exists via function");
    const promptExists = await getPromptByName("handbook_default");
    console.log("Prompt exists check result (via function):", promptExists);

    // Get the appropriate model and prompt for the task
    console.log("Getting model for handbook task");
    const model = await getModelForTask("handbook");
    console.log("Model for handbook task:", model);

    console.log("Getting prompt for handbook task");
    try {
      const prompt = await getPromptForTask("handbook", "default", message);
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
