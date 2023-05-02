import React, { useState, useEffect, memo, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/atom-one-light.css";
import rehypeHighlight from "rehype-highlight";
import { Button, Box, Code, Text, useTheme } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Row, Column } from "../../utils/chakra";
import { copySnippetToClipboard } from "../../utils/clipboard";
import { solidity, yul } from "highlightjs-solidity";

const CodeblockTitleBar = ({
  language,
  code,
}: {
  language?: string;
  code: ReactNode[];
}) => {
  // Grabbing the default font family from Chakra via
  // useTheme to override the markdown code font family.
  const theme = useTheme();

  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="stretch"
      expand
      justifyContent="space-between"
      alignItems="center"
      px="10px"
      py="5px"
      backgroundColor="#f5f5f5"
      borderBottom="1px solid #eee"
      borderRadius="6px 6px 0px 0px"
      sx={{ fontFamily: theme.fonts.body }}
    >
      <Text>{language || "plaintext"}</Text>
      <CopyCodeButton code={code} />
    </Row>
  );
};

const CopyCodeButton = ({ code }: { code: ReactNode[] }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent this from triggering edit mode in the parent.

    if (await copySnippetToClipboard(stringifyChildren(code))) setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Button
      onClick={handleCopyButtonClick}
      size="xs"
      variant="ghost"
      px="5px"
      _hover={{ background: "#EEEEEE" }}
    >
      <CopyIcon boxSize={4} mr={1} /> {copied ? "Copied!" : "Copy Code"}
    </Button>
  );
};

export const Markdown = memo(function Markdown({ text }: { text: string }) {
  return (
    <Box className="markdown-wrapper" width="100%" wordBreak="break-word">
      <ReactMarkdown
        rehypePlugins={[
          [rehypeHighlight, { ignoreMissing: true, languages: { solidity, yul } }],
        ]}
        components={{
          code({ node, inline, className, children, style, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline ? (
              <Column
                borderRadius="0.25rem"
                overflow="hidden"
                mainAxisAlignment="flex-start"
                crossAxisAlignment="center"
              >
                <CodeblockTitleBar language={match?.[1]} code={children} />
                <Code
                  width="100%"
                  padding={!match?.[1] ? "10px" : 0} // When no language is specified, inconsistent padding is applied. This fixes that.
                  className={className}
                  {...props}
                  backgroundColor="white"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {children}
                </Code>
              </Column>
            ) : (
              <Code
                className={className}
                {...props}
                backgroundColor="white"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {children}
              </Code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
});

// Recursively extract text value from the children prop of a ReactMarkdown component.
// This function is necessary because some children can contain inline elements,
// and simple concatenation is not sufficient for extracting text data.
// It navigates deeply within nested structures to acquire the intended text.
const stringifyChildren = (children: ReactNode[]): string => {
  return (
    children
      .reduce((concatenatedText: string, currentNode: ReactNode) => {
        if (React.isValidElement(currentNode) && currentNode.props.children) {
          return (
            concatenatedText +
            stringifyChildren(
              Array.isArray(currentNode.props.children)
                ? currentNode.props.children
                : [currentNode.props.children]
            )
          );
        }

        // Ignore non-text ReactNodes, fixing [object Object] error.
        if (typeof currentNode === "object") {
          return concatenatedText;
        }

        return concatenatedText + String(currentNode || "");
      }, "")
      // react-markdown sometimes includes a newline at the end of the children array.
      // We remove it if needed here to avoid a newline at the end of the copied text.
      .replace(/\n$/, "")
  );
};
