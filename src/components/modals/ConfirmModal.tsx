import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

export function ConfirmModal({
  title,
  text,
  action,
  isOpen,
  onClose,
  onDelete,
}: {
  title: string;
  text: string;
  action: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{text}</ModalBody>
        <ModalFooter>
          <Button variant="solid" colorScheme="red" mr={3} onClick={onDelete}>
            {action}
          </Button>
          <Button variant="solid" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
