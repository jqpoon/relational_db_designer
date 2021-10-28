import { useState } from "react";
import Entity from "./nodes/entity";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";
import Relationship from "./nodes/relationship";

function Editor() {
  const [entities, setEntities] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [focusEntity, setFocusEntity] = useState(null);
  const [focusRs, setFocusRs] = useState(null);

  // Update position of entity
  const updateEntityPos = (data, index) => {
    let newEntities = [...entities];
    newEntities[index].pos = { x: data.x, y: data.y };
    setEntities(newEntities);
  };

  // Update position of relationship
  const updateRelationshipPos = (data, index) => {
    let newRelationships = [...relationships];
    newRelationships[index].pos = { x: data.x, y: data.y };
    setRelationships(newRelationships);
  };

  // Update text in entity
  const updateText = (text, index) => {
    let newEntities = [...entities];
    newEntities[index].text = text;
    setEntities(newEntities);
    setFocusEntity(null);
  };

  // // Blurs if some entity is in focus
  // const blurStyle =
  //   focusEntity !== null || focusRs !== null ? { filter: "blur(5px) brightness(75%)" } : null;

  return (
    <>
      <Toolbar entities={entities} setEntities={setEntities} relationships={relationships} setRelationships={setRelationships} />
      <div
        className="dnd"
        onClick={() => {setFocusEntity(null); setFocusRs(null)}}
      >
        {entities.map((e, index) => (
          <Entity
            key={index}
            index={index}
            {...e}
            updatePos={updateEntityPos}
            setFocus={setFocusEntity}
          />
        ))}

        {relationships.map((e, index) => (
          <Relationship
            key={index}
            index={index}
            {...e}
            updatePos={updateRelationshipPos}
            setFocus={setFocusRs}
            relationships={relationships}
            setRelationships={setRelationships}
          />
        ))}
      </div>
      {focusEntity !== null ? (
        <Entity
          index={focusEntity}
          {...entities[focusEntity]}
          editable
          updateText={updateText}
        />
      ) : null}

      {focusRs !== null ? (
        <Relationship
          index={focusRs}
          {...relationships[focusRs]}
          editable
          setFocus={setFocusRs}
          relationships={relationships}
          setRelationships={setRelationships}
        />
      ) : null}
    </>
  );
}

export default Editor;
