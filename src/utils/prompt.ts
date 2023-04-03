import { Node } from "reactflow";

import { ChatCompletionRequestMessage } from "openai-streams";

import { FluxNodeData, FluxNodeType, Settings } from "./types";
import { MAX_AUTOLABEL_CHARS } from "./constants";

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

  console.log(prompt);

  return prompt;
}

export function formatAutoLabel(unformattedText: string) {
  const text = removeInvalidChars(unformattedText);

  return text.length > MAX_AUTOLABEL_CHARS
    ? text.slice(0, MAX_AUTOLABEL_CHARS).split(" ").slice(0, -1).join(" ") + " ..."
    : text;
}

function removeInvalidChars(text: string) {
  // The regular expression pattern:
  // ^: not
  // a-zA-Z0-9: letters and numbers
  // .,?!: common punctuation marks
  // \s: whitespace characters (space, tab, newline, etc.)
  const regex = /[^a-zA-Z0-9.,?!-\s]+/g;

  // Replace invalid characters with an empty string
  const cleanedStr = text.replaceAll("\n", " ").replace(regex, "");

  return cleanedStr;
}
