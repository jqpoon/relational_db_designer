//@ts-nocheck
import { useState, useRef } from "react";
import ReactFlow, {
  Elements,
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  isNode,
  isEdge,
} from "react-flow-renderer";
import { Relationship } from "./components/nodes";
import { EditsToolbar, Toolbar } from "./components/toolbar";

import "./components/dnd.css";

// TODO(wyt): Custom node for entity, relationship
// TODO(jq): Figure out attribute display
// TODO(): Connectors between nodes
// TODO(): Figure out how to generate attribute
// TODO(iat): Toolbar for creating new nodes/&edges

const nodeTypes = {
  relationship: Relationship,
};

const initialElements = [
  {
    id: "0",
    type: "relationship",
    position: { x: 100, y: 100 },
    data: { label: "Relationship-0" },
  },
  {
    id: "1",
    type: "relationship",
    position: { x: 500, y: 500 },
    data: { label: "Relationship-1" },
  },
  { id: "e1-2", source: "0", target: "1", label: "this is an edge label" },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function App() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState<Elements>(initialElements);
  // new
  const [isEditing, setEditing] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  const onConnect = (params) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const onLoad = (_reactFlowInstance) =>
    setReactFlowInstance(_reactFlowInstance);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const newNode = {
      id: getId(),
      type,
      position,
      data: { label: `${type} node` },
    };

    setElements((es) => es.concat(newNode));
  };

  // New functions
  const exitEditing = () => {
    setSelectedEntities([]);
    setSelectedRelationship(null);
    setEditing(false);
  };

  const connectER = () => {
    // Check
    if (selectedEntities.length < 2 || selectedRelationship === null) {
      console.log(selectedEntities);
      console.log(selectedRelationship);
      alert("Invalid connections between entities and relationships.");
      exitEditing();
      return;
    }
    // Add edge
    let edges = [];
    selectedEntities.map((ent) => {
      const newEdge = {
        id: "edge+" + getId(),
        type: "straight",
        source: ent.id,
        target: selectedRelationship.id,
        label: "Edge",
      };
      console.log("NewEdge:");
      console.log(newEdge);
      edges.push(newEdge);
    });
    setElements([...elements, ...edges]);
    console.log(elements);
    exitEditing();
  };

  const onElementClick = (event, element) => {
    if (isEdge(element)) return;
    if (element.type === "relationship") {
      setSelectedRelationship(element);
    } else {
      if (selectedEntities.includes(element)) {
        setSelectedEntities(
          selectedEntities.filter((value) => {
            return value.id != element.id;
          })
        );
      } else {
        setSelectedEntities([...selectedEntities, element]);
      }
    }
  };

  const renderToolBar = () => {
    if (isEditing) {
      return (
        <EditsToolbar
          selectedEntities={selectedEntities}
          selectedRelationship={selectedRelationship}
          connectER={connectER}
          cancelConnect={exitEditing}
        />
      );
    } else {
      return <Toolbar edit={() => setEditing(true)} />;
    }
  };

  return (
    <div style={{ width: window.innerWidth, height: window.innerHeight }}>
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodeTypes={nodeTypes}
              elements={elements}
              onConnect={onConnect}
              onElementsRemove={onElementsRemove}
              onLoad={onLoad}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onElementClick={onElementClick} // new
            >
              <div className="updatenode__controls"></div>
              <Controls />
            </ReactFlow>
          </div>
          {/* new */}
          {renderToolBar()}
        </ReactFlowProvider>
      </div>
    </div>
  );
}
