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
  // TODO
  // parent.attributes[attribute.id] = attribute;
  return null;
};
