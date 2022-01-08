import { actions, types } from "../types";
import { AddingSubsetViaGeneralisation } from "./utilities/addEdge";
import { DisplaySubsets } from "./utilities/listDisplay";
import { Name } from "./utilities/name";

export default function SelectGeneralisation({
  generalisation,
  context,
  setContext,
  getElement,
  addElement,
  updateElement,
  deleteElement,
}) {
  if (!generalisation) {
    setContext({ action: actions.NORMAL });
    return null;
  }
  const updateAction = (action) => {
    setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = action;
      newCtx.target = null;
      return newCtx;
    });
  };
  const addSubset = () => updateAction(actions.SELECT.ADD_SUBSET);
  const parent = getElement(types.ENTITY, generalisation.parent.id);
  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Generalisation</div>
      <div className="section">
        <div
          className="section-header"
          onClick={() => {
            deleteElement(types.GENERALISATION, generalisation);
            setContext({ action: actions.NORMAL });
          }}
        >
          Delete
        </div>
      </div>
      <div className="section">
        <div className="section-header">Name:</div>
        <Name
          {...generalisation}
          getElement={getElement}
          updateElement={updateElement}
        />
      </div>
      <div className="section">
        <div className="section-header">Parent</div>
        {parent.text}
      </div>
      <div className="section">
        <div className="section-header">Subsets</div>
        <DisplaySubsets
          children={Object.keys(generalisation.edges)}
          getElement={getElement}
          deleteElement={deleteElement}
        />
        {context.action === actions.SELECT.ADD_SUBSET ? (
          <AddingSubsetViaGeneralisation
            {...context}
            setContext={setContext}
            getElement={getElement}
            addElement={addElement}
            updateElement={updateElement}
          />
        ) : (
          <div className="section-tool" onClick={addSubset}>
            + Add Subset
          </div>
        )}
      </div>
    </div>
  );
}
