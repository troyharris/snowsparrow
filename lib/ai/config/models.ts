import { createClient } from "@/utils/supabase/server";
import { AIModel } from "@/lib/types";

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

/**
 * Gets the appropriate model for a specific tool
 */
export async function getModelForTask(toolId: string): Promise<AIModel> {
  console.log(`getModelForTask: Getting model for tool ID: ${toolId}`);

  // Get all models
  const allModels = await getAllModels();
  console.log(`getModelForTask: Fetched ${allModels.length} models`);

  // Find the first model that supports this tool
  // For now, we'll use the first available model since we haven't implemented tool-specific model preferences yet
  // In the future, we could add a tool_models table to specify which models are preferred for each tool
  if (allModels.length > 0) {
    console.log(`getModelForTask: Using model:`, allModels[0]);
    return allModels[0];
  }

  // If no models available, throw error
  console.error(`getModelForTask: No AI models available`);
  throw new Error("No AI models available");
}
