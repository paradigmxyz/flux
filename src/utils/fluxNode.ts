import { Node, Edge } from "reactflow";

import { NEW_TREE_X_OFFSET, OVERLAP_RANDOMNESS_MAX } from "./constants";
import { FluxNodeType, FluxNodeData } from "./types";
import { getFluxNodeTypeColor } from "./color";
import { generateNodeId } from "./nodeId";

/*//////////////////////////////////////////////////////////////
                         CONSTRUCTORS
//////////////////////////////////////////////////////////////*/

export function newFluxNode({
  id,
  x,
  y,
  fluxNodeType,
  text,
  generating,
}: {
  id?: string;
  x: number;
  y: number;
  fluxNodeType: FluxNodeType;
  text: string;
  generating: boolean;
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
      generating,
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
    generating,
  }: {
    id?: string;
    x: number;
    y: number;
    fluxNodeType: FluxNodeType;
    text: string;
    generating: boolean;
  }
): Node<FluxNodeData>[] {
  const newNode = newFluxNode({ x, y, fluxNodeType, text, id, generating });

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
    generating: false,
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
      generating: false,
    })
  );

  return nodesCopy;
}

export function modifyFluxNodeType(
  existingNodes: Node<FluxNodeData>[],
  { id, type, draggable = true }: { id: string; type?: FluxNodeType; draggable?: boolean }
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
      copy.data.label = displayNameFromFluxNodeType(
        FluxNodeType.TweakedGPT,
        undefined,
        copy.data.label
      );
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

    const copy = { ...node, data: { ...node.data, label }, type };

    return copy;
  });
}

export function appendTextToFluxNodeAsGPT(
  existingNodes: Node<FluxNodeData>[],
  { id, text }: { id: string; text: string }
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    const copy = { ...node, data: { ...node.data } };

    copy.data.text += text;

    return copy;
  });
}

export function markFluxNodeAsDoneGenerating(
  existingNodes: Node<FluxNodeData>[],
  id: string
): Node<FluxNodeData>[] {
  return existingNodes.map((node) => {
    if (node.id !== id) return node;

    return { ...node, data: { ...node.data, generating: false } };
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

export function isFluxNodeInLineage(
  existingNodes: Node<FluxNodeData>[],
  existingEdges: Edge[],
  { nodeToCheck, nodeToGetLineageOf }: { nodeToCheck: string; nodeToGetLineageOf: string }
): boolean {
  const lineage = getFluxNodeLineage(existingNodes, existingEdges, nodeToGetLineageOf);

  return lineage.some((node) => node.id === nodeToCheck);
}

/*//////////////////////////////////////////////////////////////
                            RENDERERS
//////////////////////////////////////////////////////////////*/

export function displayNameFromFluxNodeType(
  fluxNodeType: FluxNodeType,
  isGPT4?: boolean,
  label?: string
) {
  switch (fluxNodeType) {
    case FluxNodeType.User:
      return "User";
    case FluxNodeType.GPT:
      return isGPT4 === undefined ? "GPT" : isGPT4 ? "GPT-4" : "GPT-3.5";
    case FluxNodeType.TweakedGPT:
      return `${label} (edited)`;
    case FluxNodeType.System:
      return "System";
    default:
      return "User";
  }
}
