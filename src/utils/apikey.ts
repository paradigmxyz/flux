import { API_KEY_LOCAL_STORAGE_KEY } from "./constants";

export function isValidAPIKey(apiKey: string | null) {
  return apiKey?.length == 51 && apiKey?.startsWith("sk-");
}

export async function checkModelAccess(model: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY_LOCAL_STORAGE_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const models = data.data;
      return models.some((m: { id: string }) => m.id === model);
    } else {
      console.error("Error fetching models:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error fetching models:", error);
    return false;
  }
}