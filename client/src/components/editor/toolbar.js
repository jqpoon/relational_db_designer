import Draggable from "react-draggable";
import { useRef } from "react";
import "./stylesheets/toolbar.css";
import { types } from "./types";

export default function Toolbar({
  addEdgeToRelationship,
  getId,
  addElement,
  undo,
  redo,
}) {
  const entityToolRef = useRef(null);
  const relationshipToolRef = useRef(null);

  const addEntity = (x, y) => {
    const newEntity = {
      id: getId(),
      pos: {
        x: x,
        y: y,
      },
      text: "Enter Text",
      type: types.ENTITY,
      edges: {},
      attributes: {},
      generalisations: {},
    };
    addElement(types.ENTITY, newEntity);
  };

  const addRelationship = (x, y) => {
    const newRelationship = {
      id: getId(),
      pos: {
        x: x,
        y: y,
      },
      text: "",
      type: types.RELATIONSHIP,
      edges: {},
    };
    addElement(types.RELATIONSHIP, newRelationship);
  };

  return (
    <div className="toolbar">
      <Draggable
        ref={entityToolRef}
        onStop={(e, data) => {
          addEntity(data.x - 125, data.y);
          entityToolRef.current.state.x = 0;
          entityToolRef.current.state.y = 0;
        }}
      >
        <p className="tool">Entity</p>
      </Draggable>
      <Draggable
        ref={relationshipToolRef}
        onStop={(e, data) => {
          addRelationship(data.x - 125, data.y);
          relationshipToolRef.current.state.x = 0;
          relationshipToolRef.current.state.y = 0;
        }}
      >
        <p className="tool">Relationship</p>
      </Draggable>
      <div className="tool" onClick={addEdgeToRelationship}>
        Connect to Relationship
      </div>
      <div className="footer">
        <div className="tool" onClick={undo}>
          Undo
        </div>
        <div className="tool" onClick={redo}>
          Redo
        </div>
        <div className="tool">Load</div>
        <div className="tool">Save</div>
        <div className="tool">Translate</div>
        <div className="tool">Validate</div>
      </div>
    </div>
  );
}
