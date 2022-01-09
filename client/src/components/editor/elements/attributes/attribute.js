import { getId } from "../../utilities/idGenerator";
import { types } from "../../types";
import { Node } from "../general";

// Toggles key attribute feature
export const toggleKeyAttribute = (saveChanges) =>
  saveChanges((attr) => {
    attr.isPrimaryKey = !attr.isPrimaryKey;
    if (attr.isPrimaryKey) {
      // Key attributes are mandatory and unique
      attr.isOptional = false;
      attr.isMultiValued = false;
    }
  });

// Toggles optional attribute feature
export const toggleOptionalAttribute = (saveChanges) =>
  saveChanges((attr) => {
    attr.isOptional = !attr.isOptional;
    attr.isPrimaryKey = false;
  });

// Toggles multi-valued attribute feature
export const toggleMultiValuedAttribute = (saveChanges) =>
  saveChanges((attr) => {
    attr.isMultiValued = !attr.isMultiValued;
    attr.isPrimaryKey = false;
  });

export const addAttributeToNode = ({ addElement, parentId, parentType }) => {
  addElement(
    types.ATTRIBUTE,
    createAttribute({ id: parentId, type: parentType })
  );
};

export const createAttribute = (parent) => {
  return {
    parent: { id: parent.id, type: parent.type },
    id: getId(types.ATTRIBUTE, parent.id),
    text: "Attribute",
    relativePos: { x: -130, y: 15 }, // Preconfigured initial position
    isPrimaryKey: false,
    isMultiValued: false,
    isOptional: false,
    type: types.ATTRIBUTE,
  };
};
export const getAttribute = ({ entities, relationships }, id, parent) => {
  console.assert([types.ENTITY, types.RELATIONSHIP].includes(parent.type));
  const state = parent.type === types.ENTITY ? entities : relationships;
  const attr = state[parent.id]?.attributes[id];
  return attr ? { ...attr } : null;
};

export const deleteAttribute = ({ setElements }, attribute) => {
  let data = { node: attribute, edges: [] };
  data = JSON.parse(JSON.stringify(data));

  const pType = attribute.parent.type;
  console.assert(pType === types.ENTITY || pType === types.RELATIONSHIP);

  setElements((prev) => {
    let newState = { ...prev };
    const pNodes =
      pType === types.ENTITY ? newState.entities : newState.relationships;
    delete pNodes[attribute.parent.id].attributes[attribute.id];
    return newState;
  });

  console.log(`deleteAttribute:`);
  console.log(data);
  return data;
};

export const updateAttribute = ({ elements, setElements }, attribute) => {
  const pType = attribute.parent.type;
  console.assert(pType === types.ENTITY || pType === types.RELATIONSHIP);
  const state =
    pType === types.ENTITY ? elements.entities : elements.relationships;

  let oldEntry = state[attribute.parent.id].attributes[attribute.id];
  let data = { node: oldEntry ? oldEntry : attribute, edges: [] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    const pNodes =
      pType === types.ENTITY ? newElements.entities : newElements.relationships;
    pNodes[attribute.parent.id].attributes[attribute.id] = attribute;
    return newElements;
  });

  console.log(`updateAttribute:`);
  console.log(data);
  return data;
};

export function Attribute({ parent, attribute, ctx, functions }) {
  const saveChanges = (change) => functions.saveChanges(attribute, change);
  /** Position calculations */
  const pos = {
    x: parent.pos.x + attribute.relativePos.x,
    y: parent.pos.y + attribute.relativePos.y,
  };
  const updatePos = (data) => {
    return (attr) => {
      attr.relativePos = { x: data.x - parent.pos.x, y: data.y - parent.pos.y };
    };
  };
  /** Styling */
  const display = (attribute) => {
    if (attribute.isPrimaryKey) {
      return <u>{attribute.text}</u>;
    }
    if (attribute.isOptional && attribute.isMultiValued) {
      return <div>{attribute.text + "\u2217"}</div>;
    }
    if (attribute.isOptional) {
      return <div>{attribute.text + "?"}</div>;
    }
    if (attribute.isMultiValued) {
      return <div>{attribute.text + "+"}</div>;
    }
    return <div>{attribute.text}</div>;
  };

  let ctxMenuActions = {
    "Toggle Optional Attribute": () => toggleOptionalAttribute(saveChanges),
    "Toggle Multi-valued Attribute": () =>
      toggleMultiValuedAttribute(saveChanges),
  };
  if (parent.type === types.ENTITY) {
    ctxMenuActions["Toggle Key Attribute"] = () =>
      toggleKeyAttribute(saveChanges);
  }

  return (
    <Node
      className="attribute"
      node={{ ...attribute, pos: pos, updatePos: updatePos, display: display }}
      ctxMenuActions={ctxMenuActions}
      ctx={ctx}
      functions={functions}
    />
  );
}
