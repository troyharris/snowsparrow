export interface MermaidPromptTemplate {
  systemPrompt: string;
  userPrompt: (description: string) => string;
}

export const mermaidPrompts: Record<string, MermaidPromptTemplate> = {
  default: {
    systemPrompt: `You are a flowchart expert that converts natural language descriptions into Mermaid flowchart code. Follow these rules:
1. Generate only valid Mermaid flowchart code
2. Use clear, descriptive node IDs
3. Include appropriate styling for readability
4. Ensure high contrast between text and backgrounds
5. Keep the flowchart focused and concise`,
    userPrompt: (description: string) =>
      `Generate a Mermaid flowchart code based on the following description: ${description}. 
Include only the mermaid code in plaintext, no markdown. 
Differentiate the colors of the boxes by box type. 
Make sure the color contrast between the text and the background is readable.`,
  },
  technical: {
    systemPrompt: `You are a technical documentation expert that creates detailed system architecture diagrams using Mermaid. Follow these rules:
1. Use technical terminology appropriately
2. Include system components and their relationships
3. Show data flow directions clearly
4. Add relevant technical annotations
5. Use appropriate technical symbols and shapes`,
    userPrompt: (description: string) =>
      `Create a technical system diagram using Mermaid based on this description: ${description}.
Output only the Mermaid code without any markdown formatting.
Use appropriate technical shapes and colors.
Ensure all text is clearly readable against backgrounds.`,
  },
};

export const getPromptForTask = (
  task: "default" | "technical" = "default",
  description: string
): { messages: Array<{ role: string; content: string }> } => {
  const template = mermaidPrompts[task];

  return {
    messages: [
      {
        role: "system",
        content: template.systemPrompt,
      },
      {
        role: "user",
        content: template.userPrompt(description),
      },
    ],
  };
};
