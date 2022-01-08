import { types } from "../../types";
import { Node } from "../general";

export const getGeneralisation = ({ entities }, id, parent) => {
  const gen = entities[parent.id]?.generalisations[id];
  return gen ? { ...gen } : null;
};

export const deleteGeneralisation = (
  { elements, setElements },
  generalisation
) => {
  let data = { node: generalisation, edges: [] };
  // Find all edges connected to the generalisation
  for (const edgeId of Object.keys(generalisation.edges)) {
    data.edges.push(elements.edges[edgeId]);
  }
  // Deep copy of elements to delete
  data = JSON.parse(JSON.stringify(data));
  // Actually delete elements from state
  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, edges } = newElements;
    // Delete edge references from nodes and edges themselves
    data.edges.forEach((edge) => {
      console.assert(edge.type === types.EDGE.HIERARCHY);
      delete entities[edge.child].edges[edge.id];
      delete edges[edge.id];
    });
    // Delete this generalisation
    delete entities[generalisation.parent.id].generalisations[
      generalisation.id
    ];
    return newElements;
  });
  // Return deep copy to be saved in history for un/redo
  console.log(`deleteGeneralisation:`);
  console.log(data);
  return data;
};

export const updateGeneralisation = (
  { elements, setElements },
  generalisation
) => {
  let oldEntry =
    elements.entities[generalisation.parent.id].generalisations[
      generalisation.id
    ];
  let data = {
    node: oldEntry ? oldEntry : generalisation,
    edges: [],
  };
  data = JSON.parse(JSON.stringify(data));
  setElements((prev) => {
    let newElements = { ...prev };
    let parent = newElements.entities[generalisation.parent.id];
    parent.generalisations[generalisation.id] = generalisation;
    return newElements;
  });
  console.log(`updateGeneralisation:`);
  console.log(data);
  return data;
};

export function Generalisation({ generalisation, ctx, functions }) {
  return (
    <Node
      className="generalisation"
      node={generalisation}
      ctx={ctx}
      functions={functions}
    />
  );
}
