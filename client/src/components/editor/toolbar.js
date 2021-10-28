import Draggable from "react-draggable";
import { useRef } from "react";
import "./stylesheets/toolbar.css";

export default function Toolbar({ setEntities, entities, setRelationships, relationships }) {
  const entityToolRef = useRef(null);
  const relationshipToolRef = useRef(null);

  const addEntity = (x, y) => {
    const newEntity = {
      pos: {
        x: x,
        y: y,
      },
      text: "",
    };
    setEntities([...entities, newEntity]);
  };

  const addRelationship = (x, y) => {
    const newRelationship = {
      pos: {
        x: x,
        y: y,
      },
      text: "",
    };
    setRelationships([...relationships, newRelationship]);
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
      <p className="entity-tool" >
        Relationship
      </p>
	  </Draggable>
    </div>
  );
}
