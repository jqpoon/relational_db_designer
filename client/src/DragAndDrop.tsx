//@ts-nocheck
import { useState, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
} from 'react-flow-renderer';
import Entity from "./components/Entity";
import { AttributeNode} from "./components/nodes";
import AttributeEdge from "./components/edges";
import Menu from "./components/menu";

import { Toolbar } from './toolbar';
import './dnd.css'


let id = 0;
const getId = () => `dndnode_${id++}`;

// Types
const edgeTypes = {
  attributeEdge: AttributeEdge,
};
const nodeTypes = {
  entity: Entity,
  attributeNode: AttributeNode,
};

export function DragAndDrop(props){
  // Ref
  const reactFlowWrapper = useRef(null);

  // State
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState([]);
  const [menuProps, setMenuProps] = useState({ display: "none" });

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

  const onConnect:any
  = (params:any) => setElements((els:any) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const onLoad = (_reactFlowInstance) =>
    setReactFlowInstance(_reactFlowInstance);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
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
            onClick={resetMenu}
          >
            <Controls />
          </ReactFlow>
        </div>
        <Toolbar />
      </ReactFlowProvider>
    </div>
    <Menu {...menuProps} setElements={setElements} />
    </>
  );
}