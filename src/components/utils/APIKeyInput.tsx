import { BoxProps } from "@chakra-ui/react";

import { LabeledPasswordInputWithLink } from "./LabeledInputs";

export function APIKeyInput({
  apiKey,
  setApiKey,
  ...others
}: {
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
} & BoxProps) {
  return (
    <LabeledPasswordInputWithLink
      width="80%"
      label="OpenAI API key"
      linkLabel="Get a key"
      placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      link="https://platform.openai.com/account/api-keys"
      value={apiKey ?? ""}
      setValue={setApiKey}
      {...others}
    />
  );
}
