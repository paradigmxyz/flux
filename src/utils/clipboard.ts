import { Node } from "reactflow";
import { promptFromLineage } from "./prompt";
import { FluxNodeData, Settings } from "./types";

export const copySnippetToClipboard = async (code: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard", err);
    return false;
  }
};

export const copyMessagesToClipboard = (
  selectedNodeLineage: Array<Node<FluxNodeData>>,
  settings: Settings
) => () => {
  const messages = promptFromLineage(selectedNodeLineage, settings);

  if (messages) navigator.clipboard.writeText(messages);
};