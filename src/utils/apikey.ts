export function isValidAPIKey(apiKey: string | null) {
  return apiKey?.startsWith("sk-"); // remove length validation.
}
