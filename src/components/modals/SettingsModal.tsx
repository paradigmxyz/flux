import React from "react";

import {
  Button,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Checkbox,
} from "@chakra-ui/react";

import { LabeledSelect, LabeledSlider } from "../utils/LabeledInputs";

import { APIKeyInput } from "../utils/APIKeyInput";
import { Settings, FluxNodeType } from "../../utils/types";
import { getFluxNodeTypeDarkColor } from "../../utils/color";
import { DEFAULT_SETTINGS, SUPPORTED_MODELS } from "../../utils/constants";

export const SettingsModal = React.memo(function SettingsModal({
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
  const reset = () =>
    confirm(
      "Are you sure you want to reset your settings to default? This cannot be undone!"
    ) && setSettings(DEFAULT_SETTINGS);

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
    }
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
            setValue={(v) => setSettings({ ...settings, model: v })}
          />

          <APIKeyInput mt={4} width="100%" apiKey={apiKey} setApiKey={setApiKey} />

          <LabeledSlider
            mt={4}
            label="Temperature (randomness)"
            value={settings.temp}
            setValue={(v) => setSettings({ ...settings, temp: v })}
            color={getFluxNodeTypeDarkColor(FluxNodeType.User)}
            max={1.25}
            min={0}
            step={0.01}
          />

          <LabeledSlider
            mt={3}
            label="Number of Responses"
            value={settings.n}
            setValue={(v) => setSettings({ ...settings, n: v })}
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
            onChange={(event) =>
              setSettings({ ...settings, autoZoom: event.target.checked })
            }
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
