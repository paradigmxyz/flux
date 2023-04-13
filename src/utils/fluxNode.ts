import { Node, Edge } from "reactflow";

import {
  NEW_TREE_X_OFFSET,
  OVERLAP_RANDOMNESS_MAX,
  STALE_STREAM_ERROR_MESSAGE,
  STREAM_CANCELED_ERROR_MESSAGE,
} from "./constants";
import { FluxNodeType, FluxNodeData, ReactFlowNodeTypes } from "./types";
import { getFluxNodeTypeColor } from "./color";
import { generateNodeId } from "./nodeId";
import { formatAutoLabel } from "./prompt";

/*//////////////////////////////////////////////////////////////
                         CONSTRUCTORS
//////////////////////////////////////////////////////////////*/

export function newFluxNode({
  id,
  x,
  y,
  fluxNodeType,
  text,
  streamId,
}: {
  id?: string;
  x: number;
  y: number;
  fluxNodeType: FluxNodeType;
  text: string;
  streamId?: string;
}): Node<FluxNodeData> {
  return {
    id: id ?? generateNodeId(),
    position: { x, y },
    style: {
      background: getFluxNodeTypeColor(fluxNodeType),
    },
    data: {
      label: displayNameFromFluxNodeType(fluxNodeType),
      fluxNodeType,
      text,
      streamId,
    },
  };
}

/*//////////////////////////////////////////////////////////////
                         TRANSFORMERS
//////////////////////////////////////////////////////////////*/

export function addFluxNode(
  existingNodes: Node<FluxNodeData>[],
  {
    id,
    x,
    y,
    fluxNodeType,
    text,
    streamId,
  }: {
    id?: string;
    x: number;
    y: number;
    fluxNodeType: FluxNodeType;
    text: string;
    streamId?: string;
  }
): Node<FluxNodeData>[] {
  const newNode = newFluxNode({ x, y, fluxNodeType, text, id, streamId });

  return [...existingNodes, newNode];
}

export function addUserNodeLinkedToASystemNode(
  nodes: Node<FluxNodeData>[],
  systemNodeText: string,
  userNodeText: string | null = "",
  systemId: string = generateNodeId(),
  userId: string = generateNodeId()
) {
  const nodesCopy = [...nodes];

  const systemNode = newFluxNode({
    id: systemId,
    x:
      nodesCopy.length > 0
        ? nodesCopy.reduce((prev, current) =>
            prev.position.x > current.position.x ? prev : current
          ).position.x + NEW_TREE_X_OFFSET
        : window.innerWidth / 2 / 2 - 75,
    y: 500,
    fluxNodeType: FluxNodeType.System,
    text: systemNodeText,
  });

  nodesCopy.push(systemNode);

  nodesCopy.push(
    newFluxNode({
      id: userId,
      x: systemNode.position.x,
      // Add OVERLAP_RANDOMNESS_MAX of randomness to
      // the y position so that nodes don't overlap.
      y: systemNode.position.y + 100 + Math.random() * OVERLAP_RANDOMNESS_MAX,
      fluxNodeType: FluxNodeType.User,
      text: userNodeText ?? "",
    })
  );

  return nodesCopy;
}

export function modifyReactFlowNodeProperties(
  existingNodes: Node<FluxNodeData>[],
  {
    id,
    type,
    draggable,
  }: { id: string; type: ReactFlowNodeTypes | undefined; draggable: boolean }
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = { ...node, data: { ...node.data }, type, draggable };

    return copy;
  });
}

export function modifyFluxNodeText(
  existingNodes: Node<FluxNodeData>[],
  { asHuman, id, text }: { asHuman: boolean; id: string; text: string }
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = { ...node, data: { ...node.data } };

    copy.data.text = text;

    // If the node's fluxNodeType is GPT and we're changing
    // it as a human then its type becomes GPT + Human.
    if (asHuman && copy.data.fluxNodeType === FluxNodeType.GPT) {
      copy.style = {
        ...copy.style,
        background: getFluxNodeTypeColor(FluxNodeType.TweakedGPT),
      };

      copy.data.fluxNodeType = FluxNodeType.TweakedGPT;
    }

    // Generate auto label based on prompt text, and preserve custom label
    if (!copy.data.hasCustomlabel) {
      copy.data.label = copy.data.text
        ? formatAutoLabel(copy.data.text)
        : displayNameFromFluxNodeType(copy.data.fluxNodeType);
    }

    return copy;
  });
}

export function modifyFluxNodeLabel(
  existingNodes: Node<FluxNodeData>[],
  { id, type, label }: { id: string; type?: FluxNodeType; label: string }
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = {
      ...node,
      data: { ...node.data, label, hasCustomlabel: true },
      type,
      draggable: undefined,
    };

    return copy;
  });
}

export function setFluxNodeStreamId(
  existingNodes: Node<FluxNodeData>[],
  { id, streamId }: { id: string; streamId: string | undefined }
) {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    return { ...node, data: { ...node.data, streamId } };
  });
}

export function appendTextToFluxNodeAsGPT(
  existingNodes: Node<FluxNodeData>[],
  { id, text, streamId }: { id: string; text: string; streamId: string }
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    // If the node's streamId is now undefined, the stream has been canceled.
    if (node.data.streamId === undefined) throw new Error(STREAM_CANCELED_ERROR_MESSAGE);

    // If the node's streamId is not undefined but does
    // not match the provided id, the stream is now stale.
    if (node.data.streamId !== streamId) throw new Error(STALE_STREAM_ERROR_MESSAGE);

    const copy = { ...node, data: { ...node.data } };

    const isFirstToken = copy.data.text.length === 0;

    copy.data.text += text;

    // Preserve custom labels
    if (copy.data.hasCustomlabel) return copy;

    // If label hasn't reached max length or it's a new prompt, set from text.
    // Once label reaches max length, truncate it.
    if (!copy.data.label.endsWith(" ...") || isFirstToken) {
      copy.data.label = formatAutoLabel(copy.data.text);
    }

    return copy;
  });
}

export function deleteFluxNode(
  existingNodes: Node<FluxNodeData>[],
  id: string
): Node<FluxNodeData>[] {
  return existingNodes.filter((node) => node.id !== id);
}

export function deleteSelectedFluxNodes(
  existingNodes: Node<FluxNodeData>[]
): Node<FluxNodeData>[] {
  return existingNodes.filter((node) => !node.selected);
}

export function markOnlyNodeAsSelected(
  existingNodes: Node<FluxNodeData>[],
  id: string
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    return { ...node, selected: node.id === id };
  });
}

/*//////////////////////////////////////////////////////////////
                            GETTERS
//////////////////////////////////////////////////////////////*/

export function getFluxNode(
  nodes: Node<FluxNodeData>[],
  id: string
): Node<FluxNodeData> | undefined {
  return nodes.find((node) => node.id === id);
}

export function getFluxNodeGPTChildren(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  id: string
): Node<FluxNodeData>[] {
  return existingNodes.filter(
    (node) =>
      (node.data.fluxNodeType === FluxNodeType.GPT ||
        node.data.fluxNodeType === FluxNodeType.TweakedGPT) &&
      getFluxNodeParent(existingNodes, existingEdges, node.id)?.id === id
  );
}

export function getFluxNodeChildren(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  id: string
) {
  return existingNodes.filter(
    (node) => getFluxNodeParent(existingNodes, existingEdges, node.id)?.id === id
  );
}

export function getFluxNodeSiblings(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  id: string
): Node<FluxNodeData>[] {
  const parent = getFluxNodeParent(existingNodes, existingEdges, id);

  if (!parent) return [];

  return getFluxNodeChildren(existingNodes, existingEdges, parent.id);
}

export function getFluxNodeParent(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  id: string
): Node<FluxNodeData> | undefined {
  let edge: Edge | undefined;

  // We iterate in reverse to ensure we don't try to route
  // through a stale (now hidden) edge to find the parent.
  for (let i = existingEdges.length - 1; i >= 0; i--) {
    const e = existingEdges[i];

    if (e.target === id) {
      edge = e;
      break;
    }
  }

  if (!edge) return;

  return existingNodes.find((node) => node.id === edge!.source);
}

// Get the lineage of the node,
// where index 0 is the node,
// index 1 is the node's parent,
// index 2 is the node's grandparent, etc.
// TODO: Eventually would be nice to have
// support for connecting multiple parents!
export function getFluxNodeLineage(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  id: string
): Node<FluxNodeData>[] {
  const lineage: Node<FluxNodeData>[] = [];

  let currentNode = getFluxNode(existingNodes, id);

  while (currentNode) {
    lineage.push(currentNode);

    currentNode = getFluxNodeParent(existingNodes, existingEdges, currentNode.id);
  }

  return lineage;
}

// returns all the edges for a given nodes
export function getEdgesForFluxNodes(
  nodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
): Edge[] {
  const edges: Edge[] = [];

    existingEdges.forEach((edge) => {
      if (nodes.find((node) => node.id === edge.source) && nodes.find((node) => node.id === edge.target)) {
        edges.push(edge);
      }
    });

  return edges;
}

export function isFluxNodeInLineage(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  { nodeToCheck, nodeToGetLineageOf }: { nodeToCheck: string; nodeToGetLineageOf: string }
): boolean {
  const lineage = getFluxNodeLineage(existingNodes, existingEdges, nodeToGetLineageOf);

  return lineage.some((node) => node.id === nodeToCheck);
}

export function getConnectionAllowed(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  { source, target }: { source: string; target: string }
): boolean {
  return (
    // Check the lineage of the source node to make
    // sure we aren't creating a recursive connection.
    !isFluxNodeInLineage(existingNodes, existingEdges, {
      nodeToCheck: target,
      nodeToGetLineageOf: source,
      // Check if the target node already has a parent.
    }) && getFluxNodeParent(existingNodes, existingEdges, target) === undefined
  );
}

/*//////////////////////////////////////////////////////////////
                            RENDERERS
//////////////////////////////////////////////////////////////*/

export function displayNameFromFluxNodeType(
  fluxNodeType: FluxNodeType,
  isGPT4?: boolean
): string {
  switch (fluxNodeType) {
    case FluxNodeType.User:
      return "User";
    case FluxNodeType.GPT:
      return isGPT4 === undefined ? "GPT" : isGPT4 ? "GPT-4" : "GPT-3.5";
    case FluxNodeType.TweakedGPT:
      return displayNameFromFluxNodeType(FluxNodeType.GPT, isGPT4) + " (edited)";
    case FluxNodeType.System:
      return "System";
  }
}
