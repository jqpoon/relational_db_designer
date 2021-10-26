import { useState } from "react";
import Entity from "./nodes/entity";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";
import Relationship from "./nodes/relationship";

function Editor() {
  const [entities, setEntities] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [focus, setFocus] = useState(null);

  // Add entity
  const addEntity = () => {
    const newEntity = {
      pos: {
        x: 50,
        y: 250,
      },
      text: "",
    };
    setEntities([...entities, newEntity]);
  };

  // Add relationship
  const addRelationship = () => {
    const newRelationship = {
      pos: {
        x: 100,
        y: 250,
      },
      text: "",
    };
    setRelationships([...relationships, newRelationship]);
  };

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
    setFocus(null);
  };

  // Blurs if some entity is in focus
  const blurStyle =
    focus !== null ? { filter: "blur(5px) brightness(75%)" } : null;

  return (
    <>
      <Toolbar addEntity={addEntity} addRelationship={addRelationship} />
      <div className="dnd" style={blurStyle} onClick={() => setFocus(null)}>
        {entities.map((e, index) => (
          <Entity
            key={index}
            index={index}
            {...e}
            updatePos={updateEntityPos}
            setFocus={setFocus}
          />
        ))}

        {relationships.map((e, index) => (
          <Relationship
            key={index}
            index={index}
            {...e}
            updatePos={updateRelationshipPos}
            setFocus={setFocus}
            relationships={relationships}
            setRelationships={setRelationships}
          />
        ))}
      </div>
      {focus !== null ? (
        <Entity
          index={focus}
          {...entities[focus]}
          editable
          updateText={updateText}
        />
      ) : null}
    </>
  );
}

export default Editor;
