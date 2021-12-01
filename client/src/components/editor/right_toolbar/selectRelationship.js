import { actions, types } from "../types";
import "./toolbar-right.css";
import { RelationshipAdding } from "./utilities/addEdge";
import { DisplayRelationships } from "./utilities/listDisplay";
import CardinalityChoices from "./utilities/cardinality";
import { AddAttribute, Attributes } from "./utilities/attribute";

export function Name({ name, updateName }) {
  return (
    <div style={{ padding: "5px" }}>
      <input
        type="text"
        style={{ fontSize: "medium" }}
        value={name}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
}
export function Relationship({ relationship, getElement, updateElement }) {
  const edge = getElement(types.EDGE.RELATIONSHIP, relationship);
  const target = getElement(edge.source_type, edge.start);
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

export default function SelectRelationship({
  relationship,
  getElement,
  addElement,
  updateElement,
  context,
  setContext,
}) {
  const addConnection = () => {
    setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = actions.SELECT.ADD_RELATIONSHIP;
      newCtx.target = null;
      return newCtx;
    });
  };

  const updateName = (name) => {
    let newRelationship = { ...relationship };
    newRelationship.text = name;
    updateElement(types.RELATIONSHIP, newRelationship);
  };

  const utilities = {
    getElement: getElement,
    addElement: addElement,
    updateElement: updateElement,
  };

  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Relationship</div>
      <div>Label: {relationship.id}</div>

      {/* Name Section */}
      <div className="section">
        <div className="section-header">Name:</div>
        <Name name={relationship.text} updateName={updateName} />
      </div>

      {/* Attributes Section */}
      <div className="section">
        <div className="section-header">Attributes</div>
        <Attributes
          attributes={Object.values(relationship.attributes)}
          updateElement={updateElement}
        />
        <AddAttribute
          parentType={types.RELATIONSHIP}
          parentId={relationship.id}
          {...utilities}
        />
      </div>

      {/* Connections Section */}
      <div className="section">
        <div className="section-header">Connections</div>
        <Relationships
          relationships={Object.keys(relationship.edges)}
          getElement={getElement}
          updateElement={updateElement}
        />
        {context.action === actions.SELECT.ADD_RELATIONSHIP ? (
          <RelationshipAdding
            {...context}
            setContext={setContext}
            getElement={getElement}
            addElement={addElement}
            updateElement={updateElement}
          />
        ) : (
          <div className="section-tool" onClick={addConnection}>
            + Add Connection
          </div>
        )}
      </div>
    </div>
  );
}
