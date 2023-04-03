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

  blockquote {
    margin: revert;
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
  }
`;

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

export function Markdown({ text }: { text: string }) {
  const markdown = useMemo(
    () => (
      <StyledMarkdownWrapper>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} // supports github flavored markdown.
          components={{
            code({ node, inline, className, children, style, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const code = String(children);
              return !inline ? (
                <Box
                  padding={0}
                  borderRadius="0.25rem"
                  overflow="hidden"
                  css={{
                    // targets the pre tag inside the code block. This is required to remove the margin between the title bar.
                    "> pre": { margin: "0 !important" },
                  }}
                  {...props}
                >
                  <TitleBar language={match?.[1]} code={code} />
                  <SyntaxHighlighter
                    children={code}
                    style={coy}
                    language={match?.[1] || "plaintext"}
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

  return markdown;
}
