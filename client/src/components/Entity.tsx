import React, { useState } from "react";
import "./nodes.css";

// @ts-nocheck
import { Handle, Position } from "react-flow-renderer";

export default function Entity(props: any) {
  const [value, setValue] = useState("");
  const [text, updateText] = useState(props.data.text);
  const [seen, setSeen] = useState("block");

  return (
    <div
      className="entity"
      style={{ alignItems: "center", textAlign: "center" }}
      onDoubleClick={() => {
        updateText("");
        setSeen("block");
      }}
    >
      <Handle type="target" position={Position.Left} />
      <input
        value={value}
        style={{ display: seen, width: "100%" }}
        placeholder="entity name"
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            updateText(value);
            setSeen("none");
          }
        }}
      />
      <div style={{width:"100%"}}> {text} </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
