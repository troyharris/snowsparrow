import { AIModel } from "../config/models";

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://openrouter.ai/api/v1";
  }

  async generateText(
    model: AIModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    console.log(
      "OpenRouterClient: Generating text with model:",
      model.api_string
    );
    console.log(
      "OpenRouterClient: Messages:",
      JSON.stringify(messages, null, 2)
    );

    try {
      console.log("OpenRouterClient: Sending request to OpenRouter API");
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model.api_string,
          messages,
        }),
      });
      console.log("OpenRouterClient: Response status:", response.status);

      if (!response.ok) {
        console.error(
          "OpenRouterClient: Response not OK:",
          response.status,
          response.statusText
        );
        const errorData = (await response.json()) as OpenRouterError;
        console.error("OpenRouterClient: Error data:", errorData);
        throw new Error(
          `OpenRouter API error: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      console.log("OpenRouterClient: Parsing response JSON");
      const data = (await response.json()) as OpenRouterResponse;
      console.log("OpenRouterClient: Response data:", data);

      const generatedText = data.choices[0]?.message?.content;

      if (!generatedText) {
        console.error("OpenRouterClient: No content generated");
        throw new Error("No content generated from OpenRouter API");
      }

      console.log("OpenRouterClient: Successfully generated text");
      return generatedText;
    } catch (error) {
      console.error("OpenRouterClient: Error generating text:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate text: ${error.message}`);
      }
      throw new Error("An unknown error occurred while generating text");
    }
  }

  async generateMermaidCode(
    model: AIModel,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const response = await this.generateText(model, messages);

    // Extract mermaid code from markdown code blocks if present
    let mermaidCode = response;
    if (mermaidCode.includes("```mermaid")) {
      mermaidCode = mermaidCode.split("```mermaid")[1].split("```")[0].trim();
    } else if (mermaidCode.includes("```")) {
      mermaidCode = mermaidCode.split("```")[1].trim();
    }

    return mermaidCode;
  }
}

// Export a singleton instance
export const openRouterClient = new OpenRouterClient();
