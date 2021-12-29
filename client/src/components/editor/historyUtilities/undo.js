import { deletes, updates } from "../elementUtilities/delete";
import { types } from "../types";

const STACK_LIMIT = 25;

export const addToUndo = (editType, data, { setUndoStack }) => {
  setUndoStack((prev) => {
    let newEntry = { action: editType, data: data };
    let newStack = [...prev, newEntry];
    if (newStack.length > STACK_LIMIT) {
      newStack.shift();
    }
    return newStack;
  });
};

export const undo = ({ undoStack, setUndoStack }, elementAndSetters) => {
  console.log(`Undo:`);

  if (undoStack.length === 0) return;
  let entry = null;
  setUndoStack((prev) => {
    let newStack = [...prev];
    entry = newStack.pop();
    return newStack;
  });

  console.log(entry);
  undoInverses[entry.action](entry.data, elementAndSetters);
};

const undoUpdate = (data, elementAndSetters) => {
  let element = data.node ? data.node : data.edges[0];
  updates[element.type](element, elementAndSetters);
};

const undoAdd = (data, elementAndSetters) => {
  let element = data.node ? data.node : data.edges[0];
  deletes[element.type](element, elementAndSetters);
};

const undoDelete = (data, elementAndSetters) => {
  let {
    entities,
    setEntities,
    relationships,
    setRelationships,
    edges,
    setEdges,
  } = elementAndSetters;
  if (data.node) {
    updates[data.node.type](data.node, elementAndSetters);
  }
  setEdges((prev) => {
    let newEdges = { ...prev };
    data.edges.forEach((edge) => {
      newEdges[edge.id] = edge;
    });
    return newEdges;
  });
  setEntities((prev) => {
    let newEntities = { ...prev };
    data.edges.forEach((edge) => {
      if (
        edge.type === types.EDGE.RELATIONSHIP &&
        edge.source_type === types.ENTITY
      ) {
        // TODO refactor addEdge.js into addElement
        const parent = newEntities[edge.start];
        parent.edges[edge.id] = { type: edge.type };
        if (edge.isKey) {
          if (parent.isWeak.indexOf(edge.id) === -1) {
            parent.isWeak.push(edge.id);
          }
        }
      } else if (edge.type === types.EDGE.HIERARCHY) {
        newEntities[edge.child].edges[edge.id] = { type: edge.type };
        if (edge.generalisation) {
          newEntities[edge.parent].generalisations[edge.generalisation].edges[
            edge.id
          ] = { type: edge.type };
        } else {
          newEntities[edge.parent].edges[edge.id] = { type: edge.type };
        }
      }
    });
    return newEntities;
  });
  setRelationships((prev) => {
    let newRelationships = { ...prev };
    data.edges.forEach((edge) => {
      if (edge.type === types.EDGE.RELATIONSHIP) {
        if (edge.source_type === types.RELATIONSHIP) {
          newRelationships[edge.start].edges[edge.id] = { type: edge.type };
        }
        newRelationships[edge.end].edges[edge.id] = { type: edge.type };
      }
    });
    return newRelationships;
  });
};

const undoInverses = {
  deleteElement: undoDelete,
  updateElement: undoUpdate,
  addElement: undoAdd,
};
