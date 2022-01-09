import { actions, types } from "../../types";
import { AddingSuperset } from "./addEdge";
import { DeleteButton } from "./deleteButton";

export function Supersets({ parents, ctx, functions }) {
  const addSuperset = () => {
    functions.setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = actions.SELECT.ADD_SUPERSET;
      newCtx.target = null;
      return newCtx;
    });
  };
  return (
    <>
      <h4 className="toolbar-section-header">Superset(s)</h4>
      {parents.map((id) => (
        <Superset id={id} functions={functions} />
      ))}
      {ctx.action === actions.SELECT.ADD_SUPERSET ? (
        <AddingSuperset {...ctx} {...functions} />
      ) : (
        <div className="toolbar-text-action" onClick={addSuperset}>
          + Add Superset
        </div>
      )}
    </>
  );
}

function Superset({ id, functions }) {
  const edge = functions.getElement(types.EDGE.HIERARCHY, id);
  const parent = functions.getElement(types.ENTITY, edge.parent);
  return (
    <div className="toolbar-section-item">
      <div style={{ display: "flex", alignItems: "" }}>
        <DeleteButton elem={edge} deleteElem={functions.deleteElement} />
        <div style={{ padding: "0px 0px 0px 10px" }}>
          <h4>{parent.text}</h4>
          {edge.generalisation ? (
            <h4>- {parent.generalisations[edge.generalisation].text}</h4>
          ) : null}
        </div>
      </div>
    </div>
  );
}
