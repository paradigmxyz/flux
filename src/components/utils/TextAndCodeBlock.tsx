import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import styled from "@emotion/styled";
import { Button, Box } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Row } from "../../utils/chakra";
import { copySnippetToClipboard } from "../../utils/clipboard";

// Required to display accurate font sizes for markdown elements.
const StyledMarkdownWrapper = styled(Box)`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: 500;
  }

  ol,
  ul {
    margin-left: 20px;
  }
  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.17em;
  }

  h4 {
    font-size: 1em;
  }

  h5 {
    font-size: 0.83em;
  }

  h6 {
    font-size: 0.67em;
  }

  hr {
    background-color: #000000;
    height: 2px;
    border: 0px;
    // border-color: #00000000;
  }
`;

export interface MarkdownProps {
  text: string;
}

const TitleBar = ({ language, code }: { language?: string; code: string }) => {
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
      borderRadius="6px"
    >
      <Box>{language || "plaintext"}</Box>
      <CopyCodeButton code={code} />
    </Row>
  );
};

const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyButtonClick = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent this from triggering edit mode in the parent.

    if (await copySnippetToClipboard(code)) setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Button
      // TODO fix this
      // @ts-ignore
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

export function TextAndCodeBlock({ text }: { text: string }) {
  const elem = useMemo(
    () => (
      <StyledMarkdownWrapper>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ol({ start, children }) {
              return (
                <ol
                  start={start ?? 1}
                  style={{ counterReset: `list-item ${(start || 1) - 1}` }}
                >
                  {children}
                </ol>
              );
            },
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const code = String(children);
              return !inline ? (
                <Box
                  padding="0"
                  borderRadius="0.25rem"
                  overflow="hidden"
                  css={{
                    "> div": { margin: "0 !important" },
                    ".fa": { fontStyle: "normal !important" },
                  }}
                  {...props}
                >
                  <TitleBar language={match?.[1]} code={code} />
                  <SyntaxHighlighter
                    children={code}
                    style={coy as any}
                    language={match?.[1] || "text"}
                    PreTag="div"
                    wrapLongLines
                    {...props}
                  />
                </Box>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
      </StyledMarkdownWrapper>
    ),
    [text]
  );

  return elem;
}
