import { BoxProps } from "@chakra-ui/react";
import { LabeledPasswordInputWithLink } from "./LabeledInputs";

export function ElevenLabsKeyInput({
  elevenKey,
  setElevenKey,
  ...others
}: {
  elevenKey: string | null;
  setElevenKey: (elevenKey: string) => void;
} & BoxProps) {
  return (
    <LabeledPasswordInputWithLink
      width="80%"
      label="ElevenLabs API Key"
      linkLabel="Get a key"
      placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      link="https://beta.elevenlabs.io/"
      value={elevenKey ?? ""}
      setValue={setElevenKey}
      {...others}
    />
  );
}
