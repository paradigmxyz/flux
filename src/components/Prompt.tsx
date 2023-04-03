import { MIXPANEL_TOKEN } from "../main";
import { Row, Center, Column } from "../utils/chakra";
import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";
import { displayNameFromFluxNodeType, setFluxNodeStreamId } from "../utils/fluxNode";
import { FluxNodeData, FluxNodeType, Settings } from "../utils/types";
import { BigButton } from "./utils/BigButton";
import { LabeledSlider } from "./utils/LabeledInputs";
import { TextAndCodeBlock } from "./utils/TextAndCodeBlock";
import { EditIcon, ViewIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { Spinner, Text, Button } from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Node, useReactFlow } from "reactflow";
import { getPlatformModifierKeyText } from "../utils/platform";

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
  const { setNodes } = useReactFlow();

  const promptNode = lineage[0];

  const promptNodeType = promptNode.data.fluxNodeType;

  const onMainButtonClick = () => {
    if (promptNodeType === FluxNodeType.User) {
      submitPrompt();
      if (MIXPANEL_TOKEN) mixpanel.track("Generated response");
    } else {
      newConnectedToSelectedNode(FluxNodeType.User);
      if (MIXPANEL_TOKEN) mixpanel.track("Composed response");
    }
  };

  const stopGenerating = () => {
    // Reset the stream id.
    setNodes((nodes) =>
      setFluxNodeStreamId(nodes, { id: promptNode.id, streamId: undefined })
    );
    if (MIXPANEL_TOKEN) mixpanel.track("Stopped generating response");
  };

  const handleSetTemperature = (v: number) => {
    setSettings({ ...settings, temp: v });
    if (MIXPANEL_TOKEN) mixpanel.track("Changed temperature");
  };

  const handleSetNumberOfResponses = (v: number) => {
    setSettings({ ...settings, n: v });
    if (MIXPANEL_TOKEN) mixpanel.track("Changed number of responses");
  };

  /*//////////////////////////////////////////////////////////////
                              STATE
  //////////////////////////////////////////////////////////////*/

  const [isEditing, setIsEditing] = useState(
    promptNodeType === FluxNodeType.User || promptNodeType === FluxNodeType.System
  );
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

    // If the user clicked on the node, we assume they want to edit it.
    // Otherwise, we only put them in edit mode if its a user or system node.
    setIsEditing(
      textOffsetRef.current !== -1 ||
        promptNodeType === FluxNodeType.User ||
        promptNodeType === FluxNodeType.System
    );
  }, [promptNode.id]);

  // Focus the textbox when the user changes into edit mode.
  useEffect(() => {
    if (isEditing) {
      const promptBox = window.document.getElementById(
        "promptBox"
      ) as HTMLTextAreaElement | null;

      // Focus the text box and move the cursor to chosen offset (defaults to end).
      promptBox?.setSelectionRange(textOffsetRef.current, textOffsetRef.current);
      promptBox?.focus();

      // Default to moving to the end of the text.
      textOffsetRef.current = -1;
    }
  }, [promptNode.id, isEditing]);

  /*//////////////////////////////////////////////////////////////
                              APP
  //////////////////////////////////////////////////////////////*/

  const modifierKeyText = getPlatformModifierKeyText();

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
              onClick={() => {
                const selection = window.getSelection();

                // We don't want to trigger the selection
                // if they're just selecting/copying text.
                if (selection?.isCollapsed) {
                  if (isLast) {
                    if (data.streamId) {
                      stopGenerating();
                      setIsEditing(true);
                    } else if (!isEditing) setIsEditing(true);
                  } else {
                    // TODO: Note this is basically broken because of codeblocks.
                    textOffsetRef.current = selection.anchorOffset ?? 0;

                    selectNode(node.id);
                    setIsEditing(true);
                  }
                }
              }}
              cursor={isLast && isEditing ? "text" : "pointer"}
            >
              {data.streamId && data.text === "" ? (
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
                    onClick={() =>
                      data.streamId ? stopGenerating() : setIsEditing(!isEditing)
                    }
                    position="absolute"
                    top={1}
                    right={1}
                    zIndex={10}
                    variant="outline"
                    border="0px"
                    _hover={{ background: "none" }}
                    p={1}
                  >
                    {data.streamId ? (
                      <NotAllowedIcon boxSize={4} />
                    ) : isEditing ? (
                      <ViewIcon boxSize={4} />
                    ) : (
                      <EditIcon boxSize={4} />
                    )}
                  </Button>
                  <Text fontWeight="bold" width="auto" whiteSpace="nowrap">
                    {displayNameFromFluxNodeType(data.fluxNodeType)}
                    :&nbsp;
                  </Text>
                  <Column
                    width="100%"
                    marginRight="30px"
                    whiteSpace="pre-wrap" // Preserve newlines.
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment="flex-start"
                    borderRadius="6px"
                    wordBreak="break-word"
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
          tooltip={
            promptNodeType === FluxNodeType.User
              ? `${modifierKeyText} ⏎`
              : `${modifierKeyText} P`
          }
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
            setValue={handleSetTemperature}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={1.25}
            min={0}
            step={0.01}
          />

          <LabeledSlider
            mt={3}
            label="Number of Responses"
            value={settings.n}
            setValue={handleSetNumberOfResponses}
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
