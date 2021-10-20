import ReactFlow, { Handle, Position } from "react-flow-renderer";

export interface NodeData {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export function Entity(props: NodeData) {
  return {
    id: props.id,
    type: "default",
    position: {x: props.position.x, y: props.position.y},
    data: {text: props.label},
  };
}

export function AttributeNode(data: any) {
  return (
    <div>
      <Handle
        type="source"
        position={Position.Top} // Need to change top/bottom/right/left depending on where the node is
        // style={{ backgroundColor : 'white'}}
        style={{ visibility: 'hidden' }}
      />
      <div>{data.data.label}</div>
    </div>
  );
}; 