import { Heading, Link, Modal, ModalContent, ModalOverlay, Text } from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";

import { MIXPANEL_TOKEN } from "../../main";
import { isValidAPIKey } from "../../utils/apikey";
import { Column } from "../../utils/chakra";
import { APIKeyInput } from "../utils/APIKeyInput";

export function APIKeyModal({
  apiKey,
  setApiKey,
}: {
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
}) {
  const setApiKeyTracked = (apiKey: string) => {
    setApiKey(apiKey);

    if (isValidAPIKey(apiKey)) {
      if (MIXPANEL_TOKEN) mixpanel.track("Entered API Key");

      // Hacky way to get the prompt box to focus after the
      // modal closes. Long term should probably use a ref.
      setTimeout(() => window.document.getElementById("promptBox")?.focus(), 50);
    }
  };

  return (
    <Modal isOpen={true} onClose={() => {}} size="3xl" isCentered motionPreset="none">
      <ModalOverlay />
      <ModalContent>
        <Column mainAxisAlignment="center" crossAxisAlignment="center" height="450px">
          <Heading textAlign="center" mb={3}>
            Welcome to Flux 👋
          </Heading>
          <Text mb={10}>To start, paste your OpenAI API key below.</Text>
          <APIKeyInput apiKey={apiKey} setApiKey={setApiKeyTracked} />
          <Text mt={5} width="80%" textAlign="center" fontSize="md">
            We will <u>never</u> upload, log, or store your API key outside of your
            browser's local storage. Verify for yourself{" "}
            <Link href="https://github.com/transmissions11/flux" color="green" isExternal>
              here
            </Link>
            .
          </Text>
        </Column>
      </ModalContent>
    </Modal>
  );
}
