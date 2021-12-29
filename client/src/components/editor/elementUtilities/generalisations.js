import { types } from "../types";

export const deleteGeneralisation = (
  generalisation,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let data = { node: generalisation, edges: [] };
  // Find all edges connected to the generalisation
  for (const edgeId of Object.keys(generalisation.edges)) {
    data.edges.push(edges[edgeId]);
  }
  // Deep copy of elements to delete
  data = JSON.parse(JSON.stringify(data));
  // Actually delete elements from state
  setEntities((prev) => {
    let newEntities = { ...prev };
    // Delete edge references from nodes
    data.edges.forEach((edge) => {
      console.assert(edge.type === types.EDGE.HIERARCHY);
      delete newEntities[edge.child].edges[edge.id];
    });
    // Delete this generalisation
    delete newEntities[generalisation.parent.id].generalisations[
      generalisation.id
    ];
    return newEntities;
  });
  setEdges((prev) => {
    let newEdges = { ...prev };
    data.edges.forEach((edge) => {
      delete newEdges[edge.id];
    });
    return newEdges;
  });
  // Return deep copy to be saved in history for un/redo
  console.log(`deleteGeneralisation:`);
  console.log(data);
  return data;
};

export const updateGeneralisation = (
  generalisation,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let oldEntry =
    entities[generalisation.parent].generalisations[generalisation.id];
  let data = {
    node: oldEntry ? oldEntry : generalisation,
    edges: [],
  };
  data = JSON.parse(JSON.stringify(data));
  setEntities((prev) => {
    let newEntities = { ...prev };
    let parent = newEntities[generalisation.parent.id];
    parent.generalisations[generalisation.id] = generalisation;
    return newEntities;
  });
  return data;
};
