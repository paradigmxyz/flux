export function generateNodeId(): string {
  return Math.random().toString().replace("0.", "");
}
