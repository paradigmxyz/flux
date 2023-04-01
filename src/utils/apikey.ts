export function isValidAPIKey(apiKey: string | null) {
  return apiKey?.length === 51 && apiKey?.startsWith("sk-");
}
