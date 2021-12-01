import { actions, types } from "../types";
import { AddingSubsetViaGeneralisation } from "./utilities/addEdge";
import { DisplaySubsets } from "./utilities/listDisplay";

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

export default function SelectGeneralisation({
  generalisation,
  context,
  setContext,
  getElement,
  addElement,
  updateElement,
}) {
  const updateAction = (action) => {
    setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = action;
      newCtx.target = null;
      return newCtx;
    });
  };
  const updateName = (name) => {
    let newGen = { ...generalisation };
    newGen.text = name;
    updateElement(types.GENERALISATION, newGen);
  };
  const addSubset = () => updateAction(actions.SELECT.ADD_SUBSET);
  const parent = getElement(types.ENTITY, generalisation.parent.id);
  return (
    <div className="toolbar-right">
      <div className="toolbar-header">
        Generalisation
      </div>
      <div className="section">
        <div className="section-header">Name:</div>
        <Name name={generalisation.text} updateName={updateName} />
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
