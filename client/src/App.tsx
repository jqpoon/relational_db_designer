// @ts-nocheck
import React from "react";
import ReactFlow from "react-flow-renderer";
import { DragAndDrop } from "./DragAndDrop";
import { Entity } from "./components/Entity";

// TODO(wyt): Custom node for entity, relationship
// TODO(jq): Figure out attribute display
// TODO(): Connectors between nodes
// TODO(): Figure out how to generate attribute
// TODO(iat): Toolbar for creating new nodes/&edges
const nodeTypes = {
  entity: Entity,
};

const elements = [
  {
    id: "1",
    type: "entity", // input node
    data: { text: "" },
    position: { x: 250, y: 25 },
  },
  // default node
  {
    id: "2",
    // you can also pass a React component as a label
    data: { label: <div>Default Node</div> },
    position: { x: 100, y: 125 },
  },
  {
    id: "3",
    type: "output", // output node
    data: { label: "Output Node" },
    position: { x: 250, y: 250 },
  },
  // animated edge
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3" },
];

const sampleEntities = [
  {
    id: "e1",
    label: "Entity-1",
    position:{x:250, y:25},
  },
];

export default function App() {
  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      {/* <ReactFlow elements={elements} nodeTypes={nodeTypes} /> */}
      <DragAndDrop nodeTypes={nodeTypes} />
    </div>
  );
}
