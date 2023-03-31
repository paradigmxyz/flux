import { MouseEvent, useState, useEffect, memo } from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Button, Box, Text } from "@chakra-ui/react";

import { CopyIcon } from "@chakra-ui/icons";

import {
  CODE_BLOCK_DETECT_REGEX,
  CODE_BLOCK_LANGUAGE_DETECT_REGEX,
} from "../../utils/constants";
import { Row } from "../../utils/chakra";
import { copySnippetToClipboard } from "../../utils/clipboard";

const getNextCodeBlockMatch = (text: string) => {
  return CODE_BLOCK_DETECT_REGEX.exec(text);
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
      onClick={handleCopyButtonClick}
      size="sm"
      variant="ghost"
      _hover={{ background: "#EEEEEE" }}
    >
      <CopyIcon boxSize={4} mr={1} /> {copied ? "Copied!" : "Copy Code"}
    </Button>
  );
};

const TitleBar = ({ language, code }: { language?: string; code: string }) => {
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
      borderRadius="6px"
    >
      {language ? <Box>{language}</Box> : <Box>plaintext</Box>}
      <CopyCodeButton code={code} />
    </Row>
  );
};

export const TextAndCodeBlock = memo(({ text }: { text: string }) => {
  const match = getNextCodeBlockMatch(text);

  if (!match) {
    return <Text>{text}</Text>;
  }

  const before = text.substring(0, match.index);

  const languageLine = CODE_BLOCK_LANGUAGE_DETECT_REGEX.exec(match[1]);
  const language = languageLine ? languageLine[0].substring(3) : "plaintext";
  const code = match[2].trim();

  const after = text.substring(match.index + match[0].length);

  return (
    <Box width="100%">
      {before.length > 0 ? <Text mb={4}>{before}</Text> : null}
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
});
