// @ts-nocheck
import { useRef, useEffect } from "react";
import { Handle, HandleType, Position } from "react-flow-renderer";
import "./nodes.css";

export interface NodeData {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export function Entity(props: NodeData) {
  return {
    id: props.id,
    type: "default",
    position: { x: props.position.x, y: props.position.y },
    data: { label: props.label },
  };
}

// TODO(wyt): other method to do diamonds / pad text within diamond
export function Relationship({ data }) {
  const canvasRef = useRef(null);
  const drawBorder = (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, 0);
    ctx.lineTo(0, ctx.canvas.height / 2);
    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
    ctx.lineTo(ctx.canvas.width / 2, 0);
    ctx.stroke();
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    drawBorder(context);
  }, []);
  const node = (
    <div
      className="node"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "fit-content",
        height: "fit-content",
      }}
    >
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
      <div></div>
      <div
        style={{
          padding: "50px",
          maxWidth: "150px",
          textAlign: "center",
          wordWrap: "break-word",
        }}
      >
        {data.label}
      </div>
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Right} />
    </div>
  );
  return node;
}
