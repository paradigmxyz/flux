import { Edge } from "reactflow";

/*//////////////////////////////////////////////////////////////
                          CONSTRUCTORS
//////////////////////////////////////////////////////////////*/

export function newFluxEdge({
  source,
  target,
  animated,
}: {
  source: string;
  target: string;
  animated: boolean;
}): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated,
  };
}

/*//////////////////////////////////////////////////////////////
                          TRANSFORMERS
//////////////////////////////////////////////////////////////*/

export function addFluxEdge(
  existingEdges: Edge[],
  { source, target, animated }: { source: string; target: string; animated: boolean }
): Edge[] {
  const newEdge = newFluxEdge({ source, target, animated });

  return [...existingEdges, newEdge];
}

export function modifyFluxEdge(
  existingEdges: Edge[],
  { source, target, animated }: { source: string; target: string; animated: boolean }
): Edge[] {
  return existingEdges.map((edge) => {
    if (edge.id !== `${source}-${target}`) return edge;

    const copy = { ...edge };

    copy.animated = animated;

    return copy;
  });
}
