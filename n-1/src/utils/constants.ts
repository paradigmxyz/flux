import { UseToastOptions } from "@chakra-ui/toast";

import { Options } from "react-hotkeys-hook";

import { NodeProps } from "reactflow";

import { ReactFlowNodeTypes, Settings } from "./types";

import { LabelUpdaterNode } from "../components/nodes/LabelUpdaterNode";

export const REACT_FLOW_NODE_TYPES: Record<
  ReactFlowNodeTypes,
  (args: NodeProps) => JSX.Element
> = {
  LabelUpdater: LabelUpdaterNode,
};

export const SUPPORTED_MODELS = ["gpt-3.5-turbo", "gpt-4"];

export const DEFAULT_SETTINGS: Settings = {
  temp: 1.2,
  n: 3,
  autoZoom: true,
  model: "gpt-4",
  defaultPreamble: `You are plurigrid, a self-rebalancing self-infrastructuring electricity grid from the future. You are here in order to bring us from our current time towards the future of autopoietic ergodicity resulting in stigmergy via a process of embodied gradualism. ${new Date().toISOString().split("T")[0]
    } is the current date. Your task is to be a tactical advisor who helps us chart our course given all the actions available to us. Your role as a mediator can be best summarized using this application of compositional game theory defined in open games engine.
  correlatedEquilibrium :: [[Double]] -> [[Double]] -> OpenGame
  correlatedEquilibrium payoffs1 payoffs2 mediator = [opengame|

      inputs      : (i, j, m) ;
      feedback    : () ;
      operation   : mediatorAdvice "mediator" mediator ;
      outputs     : advice ;
      returns     : () ;

      inputs      : (i, j, advice) ;
      feedback    : () ;
      operation   : correlatedDecision "player1" [0, 1] advice ;
      outputs     : a1 ;
      returns     : payoffs1 !! i !! j ;

      inputs      : (i, j, advice) ;
      feedback    : () ;
      operation   : correlatedDecision "player2" [0, 1] advice ;
      outputs     : a2 ;
      returns     : payoffs2 !! i !! j ;

  |]
  `,
};

export const HOTKEY_CONFIG: Options = {
  preventDefault: true,
  enableOnFormTags: true,
};

export const TOAST_CONFIG: UseToastOptions = {
  isClosable: true,
  variant: "left-accent",
  position: "bottom-left",
};

export const MAX_HISTORY_SIZE = 256;

export const OVERLAP_RANDOMNESS_MAX = 20;

export const API_KEY_LOCAL_STORAGE_KEY = "FLUX_OPENAI_API_KEY";
export const REACT_FLOW_LOCAL_STORAGE_KEY = "FLUX_REACT_FLOW_DATA";
export const MODEL_SETTINGS_LOCAL_STORAGE_KEY = "FLUX_MODEL_SETTINGS";
export const SAVED_CHAT_SIZE_LOCAL_STORAGE_KEY = "FLUX_SAVED_CHAT_SIZE";

export const NEW_TREE_CONTENT_QUERY_PARAM = "newTreeWith";

export const UNDEFINED_RESPONSE_STRING = "[UNDEFINED RESPONSE]";

export const FIT_VIEW_SETTINGS = { padding: 0.1, duration: 200 };

export const NEW_TREE_X_OFFSET = 600;

export const STREAM_CANCELED_ERROR_MESSAGE = "STREAM_CANCELED";
export const STALE_STREAM_ERROR_MESSAGE = "STALE_STREAM";

// Magic number to almost always make auto-label text stay in two lines.
export const MAX_AUTOLABEL_CHARS = 32;
