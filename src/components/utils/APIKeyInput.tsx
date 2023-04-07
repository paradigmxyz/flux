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
      label="Anthropic API Key"
      linkLabel="Get a key"
      placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      link="https://console.anthropic.com"
      value={apiKey ?? ""}
      setValue={setApiKey}
      {...others}
    />
  );
}
