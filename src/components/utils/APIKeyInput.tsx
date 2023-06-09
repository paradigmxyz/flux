import { BoxProps } from "@chakra-ui/react";
import { LabeledPasswordInputWithLink } from "./LabeledInputs";

export function APIKeyInput({
  apiKey,
  setApiKey,
  title,
  link,
  ...others
}: {
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
  title?: string;
  link?: string;
} & BoxProps) {
  return (
    <LabeledPasswordInputWithLink
      width="80%"
      label={title ? title : "Anthropic API Key"}
      linkLabel="Get a key"
      placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      link={link ? link : "https://console.anthropic.com"}
      value={apiKey ?? ""}
      setValue={setApiKey}
      {...others}
    />
  );
}
