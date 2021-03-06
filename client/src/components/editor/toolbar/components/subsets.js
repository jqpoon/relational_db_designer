import { useState } from "react";
import { createGeneralisation } from "../../elements/generalisations/generalisation";
import { actions, types } from "../../types";
import { AddingSubset } from "./addEdge";
import { DeleteButton } from "./deleteButton";
import { Name } from "./name";

// Main generalisation and subsets display function
export function GeneralisationAndSubsets({
  ctx,
  parent,
  generalisations,
  directChildren,
  functions,
}) {
  const [selectedGeneralisation, setSelectedGeneralisation] = useState(null);
  const addGeneralisation = () => {
    functions.addElement(
      types.GENERALISATION,
      createGeneralisation(parent.id, parent.pos)
    );
  };
  const addSubset = (generalisationId) => {
    setSelectedGeneralisation(generalisationId);
    functions.setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = actions.SELECT.ADD_SUBSET;
      newCtx.target = null;
      return newCtx;
    });
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
            <div style={{ display: "flex" }}>
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
                <Subsets
                  children={Object.keys(generalisation.edges)}
                  generalisation={generalisation}
                  ctx={ctx}
                  functions={functions}
                  selected={selectedGeneralisation === generalisation.id}
                  select={addSubset}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Without generalisation */}
      <div>Without generalisation:</div>
      <Subsets
        generalisation={null}
        children={directChildren}
        ctx={ctx}
        functions={functions}
        selected={selectedGeneralisation === null}
        select={addSubset}
      />
    </>
  );
}

// Main subsets display function
export function Subsets({
  generalisation,
  children,
  functions,
  ctx,
  select,
  selected,
}) {
  const addSubsetDisplay = (generalisation) => {
    if (ctx.action === actions.SELECT.ADD_SUBSET && selected) {
      return (
        <AddingSubset {...ctx} {...functions} generalisation={generalisation} />
      );
    } else {
      return (
        <div
          className="toolbar-text-action"
          onClick={() => select(generalisation ? generalisation.id : null)}
        >
          + Add Subset
        </div>
      );
    }
  };

  return (
    <>
      {children.map((id) => (
        <Subset id={id} functions={functions} />
      ))}
      {addSubsetDisplay(generalisation)}
    </>
  );
}

// Subset display utility
function Subset({ id, functions }) {
  const edge = functions.getElement(types.EDGE.HIERARCHY, id);
  const child = functions.getElement(types.ENTITY, edge.child);

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <DeleteButton elem={edge} deleteElem={functions.deleteElement} />
      <div style={{ padding: "8px 0px 0px 0px" }}>{child.text}</div>
    </div>
  );
}
