export function isValidAPIKey(apiKey: string | null) {
  // length validation removed due to variable-length API keys.
  return apiKey?.startsWith("sk-");
}
