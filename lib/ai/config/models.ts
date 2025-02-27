import { createClient } from "@/utils/supabase/server";

export interface AIModel {
  id: string;
  display_name: string;
  api_string: string;
  description: string;
  supports_vision: boolean;
  supports_thinking: boolean;
}

// Cache for models to avoid frequent database calls
let modelsCache: AIModel[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

/**
 * Fetches all models from the database
 */
export async function getAllModels(): Promise<AIModel[]> {
  const now = Date.now();

  // Return cached models if available and not expired
  if (modelsCache && now - lastFetchTime < CACHE_TTL) {
    return modelsCache;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("models").select("*");

    if (error) {
      console.error("Error fetching models:", error);
      throw error;
    }

    // Update cache
    modelsCache = data;
    lastFetchTime = now;

    return data;
  } catch (error) {
    console.error("Failed to fetch models:", error);
    // If cache exists, return it even if expired
    if (modelsCache) {
      return modelsCache;
    }
    // Fallback to empty array if no cache
    return [];
  }
}

/**
 * Gets a model by its API string
 */
export async function getModelByApiString(
  apiString: string
): Promise<AIModel | undefined> {
  const models = await getAllModels();
  return models.find((model) => model.api_string === apiString);
}

export type AITask = "mermaid" | "code" | "text" | "handbook" | string;

// Task to model mapping - this could also be moved to the database in the future
export const modelPreferences: Record<AITask, string[]> = {
  mermaid: ["google/gemini-2.0-flash-001"], // Preferred models in order by API string
  code: ["google/gemini-2.0-flash-001"],
  text: ["google/gemini-2.0-flash-001"],
  handbook: ["google/gemini-2.0-flash-001"],
  chat: ["google/gemini-2.0-flash-001"],
};

/**
 * Gets the appropriate model for a specific task
 */
export async function getModelForTask(task: AITask): Promise<AIModel> {
  console.log(`getModelForTask: Getting model for task: ${task}`);

  const preferredApiStrings =
    modelPreferences[task] || modelPreferences["text"];
  console.log(`getModelForTask: Preferred API strings:`, preferredApiStrings);

  console.log(`getModelForTask: Fetching all models`);
  const allModels = await getAllModels();
  console.log(
    `getModelForTask: All models:`,
    allModels.map((m) => m.api_string)
  );

  // Find the first available preferred model
  for (const apiString of preferredApiStrings) {
    console.log(
      `getModelForTask: Looking for model with API string: ${apiString}`
    );
    const model = allModels.find((m) => m.api_string === apiString);
    if (model) {
      console.log(`getModelForTask: Found model:`, model);
      return model;
    }
  }

  // Fallback to first available model
  if (allModels.length > 0) {
    console.log(`getModelForTask: Using fallback model:`, allModels[0]);
    return allModels[0];
  }

  // If no models available, throw error
  console.error(`getModelForTask: No AI models available`);
  throw new Error("No AI models available");
}
