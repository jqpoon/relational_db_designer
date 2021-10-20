// @ts-nocheck
import React from "react";
import ReactFlow from "react-flow-renderer";
import Entity, { NodeData } from "./components/nodes";
import { DragAndDrop } from "./DragAndDrop";
import { EditableNode } from "./components/EditableNode";

// TODO(wyt): Custom node for entity, relationship
// TODO(jq): Figure out attribute display
// TODO(): Connectors between nodes
// TODO(): Figure out how to generate attribute
// TODO(iat): Toolbar for creating new nodes/&edges

export default function App() {
  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      <DragAndDrop/>
    </div>
  );
}
