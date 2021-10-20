import ReactFlow from "react-flow-renderer";

export interface NodeData {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export default function Entity(props: NodeData) {
  return {
    id: props.id,
    type: "default",
    position: {x: props.position.x, y: props.position.y},
    data: {text: props.label},
  };
}