import { CloseIcon } from "@chakra-ui/icons";
import { Box, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Row } from "../../utils/chakra";
import { modifyFluxNodeLabel, modifyFluxNodeType } from "../../utils/fluxNode";
import { FluxNodeData } from "../../utils/types";
import { useHotkeys } from "react-hotkeys-hook";
import { HOTKEY_CONFIG } from "../../utils/constants";

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
  const renameBlockRef = useRef<HTMLInputElement>(null);
  const renameInputId = `rename-${id}`;

  const cancel = () => {
    setNodes((nodes) =>
      // Reset the node type to the original type
      modifyFluxNodeType(nodes, {
        id,
      })
    );
  };

  const renameNode = () => {
    setNodes((nodes) =>
      modifyFluxNodeLabel(nodes, {
        id,
        label: renameLabel,
      })
    );
  };

  useHotkeys("return", renameNode, HOTKEY_CONFIG);
  useHotkeys("escape", cancel, HOTKEY_CONFIG);

  useEffect(() => {
    function handleClick(event: any) {
      if (renameBlockRef.current && !renameBlockRef.current.contains(event.target)) {
        renameNode();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClick);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClick);
    };
  }, [renameBlockRef]);

  useEffect(() => {
    // select the input element on mount
    const input = document.getElementById(renameInputId) as HTMLInputElement;
    input.select();
  }, []);

  return (
    <Box width={150} height={38} ref={renameBlockRef}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Row mainAxisAlignment="center" crossAxisAlignment="center" height="100%" px={2}>
        <Input
          id={renameInputId}
          value={renameLabel}
          onChange={(e: any) => setRenameLabel(e.target.value)}
          textAlign="center"
          size="xs"
          px={6}
          className="nodrag"
        />

        <Row
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
            _hover={{ backgroundColor: "gray.300" }}
            onClick={cancel}
          />
        </Row>
      </Row>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </Box>
  );
}
