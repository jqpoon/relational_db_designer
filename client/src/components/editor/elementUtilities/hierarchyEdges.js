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

export const updateHierarchyEdge = (
  edge,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  let oldEntry = edges[edge.id];
  let data = { node: null, edge: [oldEntry ? oldEntry : edge] };
  data = JSON.parse(JSON.stringify(data));

  if (!oldEntry) {
    // Newly added edge, update source and target
    setEntities((prev) => {
      let newEntities = { ...prev };
      newEntities[edge.child].edges[edge.id] = { type: types.EDGE.HIERARCHY };
      if (edge.generalisation) {
        newEntities[edge.parent].generalisations[edge.generalisation].edges[
          edge.id
        ] = { type: types.EDGE.HIERARCHY };
      } else {
        newEntities[edge.parent].edges[edge.id] = {
          type: types.EDGE.HIERARCHY,
        };
      }
      return newEntities;
    });
  }

  setEdges((prev) => {
    let edges = { ...prev };
    edges[edge.id] = edge;
    return edges;
  });

  console.log(`updateHierarchyEdge`);
  console.log(data);
  return data;
};
