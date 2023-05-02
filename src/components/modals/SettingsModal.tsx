import { MIXPANEL_TOKEN } from "../../main";
import { getFluxNodeTypeDarkColor } from "../../utils/color";
import { DEFAULT_SETTINGS, SUPPORTED_MODELS, TOAST_CONFIG } from "../../utils/constants";
import { Settings, FluxNodeType } from "../../utils/types";
import { APIKeyInput } from "../utils/APIKeyInput";
import { LabeledSelect, LabeledSlider } from "../utils/LabeledInputs";

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import mixpanel from "mixpanel-browser";
import { ChangeEvent, memo } from "react";

export const SettingsModal = memo(function SettingsModal({
  isOpen,
  onClose,
  settings,
  setSettings,
  apiKey,
  setApiKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
}) {
  const toast = useToast();

  const reset = () => {
    if (
      confirm(
        "Are you sure you want to reset your settings to default? This cannot be undone!"
      )
    ) {
      setSettings(DEFAULT_SETTINGS);

      if (MIXPANEL_TOKEN) mixpanel.track("Restored defaults");
    }
  };

  const hardReset = () => {
    if (
      confirm(
        "Are you sure you want to delete ALL data (including your saved API key, conversations, etc?) This cannot be undone!"
      ) &&
      confirm(
        "Are you 100% sure? Reminder this cannot be undone and you will lose EVERYTHING!"
      )
    ) {
      // Clear local storage.
      localStorage.clear();

      // Ensure that the page is reloaded even if there are unsaved changes.
      window.onbeforeunload = null;

      // Reload the window.
      window.location.reload();

      if (MIXPANEL_TOKEN) mixpanel.track("Performed hard reset");
    }
  };

  const handleChangeModel = async (v: string) => {
    if (await checkModelAccess(v)) {
      setSettings({ ...settings, model: v });
    } else {
      let errorText = "";
      if (v === "gpt-4") {
        errorText = "You don't have access to GPT-4, sign up for the waitlist at https://openai.com/waitlist/gpt-4-api";
      } else if (v === "gpt-4-32k") {
        errorText = "You don't have access to GPT-4 32k.";
      } else {
        errorText = "Something went wrong.";
      }

      toast({
        title: errorText,
        status: "error",
        ...TOAST_CONFIG,
      });
    }

    if (MIXPANEL_TOKEN) mixpanel.track("Changed model");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LabeledSelect
            label="Model"
            value={settings.model}
            options={SUPPORTED_MODELS}
            setValue={handleChangeModel}
          />

          <APIKeyInput mt={4} width="100%" apiKey={apiKey} setApiKey={setApiKey} />

          <LabeledSlider
            mt={4}
            label="Temperature (randomness)"
            value={settings.temp}
            setValue={(v: number) => {
              setSettings({ ...settings, temp: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed temperature");
            }}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={1.25}
            min={0}
            step={0.01}
          />

          <LabeledSlider
            mt={3}
            label="Number of Responses"
            value={settings.n}
            setValue={(v: number) => {
              setSettings({ ...settings, n: v });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed number of responses");
            }}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={10}
            min={1}
            step={1}
          />

          <Checkbox
            mt={3}
            fontWeight="bold"
            isChecked={settings.autoZoom}
            colorScheme="gray"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSettings({ ...settings, autoZoom: event.target.checked });

              if (MIXPANEL_TOKEN) mixpanel.track("Changed auto zoom");
            }}
          >
            Auto Zoom
          </Checkbox>
        </ModalBody>

        <ModalFooter>
          <Button mb={2} onClick={reset} mr={3} color="orange">
            Restore Defaults
          </Button>

          <Button mb={2} onClick={hardReset} mr="auto" color="red">
            Hard Reset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});


async function checkModelAccess(model: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const models = data.data;
      return models.some((m: { id: string }) => m.id === model);
    } else {
      console.error("Error fetching models:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error fetching models:", error);
    return false;
  }
}


