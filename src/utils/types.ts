import { Node, Edge } from "reactflow";

import { ChatCompletionResponseMessage } from "openai-streams";

export type FluxNodeData = {
  label: string;
  fluxNodeType: FluxNodeType;
  text: string;
  streamId?: string;
  hasCustomlabel?: boolean;
};

export enum FluxNodeType {
  System = "System",
  User = "User",
  GPT = "GPT",
  TweakedGPT = "GPT (tweaked)",
}

export type Settings = {
  defaultPreamble: string;
  autoZoom: boolean;
  model: string;
  temp: number;
  n: number;
};

export enum ReactFlowNodeTypes {
  LabelUpdater = "LabelUpdater",
}

// The stream response is weird and has a delta instead of message field.
export interface CreateChatCompletionStreamResponseChoicesInner {
  index?: number;
  delta?: ChatCompletionResponseMessage;
  finish_reason?: string;
}

export type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  lastSelectedNodeId: string | null;
};
