export const copyToClipboard = async (code: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard", err);
    return false;
  }
};