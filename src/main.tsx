import React from "react";

import ReactDOM from "react-dom/client";

import { ReactFlowProvider } from "reactflow";

import { ChakraProvider } from "@chakra-ui/react";

import App from "./components/App";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ReactFlowProvider>
  </React.StrictMode>
);
