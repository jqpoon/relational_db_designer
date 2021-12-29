import { types } from "../types";

export const deleteRelationshipEdge = (
  edge,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let data = { node: null, edges: [edge] };
  data = JSON.parse(JSON.stringify(data));
  if (edge.source_type === types.ENTITY) {
    setEntities((prev) => {
      let newEntities = { ...prev };
      let source = newEntities[edge.start];
      source.isWeak = source.isWeak.filter((id) => id !== edge.id);
      delete source.edges[edge.id];
      return newEntities;
    });
  }
  setRelationships((prev) => {
    let newRelationships = { ...prev };
    if (edge.source_type === types.RELATIONSHIP) {
      delete newRelationships[edge.start].edges[edge.id];
    }
    delete newRelationships[edge.end].edges[edge.id];
    return newRelationships;
  });
  setEdges((prev) => {
    let newEdges = { ...prev };
    data.edges.forEach((edge) => {
      delete newEdges[edge.id];
    });
    return newEdges;
  });
  console.log(`deleteRelationshipEdge:`);
  console.log(data);
  return data;
};
