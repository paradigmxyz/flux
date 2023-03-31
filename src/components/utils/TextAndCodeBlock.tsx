import React, { useState, useEffect } from "react";
import { Button, Box } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Row } from "../../utils/chakra";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CODE_BLOCK_DETECT_REGEX, CODE_BLOCK_LANGUAGE_DETECT_REGEX } from "../../utils/constants";
import { copySnippetToClipboard } from "../../utils/clipboard";

interface CodeBlockProps {
  text: string;
}

interface TitleBarProps {
  language?: string;
  code: string;
}

const getNextCodeBlockMatch = (text: string) => {
  return CODE_BLOCK_DETECT_REGEX.exec(text);
};

const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyButtonClick = async () => {
    const result = await copySnippetToClipboard(code);
    if (result) {
      setCopied(true);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Button onClick={handleCopyButtonClick} size="sm">
      <CopyIcon boxSize={4} mr={1} /> {copied ? "Copied!" : "Copy Code"}
    </Button>
  );
};

const TitleBar: React.FC<TitleBarProps> = ({ language, code }) => {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="stretch"
      expand
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
    </Row>
  );
};

export const TextAndCodeBlock: React.FC<CodeBlockProps> = ({ text }) => {
  const match = getNextCodeBlockMatch(text);

  if (!match) {
    return <>{text}</>;
  }

  const before = text.substring(0, match.index);

  const languageLine = CODE_BLOCK_LANGUAGE_DETECT_REGEX.exec(match[1]);
  const language = languageLine ? languageLine[0].substring(3) : "plaintext";
  const code = match[2].trim();

  const after = text.substring(match.index + match[0].length);

  return (
    <Box width="100%">
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
        >
          {code}
        </SyntaxHighlighter>
      </Box>
      <TextAndCodeBlock text={after} />
    </Box>
  );
};
