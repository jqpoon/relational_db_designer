import CardinalityChoices from "./cardinality";
import { actions, cardinality, types } from "../../types";
import { DeleteButton } from "./deleteButton";
import { AddingRelationship } from "./addEdge";
import "../toolbar.css";
import { Tooltip } from "@mui/material";

// Main relationship properties display function
export function Relationships({ selected, relationships, functions, ctx }) {
  const addRelationship = () => {
    functions.setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = actions.SELECT.ADD_RELATIONSHIP;
      newCtx.target = null;
      return newCtx;
    });
  };

  return (
    <>
      <h4 className="toolbar-section-header">Relationship(s)</h4>
      {relationships.map((id) => (
        <Relationship selected={selected} id={id} functions={functions} />
      ))}
      {ctx.action === actions.SELECT.ADD_RELATIONSHIP ? (
        <AddingRelationship {...ctx} {...functions} />
      ) : (
        <div className="toolbar-text-action" onClick={addRelationship}>
          + Add Relationship
        </div>
      )}
    </>
  );
}

// Utility
function Relationship({ selected, id, functions }) {
  // Getting relationship info
  const edge = functions.getElement(types.EDGE.RELATIONSHIP, id);
  let targetId = null;
  let targetType = null;
  if (selected.id === edge.start) {
    targetId = edge.end;
    targetType = edge.target_type;
  } else {
    targetId = edge.start;
    targetType = edge.source_type;
  }
  const target = functions.getElement(targetType, targetId);

  // Toolbar functionalities
  const saveChanges = (change) => functions.saveChanges(edge, change);
  const updateCardinality = (card) => {
    saveChanges((rel) => {
      rel.cardinality = card;
    });
  };
  const cardinalityDisplay = () => {
    const tooltip = edge.isKey
      ? "Cardinality 1:1 must not be modified while relationship is a key"
      : "";
    return (
      <Tooltip title={tooltip} placement="left">
        <div>
          <CardinalityChoices
            disabled={edge.isKey}
            value={edge.cardinality}
            onChange={(e) => updateCardinality(e.target.value)}
          />
        </div>
      </Tooltip>
    );
  };
  const toggleAsKey = () => {
    saveChanges((rel) => {
      rel.isKey = !rel.isKey;
    });
  };
  const toggleAsKeyDisplay = () => {
    if ([selected.type, target.type].includes(types.ENTITY)) {
      const one_to_one_cardinality =
        cardinality[edge.cardinality] === cardinality.ONE_TO_ONE;
      const tooltip = one_to_one_cardinality
        ? ""
        : "Cardinality must be 1:1 for relationship to be a key";
      return (
        <Tooltip title={tooltip} placement="left">
          <div>
            <input
              disabled={!one_to_one_cardinality}
              type="checkbox"
              checked={edge.isKey}
              onChange={toggleAsKey}
            />
            <label style={{ fontWeight: "normal" }}>Toggle as key</label>
          </div>
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <div className="toolbar-section-item">
      <div style={{ display: "flex" }}>
        <DeleteButton elem={edge} deleteElem={functions.deleteElement} />
        <div style={{ padding: "8px 0px 0px 5px" }}>
          {/* Name of target */}
          {target.text}
          {/* Cardinality */}
          {cardinalityDisplay()}
          {/* Option to toggle relationship as key for enabling weak entities */}
          {toggleAsKeyDisplay()}
        </div>
      </div>
    </div>
  );
}
