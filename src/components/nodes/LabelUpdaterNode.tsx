import { CloseIcon } from "@chakra-ui/icons";
import { Box, Input } from "@chakra-ui/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Row } from "../../utils/chakra";
import { modifyFluxNodeLabel, modifyFluxNodeType } from "../../utils/fluxNode";
import { FluxNodeData } from "../../utils/types";

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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    renameNode();
  };

  useEffect(() => {
    function handleClick(event: any) {
      if (renameBlockRef.current && !renameBlockRef.current.contains(event.target)) {
        cancel();
      }
    }
    function handleClose(event: any) {
      if (event.key === "Escape") cancel();
    }

    // Bind the event listeners
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleClose);
    return () => {
      // Unbind the event listeners on clean up
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleClose);
    };
  }, [renameBlockRef]);

  useEffect(() => {
    // select the input element on mount
    const input = renameBlockRef.current?.querySelector("input");
    if (input) {
      input.select();
    }
  }, []);

  return (
    <Box width={150} height={38} ref={renameBlockRef}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Row mainAxisAlignment="center" crossAxisAlignment="center" height="100%" px={2}>
        <form style={{ marginBottom: "2px" }} onSubmit={submit}>
          <Input
            value={renameLabel}
            onChange={(e: any) => setRenameLabel(e.target.value)}
            textAlign="center"
            size="xs"
            className="nodrag"
            px={6}
          />
        </form>

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
