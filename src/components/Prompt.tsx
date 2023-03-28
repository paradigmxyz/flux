import { useEffect, useRef } from "react";

import { Node } from "reactflow";

import { Spinner, Text, Button } from "@chakra-ui/react";

import TextareaAutosize from "react-textarea-autosize";

import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";
import { FluxNodeData, FluxNodeType, Settings } from "../utils/types";
import { displayNameFromFluxNodeType } from "../utils/fluxNode";
import { LabeledSlider } from "./utils/LabeledInputs";
import { Row, Center } from "../utils/chakra";
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
                              EFFECTS
  //////////////////////////////////////////////////////////////*/

  const textOffsetRef = useRef<number>(-1);

  // Scroll to the prompt buttons
  // when the bottom node is swapped.
  useEffect(() => {
    window.document
      .getElementById("promptButtons")
      ?.scrollIntoView(/* { behavior: "smooth" } */);

    const promptBox = window.document.getElementById(
      "promptBox"
    ) as HTMLTextAreaElement | null;

    // Focus the text box and move the cursor to chosen offset (defaults to end).
    promptBox?.setSelectionRange(textOffsetRef.current, textOffsetRef.current);
    promptBox?.focus();

    // Default to moving to the start of the text.
    textOffsetRef.current = -1;
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
              borderColor={getFluxNodeTypeDarkColor(data.fluxNodeType)}
              bg={getFluxNodeTypeColor(data.fluxNodeType)}
              key={node.id}
              {...(!isLast
                ? {
                    onClick: () => {
                      const selection = window.getSelection();

                      // We don't want to trigger the selection
                      // if they're just selecting/copying text.
                      if (selection?.isCollapsed) {
                        textOffsetRef.current = selection.anchorOffset ?? 0;

                        selectNode(node.id);
                      }
                    },
                    cursor: "pointer",
                  }
                : {})}
            >
              {data.generating && data.text === "" ? (
                <Center expand>
                  <Spinner />
                </Center>
              ) : (
                <>
                  <Text fontWeight="bold" width="auto" whiteSpace="nowrap">
                    {displayNameFromFluxNodeType(data.fluxNodeType)}
                    :&nbsp;
                  </Text>
                  {isLast ? (
                    <>
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
                      {/* //TODO: utilize whisper here to transcribe audio. */}
                      {data.fluxNodeType === FluxNodeType.User && (
                        <Button marginLeft={2} alignSelf="end">Transcribe</Button>
                      )}
                      {/* //TODO: utilize elevenlabs here to transcribe audio. */}
                      {(data.fluxNodeType === FluxNodeType.GPT ||
                        data.fluxNodeType === FluxNodeType.TweakedGPT) && (
                        <Button marginLeft={2} alignSelf="end">Listen</Button>
                      )}
                    </>
                  ) : (
                    <>
                      {data.text}
                      {/* //TODO: utilize elevenlabs here to transcribe audio. */}
                      {(data.fluxNodeType === FluxNodeType.GPT ||
                        data.fluxNodeType === FluxNodeType.TweakedGPT) && (
                        <Button marginLeft={2} alignSelf="end">Listen</Button>
                      )}
                    </>
                  )}
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
