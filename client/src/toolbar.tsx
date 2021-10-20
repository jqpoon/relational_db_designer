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
      <div className="dndnode" style={{border: '1px solid black'}} onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Entity Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Relationship Node
      </div>
    </aside>
  );
}