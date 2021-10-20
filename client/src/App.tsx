//@ts-nocheck
import { useState } from "react";
import ReactFlow, {ArrowHeadType} from "react-flow-renderer";
import { NodeData , AttributeNode} from "./components/nodes";
import AttributeEdge from "./components/edges";
import Menu from "./components/menu";

// TODO(wyt): Custom node for entity, relationship
// TODO(jq): Figure out attribute display
// TODO(): Connectors between nodes
// TODO(): Figure out how to generate attribute
// TODO(iat): Toolbar for creating new nodes/&edges

const sampleEntities = [
  {
    id: "e1",
    label: "Entity-1",
    position:{x:250, y:25},
  },
];

export default function App() {

  var initialElements = [
    {
      id: "1",
      type: "input", // input node
      data: { label: "Input Node" },
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
      type: "attributeNode", // output node/
      data: { label: "attribute1" },
      position: { x: 250, y: 250 },
    },
    { id: "e3-1", source: "2", target: "3", type:"attributeEdge"},
  
    { id: "e1-2", source: "1", target: "2", animated: true }
  ];

  const [elements, setElements] = useState(initialElements)

  const edgeTypes = {
    attributeEdge: AttributeEdge,
  };
  
  const nodeTypes = {
    attributeNode: AttributeNode,
  };

  const [menuProps, setMenuProps] = useState({ display: "none" });

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

    return (
        <>
            <div style={{ height: window.innerHeight, width: window.innerWidth }}>
                <ReactFlow
                    elements={elements}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodeContextMenu={nodeRightClick}
                    onClick={resetMenu}
                />
            </div>
            <Menu {...menuProps} setElements={setElements} />
        </>
    );
}
