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
      label="Hyperbolic API Key"
      linkLabel="Get a key"
      placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      link="https://app.hyperbolic.xyz/settings"
      value={apiKey ?? ""}
      setValue={setApiKey}
      {...others}
    />
  );
}
