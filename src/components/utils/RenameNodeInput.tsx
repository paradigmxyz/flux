import { Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Node } from "reactflow";
import { Column, Row } from "../../utils/chakra";
import { LabeledInput } from "./LabeledInputs";

export function RenameNodeInput({
  selectedNode,
  renameNode,
  setNodeToRename,
}: {
  selectedNode: Node;
  renameNode: (node: Node, label: string) => void;
  setNodeToRename: (node?: Node) => void;
}) {
  const [renameLabel, setRenameLabel] = useState(selectedNode.data.label);
  const renameBlockRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(event: any) {
      if (renameBlockRef.current && !renameBlockRef.current.contains(event.target)) {
        setNodeToRename(undefined);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClick);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClick);
    };
  }, [renameBlockRef]);

  const reset = () => {
    setNodeToRename(undefined);
  };

  return (
    <Row
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      width="full"
      margin="auto"
      position="absolute"
      top={90}
      zIndex={1}
      px={2}
      cursor="pointer"
    >
      <div ref={renameBlockRef}>
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="center">
          <LabeledInput
            label="Rename node"
            aria-label="test"
            value={renameLabel}
            setValue={setRenameLabel}
            backgroundColor="white"
          />
          <Row
            width={200}
            mainAxisAlignment="space-between"
            crossAxisAlignment="center"
            pt={4}
          >
            <Button onClick={() => reset()}>Cancel</Button>
            <Button onClick={() => renameNode(selectedNode, renameLabel)}>Rename</Button>
          </Row>
        </Column>
      </div>
    </Row>
  );
}
