import Draggable from "react-draggable";
import { useRef } from "react";
import "./stylesheets/toolbar.css";
import { types } from "./types";

export default function Toolbar({
  addAttribute,
  addEdgeToRelationship,
  getId,
  addNode,
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
      edges: [],
      parents: [],
      children: [],
    };
    addNode(types.ENTITY, newEntity);
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
      edges: [],
    };
    addNode(types.RELATIONSHIP, newRelationship);
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
        <p className="entity-tool">Entity</p>
      </Draggable>
      <Draggable
        ref={relationshipToolRef}
        onStop={(e, data) => {
          addRelationship(data.x - 125, data.y);
          relationshipToolRef.current.state.x = 0;
          relationshipToolRef.current.state.y = 0;
        }}
      >
        <p className="entity-tool">Relationship</p>
      </Draggable>
      <div className="tool" onClick={addEdgeToRelationship}>
        Connect to Relationship
      </div>
    </div>
  );
}
