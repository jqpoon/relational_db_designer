import { DisplaySubsets, DisplaySupersets } from "./utilities/listDisplay";
import {
  AddingRelationship,
  AddingSubset,
  AddingSuperset,
} from "./utilities/addEdge";
import { actions, types } from "../types";
import { useState } from "react";

import "./toolbar-right.css";
import Divider from "./utilities/divider";
import { AddAttribute, Attributes } from "./utilities/attribute";
import { getId } from "../idGenerator";
import { Name } from "./utilities/name";
import { Relationships } from "./utilities/relationship";
import { MdClear } from "react-icons/md";
import Normal from "./normal";

export function Generalisation({
  generalisation,
  getElement,
  updateElement,
  deleteElement,
}) {
  const updateGeneralisationName = (name) => {
    let newGeneralisation = { ...generalisation };
    newGeneralisation.text = name;
    updateElement(types.GENERALISATION, newGeneralisation);
  };
  const generalisationName = (
    <input
      type="text"
      style={{ fontSize: "medium" }}
      value={generalisation.text}
      onChange={(e) => {
        updateGeneralisationName(e.target.value);
      }}
    />
  );
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <div>{generalisationName}</div>
        <div>
          <MdClear
            onClick={() => {
              deleteElement(types.GENERALISATION, generalisation);
            }}
          />
        </div>
      </div>
      <Divider />
      {/* TODO: refactor */}
      <DisplaySubsets
        children={Object.keys(generalisation.edges)}
        getElement={getElement}
      />
    </>
  );
}

export default function SelectEntity({
  entity,
  getElement,
  addElement,
  updateElement,
  deleteElement,
  context,
  setContext,
}) {
  // For use with adding subsets under generalisations
  const [selectedGeneralisation, setGeneralisation] = useState(null);
  if (!entity) {
    setContext({ action: actions.NORMAL });
    return <Normal />;
  }

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
  const addSubset = (generalisation) => {
    setGeneralisation(generalisation);
    updateAction(actions.SELECT.ADD_SUBSET);
  };

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

  const utilities = {
    ...context,
    setContext: setContext,
    getElement: getElement,
    addElement: addElement,
    updateElement: updateElement,
  };

  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Entity</div>
      <div className="section">
        <div
          className="section-header"
          onClick={() => {
            deleteElement(types.ENTITY, entity);
            setContext({ action: actions.NORMAL });
          }}
        >
          Delete
        </div>
      </div>
      {/* Name Section */}
      <div className="section">
        <div className="section-header">Name:</div>
        <Name {...entity} {...utilities} />
      </div>

      {/* Attributes Section */}
      <div className="section">
        <div className="section-header">Attributes</div>
        <Attributes
          attributes={Object.values(entity.attributes)}
          updateElement={updateElement}
          deleteElement={deleteElement}
        />
        <AddAttribute
          parentType={types.ENTITY}
          parentId={entity.id}
          {...utilities}
        />
      </div>

      {/* Relationships Section */}
      <div className="section">
        <div className="section-header">Relationships</div>
        <Relationships
          relationships={relationships}
          getElement={getElement}
          updateElement={updateElement}
          deleteElement={deleteElement}
          selected={{ id: entity.id, type: types.ENTITY }}
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
        <DisplaySupersets
          parents={parents}
          getElement={getElement}
          deleteElement={deleteElement}
        />
        {context.action === actions.SELECT.ADD_SUPERSET ? (
          <AddingSuperset {...utilities} />
        ) : (
          <div className="section-tool" onClick={addSuperset}>
            + Add Superset
          </div>
        )}
      </div>
      {/* Subset sections */}
      <div className="section">
        <div className="section-header">Subset(s)</div>
        <div
          className="section-tool"
          onClick={() => {
            const generalisation = {
              id: getId(types.GENERALISATION, entity.id),
              type: types.GENERALISATION,
              parent: { id: entity.id },
              text: "Generalisation",
              pos: { x: entity.pos.x, y: entity.pos.y + 200 }, // TODO: discuss how to set generalisation node position
              edges: {},
            };
            addElement(types.GENERALISATION, generalisation);
          }}
        >
          + Add Generalisation
        </div>
        {Object.values(entity.generalisations).map((generalisation) => {
          return (
            <>
              <Generalisation
                generalisation={generalisation}
                getElement={getElement}
                updateElement={updateElement}
                deleteElement={deleteElement}
              />
              {context.action === actions.SELECT.ADD_SUBSET &&
              selectedGeneralisation === generalisation.id ? (
                <AddingSubset
                  {...utilities}
                  generalisation={generalisation.id}
                />
              ) : (
                <div
                  className="section-tool"
                  onClick={() => addSubset(generalisation.id)}
                >
                  + Add Subset
                </div>
              )}
            </>
          );
        })}
        <div>Without generalisation</div>
        <Divider />
        <DisplaySubsets
          generalisation={null}
          children={children}
          getElement={getElement}
          deleteElement={deleteElement}
        />
        {context.action === actions.SELECT.ADD_SUBSET &&
        selectedGeneralisation === null ? (
          <AddingSubset {...utilities} generalisation={null} />
        ) : (
          <div className="section-tool" onClick={() => addSubset(null)}>
            + Add Subset
          </div>
        )}
      </div>
    </div>
  );
}
