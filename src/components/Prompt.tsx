import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Node } from "reactflow";
import { Spinner, Text, Button, Flex } from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";
import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";
import { FluxNodeData, FluxNodeType, Settings } from "../utils/types";
import { displayNameFromFluxNodeType } from "../utils/fluxNode";
import { LabeledSlider } from "./utils/LabeledInputs";
import { Row, Center, Column } from "../utils/chakra";
import { BigButton } from "./utils/BigButton";
import { TTSButton } from "./utils/TTSButton";
import { CopyCodeButton } from "./utils/CopyCodeButton";

export function Prompt({
  lineage,
  submitPrompt,
  onType,
  selectNode,
  newConnectedToSelectedNode,
  isGPT4,
  settings,
  setSettings,
  elevenKey,
  voiceID,
}: {
  lineage: Node<FluxNodeData>[];
  onType: (text: string) => void;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  newConnectedToSelectedNode: (type: FluxNodeType) => void;
  isGPT4: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  elevenKey: string | null;
  voiceID: string | null;
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

  const [isEditing, setIsEditing] = useState(false);

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

  const renderCodeBlock = (text: string): React.ReactNode => {
    const codeBlockRegex = /\s*(```(?:[a-zA-Z0-9-]*\n|\n?)([\s\S]+?)\n```)\s*/;
    const match = codeBlockRegex.exec(text);

    if (!match) {
      return text;
    }

    const before = text.substring(0, match.index);

    // Get language name or use 'plaintext' as the default value
    const languageLine = /^```[a-zA-Z0-9-]*$/m.exec(match[1]);
    const language = languageLine ? languageLine[0].substring(3) : "plaintext";
    const code = match[2].trim();

    const after = text.substring(match.index + match[0].length);

    return (
      <>
        {before}
        <SyntaxHighlighter language={language} showLineNumbers>
          {code}
        </SyntaxHighlighter>
        <CopyCodeButton code={code} />
        {renderCodeBlock(after)}
      </>
    );
  };

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
                      <Column
                        width={"100%"}
                        whiteSpace="pre-wrap" // Preserve newlines.
                        mainAxisAlignment="flex-start"
                        crossAxisAlignment="flex-start"
                        borderRadius="6px"
                      >
                        <>
                          {isEditing || data.fluxNodeType === FluxNodeType.User ? (
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
                            renderCodeBlock(data.text)
                          )}
                          <Flex mt={5}>
                            {!(data.fluxNodeType === FluxNodeType.User) && (
                              <Button onClick={() => setIsEditing(!isEditing)} mr={2}>
                                {isEditing ? "Done Editing" : "Edit"}
                              </Button>
                            )}
                            {(data.fluxNodeType === FluxNodeType.GPT ||
                              data.fluxNodeType === FluxNodeType.TweakedGPT) &&
                              elevenKey &&
                              voiceID && (
                                <TTSButton
                                  text={data.text}
                                  voiceID={voiceID}
                                  apiKey={elevenKey}
                                />
                              )}
                          </Flex>
                        </>
                      </Column>
                    </>
                  ) : (
                    <>
                      <Column
                        width={"100%"}
                        whiteSpace="pre-wrap" // Preserve newlines.
                        mainAxisAlignment="flex-start"
                        crossAxisAlignment="flex-start"
                        borderRadius="6px"
                      >
                        {renderCodeBlock(data.text)}
                      </Column>
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
