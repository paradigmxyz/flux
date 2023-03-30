import { Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Button onClick={copyToClipboard} mb={5} size="sm">
      {copied ? "Copied!" : "Copy Code"}
    </Button>
  );
};
