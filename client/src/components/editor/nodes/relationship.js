import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import "./stylesheets/entity.css";
import "./stylesheets/relationship.css";

export default function Relationship({
  index,
  pos,
  text,
  editable,
  updatePos,
  setFocus,
  relationships,
  setRelationships,
}) {
  const relationshipRef = useRef(null);
  const [value, setValue] = useState(text);

  // Update text in entity
  const updateText = (text, index) => {
    let newRelationships = [...relationships];
    newRelationships[index].text = text;
    setRelationships(newRelationships);
    setFocus(null);
  };

  // Event listener for context menu
  useEffect(() => {
    const entityCurr = relationshipRef.current;
    const handler = (e) => {
      e.preventDefault();
      setFocus(index);
    };
    if (entityCurr) {
        entityCurr.addEventListener("contextmenu", handler);

    return () => {
      entityCurr.removeEventListener("contextmenu", handler);
    };
}
  }, []);

  // If editable, it's a pop up
  const style = editable
    ? {
        position: "absolute",
        top: 0,
        left: document.documentElement.clientWidth * 0.1,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }
    : null;

  let relationship = (
    <Draggable
      nodeRef={relationshipRef}
      defaultPosition={pos}
      onStop={(e, data) => {
        updatePos(data, index);
      }}
    >
      <div className="relationship">
        <div className="diamond">
          <div className="diamond-text">{text}</div>
        </div>
      </div>
    </Draggable>
  );

  if (!editable) {
    relationship = (
      <Draggable
        nodeRef={relationshipRef}
        defaultPosition={pos}
        onStop={(e, data) => {
          updatePos(data, index);
        }}
      >
        {relationship}
      </Draggable>
    );
  }

  return relationship;
}
