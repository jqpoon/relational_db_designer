import { types } from "../types";

export const deleteAttribute = (
  attribute,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let data = { node: attribute, edges: [] };
  data = JSON.parse(JSON.stringify(data));

  const pType = attribute.parent.type;
  console.assert(pType === types.ENTITY || pType === types.RELATIONSHIP);
  const setState = pType === types.ENTITY ? setEntities : setRelationships;
  setState((prev) => {
    let newState = { ...prev };
    delete newState[attribute.parent.id].attributes[attribute.id];
    return newState;
  });

  console.log(`deleteAttribute:`);
  console.log(data);
  return data;
};

export const updateAttribute = (
  attribute,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  const pType = attribute.parent.type;
  console.assert(pType === types.ENTITY || pType === types.RELATIONSHIP);
  const state = pType === types.ENTITY ? entities : relationships;
  const setState = pType === types.ENTITY ? setEntities : setRelationships;

  let oldEntry = state[attribute.parent.id].attributes[attribute.id];
  let data = { node: oldEntry ? oldEntry : attribute, edges: [] };
  data = JSON.parse(JSON.stringify(data));

  setState((prev) => {
    let newState = {...prev};
    const parent = newState[attribute.parent.id];
    parent.attributes[attribute.id] = attribute;
    return newState;
  })

  console.log(`updateAttribute:`);
  console.log(data);
  return data;
};
