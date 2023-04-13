import { useState, useEffect } from "react";
import { copySnippetToClipboard } from "../../utils/clipboard";
import { CopyIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  Button,
  Textarea
} from "@chakra-ui/react";

import { Column, Row  } from "../../utils/chakra";

export function ExportModal({
  isOpen,
  onClose,
  exportData,
  importData,
}: {
  isOpen: boolean;
  onClose: () => void;
  exportData: string;
  importData: (data: string) => void;
}) {
  const [data, setData] = useState<string>(exportData);

  let handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    setData(inputValue)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      isCentered={true}
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import/Export</ModalHeader>
        <ModalCloseButton />
        <Column mainAxisAlignment="center" crossAxisAlignment="center" height="500px">
          <Row width="100%" mainAxisAlignment="center" crossAxisAlignment="center">
            <Button onClick={() => importData(data)}>Import</Button>
          <CopyButton data={data} />
          </Row>
          <Textarea onChange={handleInputChange} height="100%">{exportData}</Textarea>
        </Column>
      </ModalContent>
    </Modal>
  );
}

const CopyButton = ({ data }: { data: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent this from triggering edit mode in the parent.

    if (await copySnippetToClipboard(data)) setCopied(true);
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
      <CopyIcon boxSize={4} mr={1} /> {copied ? "Copied!" : "Copy"}
    </Button>
  );
};