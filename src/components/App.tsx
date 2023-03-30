import { useEffect, useState } from "react";

import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Node,
  Edge,
  useEdgesState,
  useNodesState,
  SelectionMode,
  ReactFlowInstance,
  ReactFlowJsonObject,
  useReactFlow,
  Controls,
} from "reactflow";

import "reactflow/dist/style.css";

import mixpanel from "mixpanel-browser";

import { Resizable } from "re-resizable";

import { yieldStream } from "yield-stream";

import { useHotkeys } from "react-hotkeys-hook";

import { useBeforeunload } from "react-beforeunload";

import { CheckCircleIcon } from "@chakra-ui/icons";
import { Box, useDisclosure, Spinner, useToast } from "@chakra-ui/react";

import { CreateCompletionResponseChoicesInner, OpenAI } from "openai-streams";

import { Prompt } from "./Prompt";

import { APIKeyModal } from "./modals/APIKeyModal";
import { SettingsModal } from "./modals/SettingsModal";

import { MIXPANEL_TOKEN } from "../main";

import {
  getFluxNode,
  getFluxNodeGPTChildren,
  displayNameFromFluxNodeType,
  newFluxNode,
  appendTextToFluxNodeAsGPT,
  getFluxNodeLineage,
  isFluxNodeInLineage,
  addFluxNode,
  modifyFluxNode,
  getFluxNodeChildren,
  getFluxNodeParent,
  getFluxNodeSiblings,
  markOnlyNodeAsSelected,
  deleteFluxNode,
  deleteSelectedFluxNodes,
  addUserNodeLinkedToASystemNode,
  markFluxNodeAsDoneGenerating,
} from "../utils/fluxNode";
import {
  FluxNodeData,
  FluxNodeType,
  HistoryItem,
  Settings,
  CreateChatCompletionStreamResponseChoicesInner,
} from "../utils/types";
import {
  API_KEY_LOCAL_STORAGE_KEY,
  DEFAULT_SETTINGS,
  FIT_VIEW_SETTINGS,
  HOTKEY_CONFIG,
  MAX_HISTORY_SIZE,
  MODEL_SETTINGS_LOCAL_STORAGE_KEY,
  NEW_TREE_CONTENT_QUERY_PARAM,
  OVERLAP_RANDOMNESS_MAX,
  REACT_FLOW_LOCAL_STORAGE_KEY,
  UNDEFINED_RESPONSE_STRING,
} from "../utils/constants";
import { mod } from "../utils/mod";
import { BigButton } from "./utils/BigButton";
import { Column, Row } from "../utils/chakra";
import { isValidAPIKey } from "../utils/apikey";
import { generateNodeId } from "../utils/nodeId";
import { useLocalStorage } from "../utils/lstore";
import { NavigationBar } from "./utils/NavigationBar";
import { useDebouncedEffect } from "../utils/debounce";
import { useDebouncedWindowResize } from "../utils/resize";
import { getQueryParam, resetURL } from "../utils/qparams";
import { messagesFromLineage, promptFromLineage } from "../utils/prompt";
import { newFluxEdge, modifyFluxEdge, addFluxEdge } from "../utils/fluxEdge";
import { getFluxNodeTypeColor, getFluxNodeTypeDarkColor } from "../utils/color";

function App() {
  const toast = useToast();

  /*//////////////////////////////////////////////////////////////
                          UNDO REDO LOGIC
  //////////////////////////////////////////////////////////////*/

  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  const takeSnapshot = () => {
    // Push the current graph to the past state.
    setPast((past) => [
      ...past.slice(past.length - MAX_HISTORY_SIZE + 1, past.length),
      { nodes, edges, selectedNodeId, lastSelectedNodeId },
    ]);

    // Whenever we take a new snapshot, the redo operations
    // need to be cleared to avoid state mismatches.
    setFuture([]);
  };

  const undo = () => {
    // get the last state that we want to go back to
    const pastState = past[past.length - 1];

    if (pastState) {
      // First we remove the state from the history.
      setPast((past) => past.slice(0, past.length - 1));
      // We store the current graph for the redo operation.
      setFuture((future) => [
        ...future,
        { nodes, edges, selectedNodeId, lastSelectedNodeId },
      ]);

      // Now we can set the graph to the past state.
      setNodes(pastState.nodes);
      setEdges(pastState.edges);
      setLastSelectedNodeId(pastState.lastSelectedNodeId);
      setSelectedNodeId(pastState.selectedNodeId);

      autoZoomIfNecessary();
    }
  };

  const redo = () => {
    const futureState = future[future.length - 1];

    if (futureState) {
      setFuture((future) => future.slice(0, future.length - 1));
      setPast((past) => [...past, { nodes, edges, selectedNodeId, lastSelectedNodeId }]);
      setNodes(futureState.nodes);
      setEdges(futureState.edges);
      setLastSelectedNodeId(futureState.lastSelectedNodeId);
      setSelectedNodeId(futureState.selectedNodeId);

      autoZoomIfNecessary();
    }
  };

  /*//////////////////////////////////////////////////////////////
                        CORE REACT FLOW LOGIC
  //////////////////////////////////////////////////////////////*/

  const { setViewport, fitView } = useReactFlow();

  const [reactFlow, setReactFlow] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = (connection: Edge<any> | Connection) => {
    // Check the lineage of the source node to make
    // sure we aren't creating a recursive connection.
    if (
      isFluxNodeInLineage(nodes, edges, {
        nodeToCheck: connection.target!,
        nodeToGetLineageOf: connection.source!,
      })
    )
      return;

    takeSnapshot();
    setEdges((eds) => addEdge({ ...connection }, eds));
  };

  const autoZoom = () => setTimeout(() => fitView(FIT_VIEW_SETTINGS), 50);

  const autoZoomIfNecessary = () => {
    if (settings.autoZoom) autoZoom();
  };

  const save = () => {
    if (reactFlow) {
      localStorage.setItem(
        REACT_FLOW_LOCAL_STORAGE_KEY,
        JSON.stringify(reactFlow.toObject())
      );

      console.log("Saved React Flow state!");
    }
  };

  // Auto save.
  const isSavingReactFlow = useDebouncedEffect(
    save,
    1000, // 1 second.
    [reactFlow, nodes, edges]
  );

  // Auto restore on load.
  useEffect(() => {
    if (reactFlow) {
      const rawFlow = localStorage.getItem(REACT_FLOW_LOCAL_STORAGE_KEY);

      const flow: ReactFlowJsonObject = rawFlow ? JSON.parse(rawFlow) : null;

      // Get the content of the newTreeWith query param.
      const content = getQueryParam(NEW_TREE_CONTENT_QUERY_PARAM);

      if (flow) {
        console.log("Restoring react flow from local storage.");

        setEdges(flow.edges || []);
        setViewport(flow.viewport);

        const nodes = flow.nodes; // For brevity.

        if (nodes.length > 0) {
          // Either the first selected node we find, or the first node in the array.
          const toSelect = nodes.find((node) => node.selected)?.id ?? nodes[0].id;

          // Add the nodes to the React Flow array and select the node.
          selectNode(toSelect, () => nodes);

          // If there was a newTreeWith query param, create a new tree with that content.
          // We pass false for forceAutoZoom because we'll do it 500ms later to avoid lag.
          if (content) newUserNodeLinkedToANewSystemNode(content, false);
        } else newUserNodeLinkedToANewSystemNode(content, false); // Create a new node if there are none.
      } else newUserNodeLinkedToANewSystemNode(content, false); // Create a new node if there are none.

      setTimeout(() => {
        // Do this with a more generous timeout to make sure
        // the nodes are rendered and the settings have loaded in.
        if (settings.autoZoom) fitView(FIT_VIEW_SETTINGS);
      }, 500);

      resetURL(); // Get rid of the query params.
    }
  }, [reactFlow]);

  /*//////////////////////////////////////////////////////////////
                          AI PROMPT CALLBACKS
  //////////////////////////////////////////////////////////////*/

  // Takes a prompt, submits it to the GPT API with n responses,
  // then creates a child node for each response under the selected node.
  const submitPrompt = async () => {
    takeSnapshot();

    if (MIXPANEL_TOKEN) mixpanel.track("Submitted Prompt");

    const responses = settings.n;
    const temp = settings.temp;
    const model = settings.model;

    const parentNodeLineage = selectedNodeLineage;
    const parentNodeId = selectedNodeLineage[0].id;

    const newNodes = [...nodes];

    const currentNode = getFluxNode(newNodes, parentNodeId)!;
    const currentNodeChildren = getFluxNodeGPTChildren(newNodes, edges, parentNodeId);

    let firstCompletionId: string | undefined;

    // Update newNodes, adding new child nodes as
    // needed, re-using existing ones wherever possible.
    for (let i = 0; i < responses; i++) {
      // If we have enough children, we'll just re-use one.
      if (i < currentNodeChildren.length) {
        const childNode = currentNodeChildren[i];

        if (i === 0) firstCompletionId = childNode.id;

        const idx = newNodes.findIndex((node) => node.id === childNode.id);

        newNodes[idx] = {
          ...childNode,
          data: {
            ...childNode.data,
            text: "",
            label: displayNameFromFluxNodeType(FluxNodeType.GPT),
            fluxNodeType: FluxNodeType.GPT,
            generating: true,
          },
          style: {
            ...childNode.style,
            background: getFluxNodeTypeColor(FluxNodeType.GPT),
          },
        };
      } else {
        const id = generateNodeId();

        if (i === 0) firstCompletionId = id;

        // Otherwise, we'll create a new node.
        newNodes.push(
          newFluxNode({
            id,
            // Position it 50px below the current node, offset
            // horizontally according to the number of responses
            // such that the middle response is right below the current node.
            // Note that node x y coords are the top left corner of the node,
            // so we need to offset by at the width of the node (150px).
            x: currentNode.position.x + (i - (responses - 1) / 2) * 180,
            // Add OVERLAP_RANDOMNESS_MAX of randomness to the y position so that nodes don't overlap.
            y: currentNode.position.y + 100 + Math.random() * OVERLAP_RANDOMNESS_MAX,
            fluxNodeType: FluxNodeType.GPT,
            text: "",
            generating: true,
          })
        );
      }
    }

    if (firstCompletionId === undefined) throw new Error("No first completion id!");

    (async () => {
      const stream = await OpenAI(
        "chat",
        {
          model,
          n: responses,
          temperature: temp,
          messages: messagesFromLineage(parentNodeLineage, settings),
        },
        { apiKey: apiKey!, mode: "raw" }
      );

      const DECODER = new TextDecoder();

      for await (const chunk of yieldStream(stream)) {
        try {
          const decoded = JSON.parse(DECODER.decode(chunk));

          if (decoded.choices === undefined)
            throw new Error(
              "No choices in response. Decoded response: " + JSON.stringify(decoded)
            );

          const choice: CreateChatCompletionStreamResponseChoicesInner =
            decoded.choices[0];

          if (choice.index === undefined)
            throw new Error(
              "No index in choice. Decoded choice: " + JSON.stringify(choice)
            );

          const correspondingNodeId =
            // If we re-used a node we have to pull it from children array.
            choice.index < currentNodeChildren.length
              ? currentNodeChildren[choice.index].id
              : newNodes[newNodes.length - responses + choice.index].id;

          // The ChatGPT API will start by returning a
          // choice with only a role delta and no content.
          if (choice.delta?.content) {
            setNodes((newerNodes) => {
              return appendTextToFluxNodeAsGPT(newerNodes, {
                id: correspondingNodeId,
                text: choice.delta?.content ?? UNDEFINED_RESPONSE_STRING,
              });
            });
          }

          // If the choice has a finish reason, then it's the final
          // choice and we can mark it as no longer animated right now.
          if (choice.finish_reason !== null) {
            setNodes((nodes) => markFluxNodeAsDoneGenerating(nodes, correspondingNodeId));

            setEdges((edges) =>
              modifyFluxEdge(edges, {
                source: parentNodeId,
                target: correspondingNodeId,
                animated: false,
              })
            );
          }
        } catch (err) {
          console.error(err);
        }
      }

      // Mark all the edges as no longer animated.
      for (let i = 0; i < responses; i++) {
        const correspondingNodeId =
          i < currentNodeChildren.length
            ? currentNodeChildren[i].id
            : newNodes[newNodes.length - responses + i].id;

        setNodes((nodes) => markFluxNodeAsDoneGenerating(nodes, correspondingNodeId));

        setEdges((edges) =>
          modifyFluxEdge(edges, {
            source: parentNodeId,
            target: correspondingNodeId,
            animated: false,
          })
        );
      }
    })().catch((err) =>
      toast({
        title: err.toString(),
        status: "error",
        isClosable: true,
        variant: "left-accent",
        position: "bottom-left",
      })
    );

    setNodes(markOnlyNodeAsSelected(newNodes, firstCompletionId!));

    setLastSelectedNodeId(selectedNodeId);
    setSelectedNodeId(firstCompletionId);

    setEdges((edges) => {
      let newEdges = [...edges];

      for (let i = 0; i < responses; i++) {
        // Update the links between
        // re-used nodes if necessary.
        if (i < currentNodeChildren.length) {
          const childId = currentNodeChildren[i].id;

          const idx = newEdges.findIndex(
            (edge) => edge.source === parentNodeId && edge.target === childId
          );

          newEdges[idx] = {
            ...newEdges[idx],
            animated: true,
          };
        } else {
          // The new nodes are added to the end of the array, so we need to
          // subtract responses from and add i to length of the array to access.
          const childId = newNodes[newNodes.length - responses + i].id;

          // Otherwise, add a new edge.
          newEdges.push(
            newFluxEdge({
              source: parentNodeId,
              target: childId,
              animated: true,
            })
          );
        }
      }

      return newEdges;
    });

    autoZoomIfNecessary();
  };

  const completeNextWords = () => {
    takeSnapshot();

    const temp = settings.temp;

    const parentNodeLineage = selectedNodeLineage;
    const parentNodeId = parentNodeLineage[0].id;

    (async () => {
      // TODO: Stop sequences for user/assistant/etc? min tokens?
      // Select between instruction and auto completer?
      const stream = await OpenAI(
        "completions",
        {
          model: "text-davinci-003", // TODO: Allow customizing.
          temperature: temp, // TODO: Allow customizing.
          prompt: promptFromLineage(parentNodeLineage, settings),
          max_tokens: 250, // Allow customizing.
          stop: ["\n\n", "assistant:", "user:"], // TODO: Allow customizing.
        },
        { apiKey: apiKey!, mode: "raw" }
      );

      const DECODER = new TextDecoder();

      for await (const chunk of yieldStream(stream)) {
        try {
          const decoded = JSON.parse(DECODER.decode(chunk));

          if (decoded.choices === undefined)
            throw new Error(
              "No choices in response. Decoded response: " + JSON.stringify(decoded)
            );

          const choice: CreateCompletionResponseChoicesInner = decoded.choices[0];

          setNodes((newNodes) =>
            appendTextToFluxNodeAsGPT(newNodes, {
              id: parentNodeId,
              text: choice.text ?? UNDEFINED_RESPONSE_STRING,
            })
          );
        } catch (err) {
          console.error(err);
        }
      }
    })().catch((err) => console.error(err));
  };

  /*//////////////////////////////////////////////////////////////
                          SELECTED NODE LOGIC
  //////////////////////////////////////////////////////////////*/

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [lastSelectedNodeId, setLastSelectedNodeId] = useState<string | null>(null);

  const selectedNodeLineage =
    selectedNodeId !== null ? getFluxNodeLineage(nodes, edges, selectedNodeId) : [];

  /*//////////////////////////////////////////////////////////////
                        NODE MUTATION CALLBACKS
  //////////////////////////////////////////////////////////////*/

  const newUserNodeLinkedToANewSystemNode = (
    text: string | null = "",
    forceAutoZoom: boolean = true
  ) => {
    takeSnapshot();

    const systemId = generateNodeId();
    const userId = generateNodeId();

    selectNode(userId, (nodes) =>
      addUserNodeLinkedToASystemNode(
        nodes,
        settings.defaultPreamble,
        text,
        systemId,
        userId
      )
    );

    setEdges((edges) =>
      addFluxEdge(edges, {
        source: systemId,
        target: userId,
        animated: false,
      })
    );

    if (forceAutoZoom) autoZoom();
  };

  const newConnectedToSelectedNode = (type: FluxNodeType) => {
    const selectedNode = getFluxNode(nodes, selectedNodeId!);

    if (selectedNode) {
      takeSnapshot();

      const selectedNodeChildren = getFluxNodeChildren(nodes, edges, selectedNodeId!);

      const id = generateNodeId();

      selectNode(id, (nodes) =>
        addFluxNode(nodes, {
          id,
          x:
            selectedNodeChildren.length > 0
              ? selectedNodeChildren.reduce((prev, current) =>
                  prev.position.x > current.position.x ? prev : current
                ).position.x + 180
              : selectedNode.position.x,
          // Add OVERLAP_RANDOMNESS_MAX of randomness to
          // the y position so that nodes don't overlap.
          y: selectedNode.position.y + 100 + Math.random() * OVERLAP_RANDOMNESS_MAX,
          fluxNodeType: type,
          text: "",
          generating: false,
        })
      );

      setEdges((edges) =>
        addFluxEdge(edges, {
          source: selectedNodeId!,
          target: id,
          animated: false,
        })
      );

      autoZoomIfNecessary();
    }
  };

  const deleteSelectedNodes = () => {
    takeSnapshot();

    const selectedNodes = nodes.filter((node) => node.selected);

    if (
      selectedNodeId && // There's a selected node under the hood.
      (selectedNodes.length === 0 || // There are no selected nodes.
        // There is only one selected node, and it's the selected node.
        (selectedNodes.length === 1 && selectedNodes[0].id === selectedNodeId))
    ) {
      // Try to move to sibling first.
      const hasSibling = moveToRightSibling();

      // If there's no sibling, move to parent.
      if (!hasSibling) moveToParent();

      setNodes((nodes) => deleteFluxNode(nodes, selectedNodeId));
    } else {
      setNodes(deleteSelectedFluxNodes);

      // If any of the selected nodes are the selected node, unselect it.
      if (selectedNodeId && selectedNodes.some((node) => node.id === selectedNodeId)) {
        setLastSelectedNodeId(null);
        setSelectedNodeId(null);
      }
    }

    autoZoomIfNecessary();
  };

  const onClear = () => {
    if (confirm("Are you sure you want to delete all nodes?")) {
      takeSnapshot();

      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
    }
  };

  /*//////////////////////////////////////////////////////////////
                      NODE SELECTION CALLBACKS
  //////////////////////////////////////////////////////////////*/

  const selectNode = (
    id: string,
    computeNewNodes?: (currNodes: Node<FluxNodeData>[]) => Node<FluxNodeData>[]
  ) => {
    setLastSelectedNodeId(selectedNodeId);
    setSelectedNodeId(id);
    setNodes((currNodes) =>
      // If we were passed a computeNewNodes function, use it, otherwise just use the current nodes.
      markOnlyNodeAsSelected(computeNewNodes ? computeNewNodes(currNodes) : currNodes, id)
    );
  };

  const moveToChild = () => {
    const children = getFluxNodeChildren(nodes, edges, selectedNodeId!);

    if (children.length > 0) {
      selectNode(
        lastSelectedNodeId !== null &&
          children.some((node) => node.id == lastSelectedNodeId)
          ? lastSelectedNodeId
          : children[0].id
      );

      return true;
    } else {
      return false;
    }
  };

  const moveToParent = () => {
    const parent = getFluxNodeParent(nodes, edges, selectedNodeId!);

    if (parent) {
      selectNode(parent.id);

      return true;
    } else {
      return false;
    }
  };

  const moveToLeftSibling = () => {
    const siblings = getFluxNodeSiblings(nodes, edges, selectedNodeId!);

    if (siblings.length > 1) {
      const currentIndex = siblings.findIndex((node) => node.id == selectedNodeId!)!;

      selectNode(siblings[mod(currentIndex - 1, siblings.length)].id);

      return true;
    } else {
      return false;
    }
  };

  const moveToRightSibling = () => {
    const siblings = getFluxNodeSiblings(nodes, edges, selectedNodeId!);

    if (siblings.length > 1) {
      const currentIndex = siblings.findIndex((node) => node.id == selectedNodeId!)!;

      selectNode(siblings[mod(currentIndex + 1, siblings.length)].id);

      return true;
    } else {
      return false;
    }
  };

  /*//////////////////////////////////////////////////////////////
                         SETTINGS MODAL LOGIC
  //////////////////////////////////////////////////////////////*/

  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
    onToggle: onToggleSettingsModal,
  } = useDisclosure();

  const [settings, setSettings] = useState<Settings>(() => {
    const rawSettings = localStorage.getItem(MODEL_SETTINGS_LOCAL_STORAGE_KEY);

    if (rawSettings !== null) {
      console.log("Restoring settings from local storage.");

      return JSON.parse(rawSettings) as Settings;
    } else {
      return DEFAULT_SETTINGS;
    }
  });

  const isGPT4 = settings.model.includes("gpt-4");

  // Auto save.
  const isSavingSettings = useDebouncedEffect(
    () => {
      console.log("Saved settings!");

      localStorage.setItem(MODEL_SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settings));
    },
    1000, // 1 second.
    [settings]
  );

  /*//////////////////////////////////////////////////////////////
                            API KEY LOGIC
  //////////////////////////////////////////////////////////////*/

  const [apiKey, setApiKey] = useLocalStorage<string>(API_KEY_LOCAL_STORAGE_KEY);

  const isAnythingLoading = isSavingReactFlow || isSavingSettings;

  useBeforeunload((event: BeforeUnloadEvent) => {
    // Prevent leaving the page before saving.
    if (isAnythingLoading) event.preventDefault();
  });

  /*//////////////////////////////////////////////////////////////
                        COPY MESSAGES LOGIC
  //////////////////////////////////////////////////////////////*/

  const copyMessagesToClipboard = () => {
    const messages = promptFromLineage(selectedNodeLineage, settings);

    if (messages) navigator.clipboard.writeText(messages);
  };

  /*//////////////////////////////////////////////////////////////
                        WINDOW RESIZE LOGIC
  //////////////////////////////////////////////////////////////*/

  useDebouncedWindowResize(autoZoomIfNecessary, 100);

  /*//////////////////////////////////////////////////////////////
                          HOTKEYS LOGIC
  //////////////////////////////////////////////////////////////*/

  useHotkeys("meta+s", save, HOTKEY_CONFIG);

  useHotkeys(
    "meta+p",
    () => newConnectedToSelectedNode(FluxNodeType.User),
    HOTKEY_CONFIG
  );
  useHotkeys(
    "meta+u",
    () => newConnectedToSelectedNode(FluxNodeType.System),
    HOTKEY_CONFIG
  );

  useHotkeys("meta+shift+p", () => newUserNodeLinkedToANewSystemNode(), HOTKEY_CONFIG);

  useHotkeys("meta+.", () => fitView(FIT_VIEW_SETTINGS), HOTKEY_CONFIG);
  useHotkeys("meta+/", onToggleSettingsModal, HOTKEY_CONFIG);
  useHotkeys("meta+shift+backspace", onClear, HOTKEY_CONFIG);

  useHotkeys("meta+z", undo, HOTKEY_CONFIG);
  useHotkeys("meta+shift+z", redo, HOTKEY_CONFIG);

  useHotkeys("meta+up", moveToParent, HOTKEY_CONFIG);
  useHotkeys("meta+down", moveToChild, HOTKEY_CONFIG);
  useHotkeys("meta+left", moveToLeftSibling, HOTKEY_CONFIG);
  useHotkeys("meta+right", moveToRightSibling, HOTKEY_CONFIG);
  useHotkeys("meta+return", submitPrompt, HOTKEY_CONFIG);
  useHotkeys(
    "meta+shift+return",
    () => newConnectedToSelectedNode(FluxNodeType.GPT),
    HOTKEY_CONFIG
  );
  useHotkeys("meta+k", completeNextWords, HOTKEY_CONFIG);
  useHotkeys("meta+backspace", deleteSelectedNodes, HOTKEY_CONFIG);

  useHotkeys("ctrl+c", copyMessagesToClipboard, HOTKEY_CONFIG);

  /*//////////////////////////////////////////////////////////////
                              APP
  //////////////////////////////////////////////////////////////*/

  return (
    <>
      {!isValidAPIKey(apiKey) && <APIKeyModal apiKey={apiKey} setApiKey={setApiKey} />}

      <SettingsModal
        settings={settings}
        setSettings={setSettings}
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        height="100vh"
        width="100%"
      >
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="stretch" expand>
          <Resizable
            maxWidth="75%"
            minWidth="20%"
            defaultSize={{
              width: "50%",
              height: "auto",
            }}
            enable={{
              top: false,
              right: true,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
            onResizeStop={autoZoomIfNecessary}
          >
            <Column
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              borderRightColor="#EEEEEE"
              borderRightWidth="1px"
              expand
            >
              <Row
                mainAxisAlignment="space-between"
                crossAxisAlignment="center"
                width="100%"
                height="50px"
                px="20px"
                borderBottomColor="#EEEEEE"
                borderBottomWidth="1px"
              >
                <NavigationBar
                  newUserNodeLinkedToANewSystemNode={() =>
                    newUserNodeLinkedToANewSystemNode()
                  }
                  newConnectedToSelectedNode={newConnectedToSelectedNode}
                  deleteSelectedNodes={deleteSelectedNodes}
                  submitPrompt={submitPrompt}
                  completeNextWords={completeNextWords}
                  undo={undo}
                  redo={redo}
                  onClear={onClear}
                  copyMessagesToClipboard={copyMessagesToClipboard}
                  moveToParent={moveToParent}
                  moveToChild={moveToChild}
                  moveToLeftSibling={moveToLeftSibling}
                  moveToRightSibling={moveToRightSibling}
                  autoZoom={autoZoom}
                  onOpenSettingsModal={() => {
                    if (MIXPANEL_TOKEN) mixpanel.track("Opened Settings Modal");
                    onOpenSettingsModal();
                  }}
                />

                <Box ml="20px">
                  {isAnythingLoading ? (
                    <Spinner size="sm" mt="6px" color={"#404040"} />
                  ) : (
                    <CheckCircleIcon color={"#404040"} />
                  )}
                </Box>
              </Row>

              <ReactFlow
                proOptions={{ hideAttribution: true }}
                nodes={nodes}
                maxZoom={1.5}
                minZoom={0}
                edges={edges}
                onInit={setReactFlow}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgesDelete={takeSnapshot}
                onNodesDelete={takeSnapshot}
                onConnect={onConnect}
                // Causes clicks to also trigger auto zoom.
                // onNodeDragStop={autoZoomIfNecessary}
                onSelectionDragStop={autoZoomIfNecessary}
                selectionKeyCode={null}
                multiSelectionKeyCode="Shift"
                panActivationKeyCode={null}
                deleteKeyCode={null}
                panOnDrag={false}
                selectionOnDrag={true}
                zoomOnScroll={false}
                zoomActivationKeyCode={null}
                panOnScroll={true}
                selectionMode={SelectionMode.Partial}
                onNodeClick={(_, node) => {
                  setLastSelectedNodeId(selectedNodeId);
                  setSelectedNodeId(node.id);
                }}
              >
                <Background />
                <Controls position="top-right" showInteractive={false} />
              </ReactFlow>
            </Column>
          </Resizable>

          <Box height="100%" width="100%" overflowY="scroll" p={4}>
            {selectedNodeLineage.length >= 1 ? (
              <Prompt
                settings={settings}
                setSettings={setSettings}
                isGPT4={isGPT4}
                selectNode={selectNode}
                newConnectedToSelectedNode={newConnectedToSelectedNode}
                lineage={selectedNodeLineage}
                onType={(text: string) => {
                  takeSnapshot();
                  setNodes((nodes) =>
                    modifyFluxNode(nodes, {
                      asHuman: true,
                      id: selectedNodeId!,
                      text,
                    })
                  );
                }}
                submitPrompt={submitPrompt}
              />
            ) : (
              <Column
                expand
                textAlign="center"
                mainAxisAlignment={"center"}
                crossAxisAlignment={"center"}
              >
                <BigButton
                  tooltip="⇧⌘P"
                  width="400px"
                  height="100px"
                  fontSize="xl"
                  onClick={() => newUserNodeLinkedToANewSystemNode()}
                  color={getFluxNodeTypeDarkColor(FluxNodeType.GPT)}
                >
                  Create a new conversation tree
                </BigButton>
              </Column>
            )}
          </Box>
        </Row>
      </Column>
    </>
  );
}

export default App;
