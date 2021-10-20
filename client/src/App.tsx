import React, { useState } from "react";
import ReactFlow, { Elements } from "react-flow-renderer";
import { Relationship } from "./components/nodes";

const nodeTypes = {
  relationship: Relationship,
};

const initialElements = [
  {
    id: "1",
    type: "relationship",
    position: { x: 100, y: 100 },
    data: { label: "Relationship" },
  },
];

export default function App() {
  const [elements, setElements] = useState<Elements>(initialElements);
  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      <ReactFlow nodeTypes={nodeTypes} elements={elements} />
    </div>
  );
}
