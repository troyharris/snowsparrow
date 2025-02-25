export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  costPer1kTokens: number;
  strengths: string[];
}

export const models: Record<string, AIModel> = {
  "gemini-2-flash": {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    contextWindow: 32000,
    costPer1kTokens: 0.0005,
    strengths: [
      "Fast response time",
      "Good at structured output",
      "Cost effective",
      "Large context window",
    ],
  },
  // Add more models as needed
};

export const getModelById = (modelId: string): AIModel | undefined => {
  return Object.values(models).find((model) => model.id === modelId);
};

export type AITask = "mermaid" | "code" | "text" | "handbook" | string;

export const modelPreferences: Record<AITask, string[]> = {
  mermaid: ["gemini-2-flash"], // Preferred models in order
  code: ["gemini-2-flash"],
  text: ["gemini-2-flash"],
  handbook: ["gemini-2-flash"],
};

export const getModelForTask = (task: AITask): AIModel => {
  const preferredModels = modelPreferences[task] || modelPreferences["text"];

  // Find the first available preferred model
  for (const modelKey of preferredModels) {
    if (models[modelKey]) {
      return models[modelKey];
    }
  }

  // Fallback to default model
  return models["gemini-2-flash"];
};
