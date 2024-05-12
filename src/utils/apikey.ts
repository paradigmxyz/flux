export function isValidAPIKey(apiKey: string | null) {
  return (apiKey?.length === 51 && apiKey.startsWith("sk-")) || (apiKey?.length === 56 && apiKey.startsWith("sk-proj-"));
}
