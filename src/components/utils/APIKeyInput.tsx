import { BoxProps } from "@chakra-ui/react";
import { LabeledPasswordInputWithLink } from "./LabeledInputs";

export function APIKeyInput({
  apiKey,
  setApiKey,
  label,
  placeholder,
  link,
  ...others
}: {
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
  label: string;
  placeholder: string;
  link?: string;
} & BoxProps) {
  return (
    <LabeledPasswordInputWithLink
      width="80%"
      label={label}
      linkLabel="Get a key"
      placeholder={placeholder}
      link={link ?? "https://platform.openai.com/account/api-keys"}
      value={apiKey ?? ""}
      setValue={setApiKey}
      {...others}
    />
  );
}
