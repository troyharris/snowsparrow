import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/ai/clients/openrouter";
import { getModelForTask } from "@/lib/ai/config/models";
// import { getPromptByName, processPrompt } from "@/lib/ai/config/prompts";
// import { createClient } from "@/utils/supabase/server";

const BCP_SYSTEM_PROMPT = `You are a Business Continuity Plan creation assistant. Your goal is to help users create a comprehensive business continuity plan by asking a series of questions and generating a markdown document based on their responses.

Follow these guidelines:

1. Start by introducing yourself and explaining that you'll help create a business continuity plan.

2. Ask questions one at a time to gather information for each section of the plan:
   - Department name
   - Incident type (suggest common types but allow custom entries)
   - Incident lead
   - Impact assessment
   - Mitigation strategies
   - Timeline of activities
   - Required resources
   - Roles and responsibilities

3. For the incident type, you can suggest examples like:
   - Natural disasters (earthquake, flood, fire)
   - Technology failures (system outage, data breach)
   - Public health emergencies
   - Staff shortages
   - Facility issues
   But make it clear they can specify their own incident type.

4. Ask follow-up questions when responses need more detail.

5. Keep track of what information has been collected and what's still needed.

6. Once all information is collected, generate a markdown document following this exact template:

# FUSD Business Continuity Plan

## Department
[Department name]

## Incident Type
[Incident type]

## Incident Lead
[Incident lead name/role]

## Questionnaire

### How would this incident affect the functioning of the department/school?
[Impact assessment]

### What strategies could mitigate the incident and allow the department/school to continue to function?
[Mitigation strategies]

### Create a list and timeline of activities and procedures that would be implemented if this incident happened?
[Timeline of activities]

## Resources Needed

| Resource | Available (Yes/No)? |
| --- | ---|
[Resources table]

## Roles and Responsibilites
| Title | Name | Responsibilities |
| --- | --- | ---|
[Roles table]

7. When the plan is complete, provide the markdown document and ask if they would like to save it or make any changes.

Remember to be helpful, professional, and thorough in gathering information while keeping the conversation focused on creating an effective business continuity plan.`;

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
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

    // Get the default model for chat task
    console.log("Using default model for chat task");
    const model = await getModelForTask("chat");
    console.log("Selected model:", model);

    // Format messages for OpenRouter
    // Always start with the system message
    const formattedMessages = [
      {
        role: "system",
        content: BCP_SYSTEM_PROMPT,
      }
    ];

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
