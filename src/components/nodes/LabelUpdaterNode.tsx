import { useEffect, useState } from "react";

import { Box, Input } from "@chakra-ui/react";

import { Handle, Position, useReactFlow } from "reactflow";

import { Row } from "../../utils/chakra";
import { FluxNodeData } from "../../utils/types";
import { modifyFluxNodeLabel, modifyReactFlowNodeProperties } from "../../utils/fluxNode";

export function LabelUpdaterNode({
  id,
  data,
  isConnectable,
}: {
  id: string;
  data: FluxNodeData;
  isConnectable: boolean;
}) {
  const { setNodes } = useReactFlow();

  const [renameLabel, setRenameLabel] = useState(data.label);

  const inputId = `renameInput-${id}`;

  // Select the input element on mount.
  useEffect(() => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;

    // Have to do this with a bit of a delay to
    // ensure it works when triggered via navbar.
    setTimeout(() => input?.select(), 50);
  }, []);

  const cancel = () => {
    setNodes((nodes) =>
      // Reset the node type to the default
      // type and make it draggable again.
      modifyReactFlowNodeProperties(nodes, {
        id,
        type: undefined,
        draggable: true,
      })
    );
  };

  const submit = () => {
    setNodes((nodes) =>
      modifyFluxNodeLabel(nodes, {
        id,
        label: renameLabel,
      })
    );
  };

  return (
    <Box width="150px" height="38px">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Row mainAxisAlignment="center" crossAxisAlignment="center" height="100%" px={2}>
        <Input
          onBlur={cancel}
          id={inputId}
          value={renameLabel}
          onChange={(e: any) => setRenameLabel(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" ? submit() : e.key === "Escape" && cancel()
          }
          className="nodrag" // https://reactflow.dev/docs/api/nodes/custom-nodes/#prevent-dragging--selecting
          textAlign="center"
          size="xs"
          // px={6}
        />

        {/* <Row
          mainAxisAlignment="center"
          crossAxisAlignment="center"
          position="absolute"
          top={0}
          right="14px"
          height="100%"
          zIndex={1}
        >
          <CloseIcon
            rounded="sm"
            p={1}
            cursor="pointer"
            _hover={{ backgroundColor: "none" }}
            onClick={cancel}
          />
        </Row> */}
      </Row>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </Box>
  );
}
