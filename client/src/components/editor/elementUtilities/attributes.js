import { types } from "../types";

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
