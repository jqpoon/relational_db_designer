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

export const updateRelationshipEdge = (
  edge,
  { entities, setEntities, relationships, setRelationships, edges, setEdges }
) => {
  const oldEntry = edges[edge.id] ? edges[edge.id] : null;
  console.log("debug");
  console.log(oldEntry);
  console.log(edge);
  let data = { node: null, edges: [oldEntry] };
  data = JSON.parse(JSON.stringify(data));
  if (oldEntry === null) {
    // Newly added edge, update source and target
    if (edge.source_type === types.ENTITY) {
      setEntities((prev) => {
        let newEntities = { ...prev };
        newEntities[edge.start].edges[edge.id] = {
          type: types.EDGE.RELATIONSHIP,
        };
        return newEntities;
      });
    }
    setRelationships((prev) => {
      let newRelationships = { ...prev };
      if (edge.source_type === types.RELATIONSHIP) {
        newRelationships[edge.start].edges[edge.id] = {
          type: types.EDGE.RELATIONSHIP,
        };
      }
      console.assert(edge.target_type === types.RELATIONSHIP);
      newRelationships[edge.end].edges[edge.id] = {
        type: types.EDGE.RELATIONSHIP,
      };
      return newRelationships;
    });
  } else {
    if (edge.isKey !== oldEntry.isKey) {
      console.assert(edge.source_type === types.ENTITY);
      setEntities((prev) => {
        let newEntities = { ...prev };
        const parent = newEntities[edge.start]
        if (edge.isKey) {
          parent.isWeak.push(edge.id);
        } else {
          parent.isWeak = parent.isWeak.filter((id) => id !== edge.id);
        }
        return newEntities;
      });
    }
  }
  setEdges((prev) => {
    let newEdges = { ...prev };
    newEdges[edge.id] = edge;
    return newEdges;
  });
  console.log(`updateRelationshipEdge:`);
  console.log(data);
  return data;
};
