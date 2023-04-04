import { FluxNodeData, FluxNodeType, Settings } from "./types";
import { ChatCompletionRequestMessage } from "openai-streams";
import { MAX_AUTOLABEL_CHARS } from "./constants";
import { Node } from "reactflow";

export function messagesFromLineage(
  lineage: Node<FluxNodeData>[],
  settings: Settings
): ChatCompletionRequestMessage[] {
  const messages: ChatCompletionRequestMessage[] = [];

  // Iterate backwards.
  for (let i = lineage.length - 1; i >= 0; i--) {
    const node = lineage[i];

    if (node.data.fluxNodeType === FluxNodeType.System) {
      messages.push({
        role: "system",
        content: node.data.text,
      });
    } else if (i === lineage.length - 1) {
      // If this is the first node and it's
      // not a system node, we'll push the
      // default preamble on there.
      messages.push({
        role: "system",
        content: settings.defaultPreamble,
      });
    }

    if (node.data.fluxNodeType === FluxNodeType.User) {
      messages.push({
        role: "user",
        content: node.data.text,
      });
    } else if (
      node.data.fluxNodeType === FluxNodeType.TweakedGPT ||
      node.data.fluxNodeType === FluxNodeType.GPT
    ) {
      messages.push({
        role: "assistant",
        content: node.data.text,
      });
    }
  }

  console.table(messages);

  return messages;
}

export function promptFromLineage(
  lineage: Node<FluxNodeData>[],
  settings: Settings,
  endWithNewlines: boolean = false
): string {
  const messages = messagesFromLineage(lineage, settings);

  let prompt = "";

  messages.forEach((message, i) => {
    prompt += `${message.role}: ${message.content}`;

    if (endWithNewlines ? true : i !== messages.length - 1) {
      prompt += "\n\n";
    }
  });

  return prompt;
}

export function formatAutoLabel(text: string) {
  const formattedText = removeInvalidChars(text);

  return formattedText.length > MAX_AUTOLABEL_CHARS
    ? formattedText.slice(0, MAX_AUTOLABEL_CHARS).split(" ").slice(0, -1).join(" ") +
        " ..."
    : formattedText;
}

function removeInvalidChars(text: string) {
  // The regular expression pattern:
  // ^: not
  // a-zA-Z0-9: letters and numbers
  // .,?!: common punctuation marks
  // \s: whitespace characters (space, tab, newline, etc.)
  const regex = /[^a-zA-Z0-9.,'?!-\s]+/g;

  // Replace `\n` with spaces and remove invalid characters
  const cleanedStr = text.replaceAll("\n", " ").replace(regex, "");

  return cleanedStr;
}
