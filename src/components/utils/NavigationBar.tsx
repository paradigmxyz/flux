import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";

import { Row } from "../../utils/chakra";
import { FluxNodeType } from "../../utils/types";
import dave from "/dave.jpg";
import paradigm from "/paradigm.svg";
import t11s from "/t11s.jpg";

export function NavigationBar({
  newUserNodeLinkedToANewSystemNode,
  newConnectedToSelectedNode,
  submitPrompt,
  regenerate,
  completeNextWords,
  undo,
  redo,
  onClear,
  copyMessagesToClipboard,
  showRenameInput,
  deleteSelectedNodes,
  moveToParent,
  moveToChild,
  moveToLeftSibling,
  moveToRightSibling,
  autoZoom,
  onOpenSettingsModal,
}: {
  newUserNodeLinkedToANewSystemNode: () => void;
  newConnectedToSelectedNode: (nodeType: FluxNodeType) => void;
  submitPrompt: () => void;
  regenerate: () => void;
  completeNextWords: () => void;
  deleteSelectedNodes: () => void;
  undo: () => void;
  redo: () => void;
  onClear: () => void;
  copyMessagesToClipboard: () => void;
  showRenameInput: () => void;
  moveToParent: () => void;
  moveToChild: () => void;
  moveToLeftSibling: () => void;
  moveToRightSibling: () => void;
  autoZoom: () => void;
  onOpenSettingsModal: () => void;
}) {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="center"
      height="100%"
      width="auto"
      overflowX="auto">
      <Row
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        height="100%"
        width="auto">
        <Text whiteSpace="nowrap">
          <b>Flux</b> by
        </Text>

        <AvatarGroup ml="4px" size="sm">
          <Avatar
            bg="#ADADAD"
            color="transparent"
            name="Transmissions11"
            src={t11s}
            as={Link}
            isExternal
            href="https://twitter.com/transmissions11"
            _hover={{ position: "relative", bottom: "1px" }}
          />
          <Avatar
            bg="#6B2E80"
            color="transparent"
            name="Dave White"
            src={dave}
            as={Link}
            isExternal
            href="https://twitter.com/_Dave__White_"
            _hover={{ position: "relative", bottom: "1px" }}
          />
          <Avatar
            bg="white"
            color="transparent"
            name="Paradigm"
            src={paradigm}
            as={Link}
            isExternal
            href="https://twitter.com/paradigm"
            _hover={{ position: "relative", bottom: "1px" }}
          />
        </AvatarGroup>

        <Box mx="20px" height="100%" width="1px" bg="#EEEEEE" />

        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="ghost"
            height="80%"
            px="5px">
            File
          </MenuButton>
          <MenuList width="300px">
            <MenuGroup title="Trees">
              <MenuItem command="⇧⌘P" onClick={newUserNodeLinkedToANewSystemNode}>
                New conversation tree
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="Nodes">
              <MenuItem
                command="⌘P"
                onClick={() => newConnectedToSelectedNode(FluxNodeType.User)}>
                New user node
              </MenuItem>

              <MenuItem
                command="⌘U"
                onClick={() => newConnectedToSelectedNode(FluxNodeType.System)}>
                New system node
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="GPT">
              <MenuItem command="⌘⏎" onClick={submitPrompt}>
                Generate GPT responses
              </MenuItem>

              <MenuItem command="⇧⌘⏎" onClick={regenerate}>
                Regenerate GPT responses
              </MenuItem>

              <MenuItem command="⌘K" onClick={completeNextWords}>
                Complete next words
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="ghost"
            height="80%"
            px="5px"
            ml="11px">
            Edit
          </MenuButton>
          <MenuList width="300px">
            <MenuGroup title="History">
              <MenuItem command="⌘Z" onClick={undo}>
                Undo
              </MenuItem>

              <MenuItem command="⇧⌘Z" onClick={redo}>
                Redo
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="Delete">
              <MenuItem command="⌘⌫" onClick={deleteSelectedNodes}>
                Delete selected node(s)
              </MenuItem>

              <MenuItem command="⇧⌘⌫" onClick={onClear}>
                Delete everything
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="Rename">
              <MenuItem command="⌘E" onClick={showRenameInput}>
                Rename selected node
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="Copy">
              <MenuItem command="Ctrl+C" onClick={copyMessagesToClipboard}>
                Copy messages to clipboard
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="ghost"
            height="80%"
            px="5px"
            ml="11px">
            Navigate
          </MenuButton>
          <MenuList width="300px">
            <MenuGroup title="Vertical">
              <MenuItem command="⌘↑" onClick={moveToParent}>
                Up to parent node
              </MenuItem>
              <MenuItem command="⌘↓" onClick={moveToChild}>
                Down child node
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="Horizontal">
              <MenuItem command="⌘←" onClick={moveToLeftSibling}>
                Left to sibling node
              </MenuItem>
              <MenuItem command="⌘→" onClick={moveToRightSibling}>
                Right to sibling node
              </MenuItem>
            </MenuGroup>

            <MenuDivider />

            <MenuGroup title="Global">
              <MenuItem command="⌘." onClick={autoZoom}>
                Zoom out & center
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
        <Button
          variant="ghost"
          height="80%"
          px="5px"
          ml="11px"
          onClick={onOpenSettingsModal}>
          Settings
        </Button>
        <Button
          variant="ghost"
          height="80%"
          px="5px"
          ml="16px"
          as="a"
          href="https://twitter.com/transmissions11/status/1640775967856803840"
          target="_blank">
          About
        </Button>
      </Row>
    </Row>
  );
}
