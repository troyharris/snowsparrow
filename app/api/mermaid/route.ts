import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { inputText } = await request.json();

  // Call OpenRouter API to get Mermaid code
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: `Generate a Mermaid flowchart code based on the following description: ${inputText}. Include only the mermaid code in plaintext, no markdown. Differentiate the colors of the boxes by box type. Make sure the color contrast between the text and the background is readable.`,
          },
        ],
      }),
    }
  );

  const data = await response.json();
  let mermaidCode = data.choices[0].message.content;

  // Extract mermaid code from markdown code blocks if present
  if (mermaidCode.includes("```mermaid")) {
    mermaidCode = mermaidCode.split("```mermaid")[1].split("```")[0].trim();
  } else if (mermaidCode.includes("```")) {
    mermaidCode = mermaidCode.split("```")[1].trim();
  }

  return NextResponse.json({ mermaidCode });
}
