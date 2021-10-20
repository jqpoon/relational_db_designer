//@ts-nocheck
import React from "react";
import "./dnd.css";

const relateNodes = (e) => {
  console.log("Relating Nodes");
};

export function Toolbar(props) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside>
      <div className="description">
        You can drag these nodes to the pane on the left.
      </div>
      <div
        className="react-flow__node-input"
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Entity Node
      </div>
      <div
        className="react-flow__node-output"
        onDragStart={(event) => onDragStart(event, "relationship")}
        draggable
      >
        Relationship Node
      </div>
      <div className="react-flow__node-default" onClick={props.edit}>
        Relate Nodes
      </div>
    </aside>
  );
}

export function EditsToolbar(props) {
  const renderNodes = (nodes) => {
    return nodes.map((node) => {
      if (node.type === "relationship") {
        return <div className="react-flow__node-output">{node.data.label}</div>;
      } else {
        return <div className="react-flow__node-input">{node.data.label}</div>;
      }
    });
  };
  return (
    <aside>
      <div className="description">Relating Entities via a Relationship</div>
      <div>
        <label for="entities">Choose at least 2 entities:</label>
      </div>
      <div>{renderNodes(props.selected)}</div>
      <div className="react-flow__node-default" onClick={props.connectER}>
        Connect
      </div>
      <div className="react-flow__node-default" onClick={props.cancelConnect}>
        Cancel
      </div>
    </aside>
  );
}
