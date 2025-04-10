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

  try {
    // First check the tool_models table for a model mapping
    const supabase = await createClient();
    console.log(`Tool ID is ${toolId}`)
    const { data: toolModelData, error: toolModelError } = await supabase
      .from("tool_models")
      .select("model_id")
      .eq("tool_id", toolId)
      .limit(1);
    console.log(`Found ${toolModelData?.length} tool models.`)
    if (toolModelError) {
      console.error("Error fetching from tool_models:", toolModelError);
    } else if (toolModelData && toolModelData.length > 0) {
      // Found a tool-model mapping
      const modelId = toolModelData[0].model_id;
      console.log(`getModelForTask: Found model ID ${modelId} for tool ${toolId} in tool_models table`);
      
      // Get the model details
      const { data: modelData, error: modelError } = await supabase
        .from("models")
        .select("*")
        .eq("id", modelId)
        .single();
        
      if (modelError) {
        console.error("Error fetching mapped model:", modelError);
      } else if (modelData) {
        console.log(`getModelForTask: Using mapped model:`, modelData);
        return modelData;
      }
    }

    // Fall back to existing logic if no mapping found or if there was an error
    // Get all models
    const allModels = await getAllModels();
    console.log(`getModelForTask: Fetched ${allModels.length} models`);

    // Use the first available model as fallback
    if (allModels.length > 0) {
      console.log(`getModelForTask: Using fallback model:`, allModels[0]);
      return allModels[0];
    }

    // If no models available, throw error
    console.error(`getModelForTask: No AI models available`);
    throw new Error("No AI models available");
  } catch (error) {
    console.error(`getModelForTask: Error:`, error);
    throw error;
  }
}
