export function isValidAPIKey(apiKey: string | null) {
  return apiKey.startsWith("sk-") || apiKey.startsWith("sk-proj-");
}
