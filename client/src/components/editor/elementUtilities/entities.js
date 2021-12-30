import { types } from "../types";

export const getEntity = ({ entities }, id) => {
  return { ...entities[id] };
};

export const deleteEntity = ({ elements, setElements }, entity) => {
  let data = { node: entity, edges: [] };
  // Find all edges connected directly to the entity
  for (const edgeId of Object.keys(entity.edges)) {
    data.edges.push(elements.edges[edgeId]);
  }
  // Find all edges connected to the entity via a generalisation
  for (const generalisation of Object.values(entity.generalisations)) {
    for (const edgeId of Object.keys(generalisation.edges)) {
      data.edges.push(elements.edges[edgeId]);
    }
  }
  // Deep copy of elements to delete
  data = JSON.parse(JSON.stringify(data));

  // Actually delete elements from state
  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, relationships, edges } = newElements;
    // Delete edge references from nodes and edges themselves
    data.edges.forEach((edge) => {
      if (edge.type === types.EDGE.RELATIONSHIP) {
        console.assert(
          edge.source_type === types.ENTITY && edge.start === entity.id
        );
        console.assert(edge.target_type === types.RELATIONSHIP);
        delete entities[edge.start].edges[edge.id];
        delete relationships[edge.end].edges[edge.id];
      } else if (edge.type === types.EDGE.HIERARCHY) {
        // Hierarchical edges can only exist from entity to entity
        delete entities[edge.child].edges[edge.id];
        if (edge.generalisation) {
          delete entities[edge.parent].generalisations[edge.generalisation]
            .edges[edge.id];
        } else {
          delete entities[edge.parent].edges[edge.id];
        }
      }
      delete edges[edge.id];
    });
    // Delete this entity
    delete entities[entity.id];
    return newElements;
  });
  // Return deep copy to be saved in history
  console.log(`deleteEntity:`);
  console.log(data);
  return data;
};

export const updateEntity = ({ elements, setElements }, entity) => {
  let oldEntry = elements.entities[entity.id];
  let data = { node: oldEntry ? oldEntry : entity, edges: [] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    newElements.entities[entity.id] = entity;
    return newElements;
  });

  console.log(`updateEntity:`);
  console.log(data);
  return data;
};
