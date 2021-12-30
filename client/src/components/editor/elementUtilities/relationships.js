import { types } from "../types";

export const getRelationship = ({ relationships }, id) => {
  return relationships[id] ? { ...relationships[id] } : null;
};

export const deleteRelationship = ({ elements, setElements }, relationship) => {
  console.log(elements);
  let data = { node: relationship, edges: [] };
  // Find all edges connected to the relationship
  for (const edgeId of Object.keys(relationship.edges)) {
    data.edges.push(elements.edges[edgeId]);
  }
  // Deep copy of elements to delete
  data = JSON.parse(JSON.stringify(data));

  // Actually delete elements from state
  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, relationships, edges } = newElements;
    data.edges.forEach((edge) => {
      console.assert(edge.type === types.EDGE.RELATIONSHIP);
      // Delete edge references from nodes
      if (edge.source_type === types.ENTITY) {
        const parent = entities[edge.start];
        parent.isWeak = parent.isWeak.filter((id) => id !== edge.id);
        delete parent.edges[edge.id];
      } else if (edge.source_type === types.RELATIONSHIP) {
        delete relationships[edge.start].edges[edge.id];
      }
      delete relationships[edge.end].edges[edge.id];
      // Delete edge
      delete edges[edge.id];
    });
    // Delete this relationship
    delete relationships[relationship.id];
    return newElements;
  });

  // Return deep copy to be saved in history for un/redo
  console.log(`deleteRelationship:`);
  console.log(data);
  console.log(elements);
  return data;
};

export const updateRelationship = ({ elements, setElements }, relationship) => {
  let oldEntry = elements.relationships[relationship.id];
  let data = { node: oldEntry ? oldEntry : relationship, edges: [] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    newElements.relationships[relationship.id] = relationship;
    return newElements;
  });

  console.log(`updateRelationship:`);
  console.log(data);
  console.log(elements);
  return data;
};
