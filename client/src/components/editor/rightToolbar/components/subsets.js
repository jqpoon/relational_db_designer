import { useState } from "react";
import { createGeneralisation } from "../../elements/generalisations/generalisation";
import { actions, types } from "../../types";
import { AddingSubset } from "./addEdge";
import { DeleteButton } from "./deleteButton";
import { Name } from "./name";

export function Subsets({
  ctx,
  parent,
  generalisations,
  directChildren,
  functions,
}) {
  const [selectedGeneralisation, setSelectedGeneralisation] = useState(null);
  const addSubset = (generalisation) => {
    setSelectedGeneralisation(generalisation);
    functions.setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = actions.SELECT.ADD_SUBSET;
      newCtx.target = null;
      return newCtx;
    });
  };
  const addGeneralisation = () => {
    functions.addElement(
      types.GENERALISATION,
      createGeneralisation(parent.id, parent.pos)
    );
  };
  const addSubsetDisplay = (generalisation) => {
    if (
      ctx.action === actions.SELECT.ADD_SUBSET &&
      selectedGeneralisation === generalisation
    ) {
      return (
        <AddingSubset {...ctx} {...functions} generalisation={generalisation} />
      );
    } else {
      return (
        <div
          className="toolbar-text-action"
          onClick={() => addSubset(generalisation)}
        >
          + Add Subset
        </div>
      );
    }
  };
  return (
    <>
      <h4 className="toolbar-section-header">Subset(s)</h4>
      <div className="toolbar-text-action" onClick={addGeneralisation}>
        + Add Generalisation
      </div>
      {/* With generalisation */}
      {generalisations.map((generalisation) => {
        return (
          <div className="toolbar-section-item">
            <div style={{ display: "flex", alignItems: "center" }}>
              <DeleteButton
                elem={generalisation}
                deleteElem={functions.deleteElement}
              />
              <div style={{ padding: "0px 5px" }}>
                <Name
                  name={generalisation.text}
                  saveChanges={(change) =>
                    functions.saveChanges(generalisation, change)
                  }
                />
              </div>
            </div>
            {Object.keys(generalisation.edges).map((id) => (
              <Subset id={id} functions={functions} />
            ))}
            {addSubsetDisplay(generalisation.id)}
          </div>
        );
      })}
      {/* Without generalisation */}
      <div>Without generalisation:</div>
      {directChildren.map((id) => (
        <Subset id={id} functions={functions} />
      ))}
      {addSubsetDisplay(null)}
    </>
  );
}

function Subset({ id, functions }) {
  const edge = functions.getElement(types.EDGE.HIERARCHY, id);
  const child = functions.getElement(types.ENTITY, edge.child);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0px 0px 0px 18px",
      }}
    >
      <DeleteButton elem={edge} deleteElem={functions.deleteElement} />
      <div style={{ padding: "0px 0px 5px 5px" }}>{child.text}</div>
    </div>
  );
}
