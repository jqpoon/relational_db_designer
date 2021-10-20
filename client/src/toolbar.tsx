//@ts-nocheck
import React from 'react';
import './dnd.css'

export function Toolbar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the left.</div>
      <div className="react-flow__node-default"  onDragStart={(event) => onDragStart(event, 'entity')} draggable>
        Entity Node
      </div>
      <div className="react-flow__node-output" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Relationship Node
      </div>
    </aside>
  );
}