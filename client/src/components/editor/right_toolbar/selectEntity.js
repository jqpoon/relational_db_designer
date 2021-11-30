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
import { actions, cardinality, types } from "../types";
import { useState } from "react";

import "./toolbar-right.css";
import { generateID } from "./utilities/general";
import Divider from "./utilities/divider";
import { EditableText, EditOnIcon } from "./utilities/components";
import { addAttributeToNode } from "../edges/attribute";

import { MdCheck, MdModeEdit } from "react-icons/md";
import CardinalityChoices from "./utilities/cardinality";

export function Relationship({ relationship, getElement, updateElement }) {
  const edge = getElement(types.EDGE.RELATIONSHIP, relationship);
  const rel = getElement(edge.target_type, edge.end);

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
      <div>{rel.text}</div>
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

export function Name({ name, updateName }) {
  return (
    <div style={{ padding: "5px" }}>
      <input
        type="text"
        value={name}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
}

export function Generalisation({ generalisation, getElement, updateElement }) {
  const updateGeneralisationName = (name) => {
    let newGeneralisation = { ...generalisation };
    newGeneralisation.text = name;
    updateElement(types.GENERALISATION, newGeneralisation);
  };
  const generalisationName = (
    <input
      type="text"
      style={{fontSize: "medium"}}
      value={generalisation.text}
      onChange={(e) => {
        updateGeneralisationName(e.target.value);
      }}
    />
  );
  return (
    <>
      <>{generalisationName}</>
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
  context,
  setContext,
}) {
  // For use with adding subsets under generalisations
  const [selectedGeneralisation, setGeneralisation] = useState(null);
  // For use with adding a child node under this node
  const [addingChild, setAddingChild] = useState(null);

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

  const updateNodeText = (node, text) => {
    let newNode = { ...node };
    newNode.text = text;
    updateElement(node.type, newNode);
  };

  const updateName = (name) => {
    let newEntity = { ...entity };
    newEntity.text = name;
    updateElement(types.ENTITY, newEntity);
  };

  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Entity</div>
      {/* Name Section */}
      <div className="section">
        <div className="section-header">Name:</div>
        <Name name={entity.text} updateName={updateName} />
      </div>
      {/* Attributes Section */}
      <div className="section">
        <div className="section-header">Attributes</div>
        <DisplayAttributes
          attributes={Object.values(entity.attributes)}
          updateNodeText={updateNodeText}
        />
        <hr
          style={{
            height: "0.5px",
            margin: "0",
            padding: "0",
            backgroundColor: "black",
          }}
        />
        {addingChild?.type === types.ATTRIBUTE ? (
          <form>
            <label>
              Adding Attribute:
              <input
                type="text"
                placeholder="Enter Name"
                value={addingChild.name}
                onChange={(e) =>
                  setAddingChild((prev) => {
                    let child = { ...prev };
                    child.name = e.target.value;
                    return child;
                  })
                }
              />
            </label>
            <input
              type="button"
              value="Submit"
              onClick={() => {
                if (!addingChild.name) {
                  alert("Name must not be empty.");
                  return;
                }
                addAttributeToNode(
                  updateElement,
                  addElement,
                  getElement,
                  addingChild.name,
                  entity.id
                );
                setAddingChild(null);
              }}
            />
            <input
              type="button"
              value="Cancel"
              onClick={() => {
                setAddingChild(null);
              }}
            />
          </form>
        ) : (
          <div
            className="section-tool"
            onClick={() => setAddingChild({ type: types.ATTRIBUTE, name: "" })}
          >
            + Add Attribute
          </div>
        )}
      </div>

      {/* Relationships Section */}
      <div className="section">
        <div className="section-header">Relationships</div>
        <Relationships
          relationships={relationships}
          getElement={getElement}
          updateElement={updateElement}
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
        {addingChild?.type === types.GENERALISATION ? (
          <form>
            <label>
              Adding Generalisation:
              <input
                type="text"
                placeholder="Enter Name"
                value={addingChild.name}
                onChange={(e) =>
                  setAddingChild((prev) => {
                    let child = { ...prev };
                    child.name = e.target.value;
                    return child;
                  })
                }
              />
            </label>
            <input
              type="button"
              value="Submit"
              onClick={() => {
                if (!addingChild.name) {
                  alert("Name must not be empty.");
                  return;
                }
                const generalisation = {
                  id: generateID(entity.id, addingChild.name), // TODO: change id generation
                  type: types.GENERALISATION,
                  parent: { id: entity.id },
                  text: addingChild.name,
                  pos: { x: entity.pos.x, y: entity.pos.y + 200 }, // TODO: discuss how to set generalisation node position
                  edges: {},
                };
                addElement(types.GENERALISATION, generalisation);
                setAddingChild(null);
              }}
            />
            <input
              type="button"
              value="Cancel"
              onClick={() => {
                setAddingChild(null);
              }}
            />
          </form>
        ) : (
          <div
            className="section-tool"
            onClick={() =>
              setAddingChild({ type: types.GENERALISATION, name: "" })
            }
          >
            + Add Generalisation
          </div>
        )}
        {Object.values(entity.generalisations).map((generalisation) => {
          return (
            <>
              <Generalisation
                generalisation={generalisation}
                getElement={getElement}
                updateElement={updateElement}
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
