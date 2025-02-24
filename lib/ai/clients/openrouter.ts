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
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model.id,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as OpenRouterError;
        throw new Error(
          `OpenRouter API error: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = (await response.json()) as OpenRouterResponse;
      const generatedText = data.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error("No content generated from OpenRouter API");
      }

      return generatedText;
    } catch (error) {
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
