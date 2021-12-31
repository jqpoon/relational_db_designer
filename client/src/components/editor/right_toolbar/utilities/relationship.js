import { MdClear } from "react-icons/md";
import { types } from "../../types";
import CardinalityChoices from "./cardinality";

export function Relationships({
  relationships,
  getElement,
  updateElement,
  deleteElement,
  selected,
}) {
  return (
    <>
      {relationships.map((rel) => (
        <Relationship
          relationship={rel}
          getElement={getElement}
          updateElement={updateElement}
          deleteElement={deleteElement}
          selected={selected}
        />
      ))}
    </>
  );
}

function Relationship({
  relationship,
  getElement,
  updateElement,
  deleteElement,
  selected,
}) {
  const edge = getElement(types.EDGE.RELATIONSHIP, relationship);
  const targetId = selected.id === edge.start ? edge.end : edge.start;
  const targetType =
    selected.id === edge.start ? edge.target_type : edge.source_type;
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
      <div>
        <div>{target.text}</div>
        <div>
          <CardinalityChoices
            value={edge.cardinality}
            onChange={(e) => updateCardinality(e.target.value)}
          />
        </div>
        {selected.type === types.ENTITY ? (
          <div>
            <input
              type="checkbox"
              checked={edge.isKey}
              onChange={() => {
                let newEdge = { ...edge }; // TODO: should we use getElement instead?
                newEdge.isKey = !newEdge.isKey;
                updateElement(types.EDGE.RELATIONSHIP, newEdge);
                let newNode = getElement(selected.type, selected.id);
                if (newEdge.isKey) {
                  newNode.isWeak.push(relationship);
                } else {
                  newNode.isWeak = newNode.isWeak.filter((id) => {
                    return id !== relationship;
                  });
                }
                updateElement(selected.type, newNode);
              }}
            />
            <label style={{ fontWeight: "normal" }}>Toggle as key</label>
          </div>
        ) : null}
      </div>
      <div>
        <MdClear
          style={{ padding: "5px" }}
          onClick={() => {
            deleteElement(types.EDGE.RELATIONSHIP, edge);
          }}
        />
      </div>
    </div>
  );
}
