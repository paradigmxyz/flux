import { MIXPANEL_TOKEN } from "../main";
import mixpanel from "mixpanel-browser";

export const copySnippetToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    if (MIXPANEL_TOKEN) mixpanel.track("Copied to clipboard");

    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard", err);
    return false;
  }
};
