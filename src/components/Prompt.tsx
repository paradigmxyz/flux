import { Node } from "reactflow";

import { useState, useEffect, useRef } from "react";

import { Spinner, Text, Button } from "@chakra-ui/react";

import { EditIcon, ViewIcon } from "@chakra-ui/icons";

import TextareaAutosize from "react-textarea-autosize";

import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";
import { TextAndCodeBlock } from "./utils/TextAndCodeBlock";
import { FluxNodeData, FluxNodeType, Settings } from "../utils/types";
import { displayNameFromFluxNodeType } from "../utils/fluxNode";
import { LabeledSlider } from "./utils/LabeledInputs";
import { Row, Center, Column } from "../utils/chakra";
import { BigButton } from "./utils/BigButton";

export function Prompt({
  lineage,
  submitPrompt,
  onType,
  selectNode,
  newConnectedToSelectedNode,
  isGPT4,
  settings,
  setSettings,
}: {
  lineage: Node<FluxNodeData>[];
  onType: (text: string) => void;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  newConnectedToSelectedNode: (type: FluxNodeType) => void;
  isGPT4: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}) {
  const promptNode = lineage[0];

  const promptNodeType = promptNode.data.fluxNodeType;

  const onMainButtonClick = () => {
    if (promptNodeType === FluxNodeType.User) {
      submitPrompt();
    } else {
      newConnectedToSelectedNode(FluxNodeType.User);
    }
  };

  /*//////////////////////////////////////////////////////////////
                              STATE
  //////////////////////////////////////////////////////////////*/

  const [isEditing, setIsEditing] = useState(promptNodeType === FluxNodeType.User);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  /*//////////////////////////////////////////////////////////////
                              EFFECTS
  //////////////////////////////////////////////////////////////*/

  const textOffsetRef = useRef<number>(-1);

  // Scroll to the prompt buttons
  // when the bottom node is swapped.
  useEffect(() => {
    window.document
      .getElementById("promptButtons")
      ?.scrollIntoView(/* { behavior: "smooth" } */);

    // TODO: Really wish we didn't have to do this...
    // is there an optimization we can make somewhere?
    // Need a small timeout to ensure the text box is rendered.
    setTimeout(() => {
      const promptBox = window.document.getElementById(
        "promptBox"
      ) as HTMLTextAreaElement | null;

      // Focus the text box and move the cursor to chosen offset (defaults to end).
      promptBox?.setSelectionRange(textOffsetRef.current, textOffsetRef.current);
      promptBox?.focus();

      // Default to moving to the start of the text.
      textOffsetRef.current = -1;
    }, 50);

    // reset editing state
    setIsEditing(promptNodeType === FluxNodeType.User);
  }, [promptNode.id]);

  /*//////////////////////////////////////////////////////////////
                              APP
  //////////////////////////////////////////////////////////////*/

  return (
    <>
      {lineage
        .slice()
        .reverse()
        .map((node, i) => {
          const isLast = i === lineage.length - 1;

          const data = node.data;

          return (
            <Row
              mb={2}
              p={3}
              whiteSpace="pre-wrap" // Preserve newlines.
              mainAxisAlignment="flex-start"
              crossAxisAlignment="flex-start"
              borderRadius="6px"
              borderLeftWidth={isLast ? "4px" : "0px"}
              _hover={{
                boxShadow: isLast ? "none" : "0 0 0 0.5px #1a192b",
              }}
              borderColor={getFluxNodeTypeDarkColor(data.fluxNodeType)}
              position="relative"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              bg={getFluxNodeTypeColor(data.fluxNodeType)}
              key={node.id}
              onClick={
                isLast
                  ? undefined
                  : () => {
                      const selection = window.getSelection();

                      // We don't want to trigger the selection
                      // if they're just selecting/copying text.
                      if (selection?.isCollapsed) {
                        textOffsetRef.current = selection.anchorOffset ?? 0;

                        selectNode(node.id);
                      }
                    }
              }
              cursor={isLast && isEditing ? "text" : "pointer"}
            >
              {data.generating && data.text === "" ? (
                <Center expand>
                  <Spinner />
                </Center>
              ) : (
                <>
                  <Button
                    display={
                      hoveredNodeId === promptNode.id && promptNode.id === node.id
                        ? "block"
                        : "none"
                    }
                    onClick={() => setIsEditing(!isEditing)}
                    position="absolute"
                    top={1}
                    right={1}
                    zIndex={10}
                    variant="outline"
                    border="0px"
                    _hover={{ background: "none" }}
                    p="1"
                  >
                    {isEditing ? <ViewIcon boxSize={4} /> : <EditIcon boxSize={4} />}
                  </Button>
                  <Text fontWeight="bold" width="auto" whiteSpace="nowrap">
                    {displayNameFromFluxNodeType(data.fluxNodeType)}
                    :&nbsp;
                  </Text>
                  <Column
                    width="100%"
                    marginRight="30px"
                    whiteSpace="pre-wrap"
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment="flex-start"
                    borderRadius="6px"
                    wordBreak="break-word"
                    onClick={isEditing ? undefined : () => setIsEditing(true)}
                  >
                    {isLast && isEditing ? (
                      <TextareaAutosize
                        id="promptBox"
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          outline: "none",
                        }}
                        value={data.text ?? ""}
                        onChange={(e) => onType(e.target.value)}
                        placeholder={
                          data.fluxNodeType === FluxNodeType.User
                            ? "Write a poem about..."
                            : data.fluxNodeType === FluxNodeType.System
                            ? "You are ChatGPT..."
                            : undefined
                        }
                      />
                    ) : (
                      <TextAndCodeBlock text={data.text} />
                    )}
                  </Column>
                </>
              )}
            </Row>
          );
        })}

      <Row
        mainAxisAlignment="center"
        crossAxisAlignment="stretch"
        width="100%"
        height="100px"
        id="promptButtons"
      >
        <BigButton
          tooltip={promptNodeType === FluxNodeType.User ? "⌘⏎" : "⌘P"}
          onClick={onMainButtonClick}
          color={getFluxNodeTypeDarkColor(promptNodeType)}
          width="100%"
          height="100%"
          fontSize="lg"
        >
          {promptNodeType === FluxNodeType.User ? "Generate" : "Compose"}
          <Text fontWeight="extrabold">
            &nbsp;
            {promptNodeType === FluxNodeType.User
              ? displayNameFromFluxNodeType(FluxNodeType.GPT, isGPT4)
              : displayNameFromFluxNodeType(FluxNodeType.User, isGPT4)}
            &nbsp;
          </Text>
          response
        </BigButton>
      </Row>

      {promptNodeType === FluxNodeType.User ? (
        <>
          <LabeledSlider
            mt={3}
            label="Temperature (randomness)"
            value={settings.temp}
            setValue={(v) => setSettings({ ...settings, temp: v })}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={1.25}
            min={0}
            step={0.01}
          />

          <LabeledSlider
            mt={3}
            label="Number of Responses"
            value={settings.n}
            setValue={(v) => setSettings({ ...settings, n: v })}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={10}
            min={1}
            step={1}
          />
        </>
      ) : null}
    </>
  );
}
