export function isValidAPIKey(apiKey: string | null) {
  return apiKey?.length ?? 0 >= 50; // No idea what Hyperbolic's key spec is, but this is a safe bet.
}
