import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useXarrow } from 'react-xarrows';
import "./stylesheets/entity.css";
import "./stylesheets/relationship.css";

export default function Relationship({
  index,
  id,
  pos,
  text,
  editable,
  updatePos,
  setFocus,
  relationships,
  setRelationships,
  modifyContext,
}) {
  const updateXarrow = useXarrow();
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
    <div
      id={id}
      className="relationship"
      style={style}
      ref={relationshipRef}
      onClick={() => modifyContext(index, "ent")}
    >
      <div className="diamond">
        {editable ? (
          <div className="diamond-input">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  updateText(value, index);
                }
              }}
            />
          </div>
        ) : (
          <div className="diamond-text">{text}</div>
        )}
      </div>
    </div>
  );

  if (!editable) {
    relationship = (
      <Draggable
        nodeRef={relationshipRef}
        defaultPosition={pos}
        onDrag={updateXarrow}
        onStop={(e, data) => {
          updatePos(data, index);
          updateXarrow(e);
        }}
      >
        {relationship}
      </Draggable>
    );
  }

  return relationship;
}
