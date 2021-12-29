import { types } from "../types";

export const deleteHierarchyEdge = (
  edge,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let data = { node: null, edges: [edge] };
  data = JSON.parse(JSON.stringify(data));
  setEntities((prev) => {
    let newEntities = { ...prev };
    delete newEntities[edge.child].edges[edge.id];
    if (edge.generalisation) {
      delete newEntities[edge.parent].generalisations[edge.generalisation]
        .edges[edge.id];
    } else {
      delete newEntities[edge.parent].edges[edge.id];
    }
    return newEntities;
  });
  setEdges((prev) => {
    let newEdges = { ...prev };
    data.edges.forEach((edge) => {
      delete newEdges[edge.id];
    });
    return newEdges;
  });
  console.log(`deleteHierarchyEdge:`);
  console.log(data);
  return data;
};
