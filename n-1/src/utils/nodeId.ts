export function generateNodeId(): string {
  return Math.random().toString().replace("0.", "");
}

export function generateStreamId(): string {
  return Math.random().toString().replace("0.", "");
}
