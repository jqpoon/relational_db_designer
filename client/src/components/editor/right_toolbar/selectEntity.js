import {
  DisplayAttributes,
  DisplayRelationships,
  DisplaySubsets,
  DisplaySupersets,
} from "./utilities/listDisplay";
import {
  AddingRelationship,
  AddingSubset,
  AddingSuperset,
} from "./utilities/addEdge";
import { actions, types } from "../types";

import "./toolbar-right.css";

export default function SelectEntity({
  entity,
  getElement,
  addElement,
  updateElement,
  context,
  setContext,
}) {
  const updateAction = (action) => {
    setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = action;
      newCtx.target = null;
      return newCtx;
    });
  };
  const addRelationship = () => updateAction(actions.SELECT.ADD_RELATIONSHIP);
  const addSuperset = () => updateAction(actions.SELECT.ADD_SUPERSET);
  const addSubset = () => updateAction(actions.SELECT.ADD_SUBSET);

  // Split edges into relevant groups
  let relationships = [];
  let parents = [];
  let children = [];
  Object.entries(entity.edges).forEach(([id, { type }]) => {
    switch (type) {
      case types.EDGE.RELATIONSHIP:
        relationships.push(id);
        break;
      case types.EDGE.HIERARCHY:
        // TODO: add null check?
        const isParent = getElement(type, id).parent === context.selected.id;
        const group = isParent ? children : parents;
        group.push(id);
        break;
      default:
        console.log(`Error: Invalid edge type "${type}"`);
    }
  });

  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Entity</div>
      {/* Name Section */}
      <div className="section">
        <div className="section-header">Name: {entity.text}</div>
        <div className="section-content">(TODO: make editable)</div>
      </div>
      {/* Attributes Section */}
      <div className="section">
        <div className="section-header">Attributes</div>
        <DisplayAttributes attributes={Object.values(entity.attributes)} />
      </div>
      {/* Relationships Section */}
      <div className="section">
        <div className="section-header">Relationships</div>
        <DisplayRelationships
          relationships={relationships}
          getElement={getElement}
          isSource={true}
        />
        {context.action === actions.SELECT.ADD_RELATIONSHIP ? (
          <AddingRelationship
            {...context}
            setContext={setContext}
            getElement={getElement}
            addElement={addElement}
            updateElement={updateElement}
          />
        ) : (
          <div className="section-tool" onClick={addRelationship}>
            + Add Relationship
          </div>
        )}
      </div>
      {/* Superset sections */}
      <div className="section">
        <div className="section-header">Superset(s)</div>
        <DisplaySupersets parents={parents} getElement={getElement} />
        {context.action === actions.SELECT.ADD_SUPERSET ? (
          <AddingSuperset
            {...context}
            setContext={setContext}
            getElement={getElement}
            addElement={addElement}
            updateElement={updateElement}
          />
        ) : (
          <div className="section-tool" onClick={addSuperset}>
            + Add Superset
          </div>
        )}
      </div>
      {/* Subset sections */}
      <div className="section">
        <div className="section-header">Subset(s)</div>
        {entity.generalisations
          ? Object.values(entity.generalisations).map((generalisation) => {
              return (
                <>
                  <div>Generalisation: {generalisation.text}</div>
                  <DisplaySubsets
                    children={Object.keys(generalisation.edges)}
                    getElement={getElement}
                  />
                </>
              );
            })
          : null}
        {children.length === 0 ? null : (
          <>
            <div>Without Generalisations</div>
            <DisplaySubsets children={children} getElement={getElement} />
          </>
        )}

        {context.action === actions.SELECT.ADD_SUBSET ? (
          <AddingSubset
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
