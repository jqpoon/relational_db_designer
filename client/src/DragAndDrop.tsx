//@ts-nocheck
import { useState, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  isEdge,
  addEdge,
  removeElements,
  Controls,
} from "react-flow-renderer";
import Entity from "./components/Entity";
import { AttributeNode } from "./components/AttributeNode";
import { Relationship } from "./components/Relationship";
import AttributeEdge from "./components/Edges";
import { EditsToolbar, Toolbar } from "./components/Toolbar";
import Menu from "./components/Menu";

import "./components/dnd.css";

let id = 0;
const getId = () => `dndnode_${id++}`;

// Types
const edgeTypes = {
  attributeEdge: AttributeEdge,
};
const nodeTypes = {
  entity: Entity,
  relationship: Relationship,
  attributeNode: AttributeNode,
};

export function DragAndDrop(props) {
  // Ref
  const reactFlowWrapper = useRef(null);

  // State
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState([]);
  const [menuProps, setMenuProps] = useState({ display: "none" });
  const [isEditing, setEditing] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // Functions
  const nodeRightClick = (e: any, data: any) => {
    e.preventDefault();
    setMenuProps({
      display: "initial",
      x: e.pageX,
      y: e.pageY,
      target: data.id,
      resetMenu: resetMenu,
    });
  };

  const resetMenu = () => {
    setMenuProps({ display: "none" });
  };

  const onConnect: any = (params: any) =>
    setElements((els: any) => addEdge(params, els));
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
    <>
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              elements={elements}
              onConnect={onConnect}
              onElementsRemove={onElementsRemove}
              onLoad={onLoad}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeContextMenu={nodeRightClick}
              onElementClick={onElementClick}
              onClick={resetMenu}
            >
              <Controls />
            </ReactFlow>
          </div>
          {renderToolBar()}
        </ReactFlowProvider>
      </div>
      <Menu {...menuProps} setElements={setElements} />
    </>
  );
}
