export function isValidAPIKey(apiKey: string | null) {
  return apiKey?.length == 89 && apiKey?.startsWith("sk-");
}
