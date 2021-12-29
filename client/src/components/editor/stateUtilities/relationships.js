import { types } from "../types";

// TODO: change isWeak if a key edge deleted
export const deleteRelationship = (
  relationship,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let data = { node: relationship, edges: [] };
  // Find all edges connected to the relationship
  for (const edgeId of Object.keys(relationship.edges)) {
    data.edges.push(edges[edgeId]);
  }
  // Deep copy of elements to delete
  data = JSON.parse(JSON.stringify(data));
  // Actually delete elements from state
  setEntities((prev) => {
    let newEntities = { ...prev };
    // Delete edge references from nodes
    data.edges.forEach((edge) => {
      console.assert(edge.type === types.EDGE.RELATIONSHIP);
      if (edge.source_type === types.ENTITY) {
        delete newEntities[edge.start].edges[edge.id];
      }
    });
    return newEntities;
  });
  setRelationships((prev) => {
    let newRelationships = { ...prev };
    // Delete edge references from nodes
    data.edges.forEach((edge) => {
      if (edge.source_type === types.RELATIONSHIP) {
        delete newRelationships[edge.start].edges[edge.id];
      }
      delete newRelationships[edge.end].edges[edge.id];
    });
    // Delete this relationship
    delete newRelationships[relationship.id];
    return newRelationships;
  });
  setEdges((prev) => {
    let newEdges = { ...prev };
    data.edges.forEach((edge) => {
      delete newEdges[edge.id];
    });
    return newEdges;
  });
  // Return deep copy to be saved in history for un/redo
  console.log(`deleteRelationship:`);
  console.log(data);
  return data;
};
