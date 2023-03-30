import React, { useState, useEffect } from "react";
import { Button, Flex, Box } from "@chakra-ui/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  text: string;
}

interface TitleBarProps {
  language?: string;
  code: string;
}

const getNextCodeBlockMatch = (text: string) => {
  const codeBlockRegex = /\s*(```(?:[a-zA-Z0-9-]*\n|\n?)([\s\S]+?)\n```)\s*/;
  return codeBlockRegex.exec(text);
};

const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Button onClick={copyToClipboard} size="sm">
      {copied ? "Copied!" : "Copy Code"}
    </Button>
  );
};

const TitleBar: React.FC<TitleBarProps> = ({ language, code }) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      padding="5px 10px"
      backgroundColor="#f5f5f5"
      borderBottom="1px solid #eee"
      marginTop="1em"
      borderRadius="4px 4px 0 0"
    >
      {language ? <Box>{language}</Box> : <Box>plaintext</Box>}
      <CopyCodeButton code={code} />
    </Flex>
  );
};

export const TextAndCodeBlock: React.FC<CodeBlockProps> = ({ text }) => {
  const match = getNextCodeBlockMatch(text);

  if (!match) {
    return <>{text}</>;
  }

  const before = text.substring(0, match.index);

  const languageLine = /^```[a-zA-Z0-9-]*$/m.exec(match[1]);
  const language = languageLine ? languageLine[0].substring(3) : "plaintext";
  const code = match[2].trim();

  const after = text.substring(match.index + match[0].length);

  return (
    <>
      {before}
      <Box borderRadius="4px" overflow="hidden">
        <TitleBar language={language} code={code} />
        <SyntaxHighlighter
          language={language}
          wrapLongLines={true}
          style={coy}
          codeTagProps={{
            style: { wordBreak: "break-word" },
          }}
          customStyle={{
            padding: "10px",
            margin: "0px",
            borderRadius: "0 0 4px 4px",
          }}
          preProps={{
            style: {
              margin: "0px",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
      <TextAndCodeBlock text={after} />
    </>
  );
};
