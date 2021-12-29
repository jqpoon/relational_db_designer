import { types } from "../types";

export const deleteEntity = (
  entity,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  console.log(entity);
  let data = { node: entity, edges: [] };
  // Find all edges connected directly to the entity
  for (const edgeId of Object.keys(entity.edges)) {
    data.edges.push(edges[edgeId]);
  }
  // Find all edges connected to the entity via a generalisation
  for (const generalisation of Object.values(entity.generalisations)) {
    for (const edgeId of Object.keys(generalisation.edges)) {
      data.edges.push(edges[edgeId]);
    }
  }
  // Deep copy of elements to delete
  data = JSON.parse(JSON.stringify(data));
  // Actually delete elements from state
  setRelationships((prev) => {
    let newRelationships = { ...prev };
    // Delete edge references from nodes
    data.edges.forEach((edge) => {
      if (edge.type === types.EDGE.RELATIONSHIP) {
        console.assert(
          edge.source_type === types.ENTITY && edge.start === entity.id
        );
        console.assert(edge.target_type === types.RELATIONSHIP);
        delete newRelationships[edge.end].edges[edge.id];
      }
    });
    return newRelationships;
  });
  setEntities((prev) => {
    let newEntities = { ...prev };
    // Delete edge references from nodes
    data.edges.forEach((edge) => {
      if (edge.type === types.EDGE.HIERARCHY) {
        // Hierarchical edges can only exist from entity to entity
        delete newEntities[edge.child].edges[edge.id];
        if (edge.generalisation) {
          delete newEntities[edge.parent].generalisations[edge.generalisation]
            .edges[edge.id];
        } else {
          delete newEntities[edge.parent].edges[edge.id];
        }
      }
    });
    // Delete this entity
    delete newEntities[entity.id];
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
  console.log(`deleteEntity:`);
  console.log(data);
  return data;
};
