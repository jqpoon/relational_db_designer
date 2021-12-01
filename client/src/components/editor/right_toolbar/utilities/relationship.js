import { types } from "../../types";
import CardinalityChoices from "./cardinality";

export function Relationships({ relationships, getElement, updateElement }) {
  return (
    <>
      {relationships.map((rel) => (
        <Relationship
          relationship={rel}
          getElement={getElement}
          updateElement={updateElement}
        />
      ))}
    </>
  );
}

function Relationship({ relationship, getElement, updateElement, selected }) {
  const edge = getElement(types.EDGE.RELATIONSHIP, relationship);
  const targetId = selected === edge.start ? edge.end : edge.start;
  const targetType =
    selected === edge.start ? edge.target_type : edge.source_type;
  const target = getElement(targetType, targetId);
  // TODO: nested relationship - which do we store as src/target
  const updateCardinality = (card) => {
    const newRel = { ...edge };
    newRel.cardinality = card;
    updateElement(types.EDGE.RELATIONSHIP, newRel);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px",
      }}
    >
      <div>{target.text}</div>
      <div>
        <CardinalityChoices
          value={edge.cardinality}
          onChange={(e) => updateCardinality(e.target.value)}
        />
      </div>
    </div>
  );
}
