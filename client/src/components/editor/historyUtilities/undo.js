import { deletes, updates } from "../elementUtilities/elementFunctions";
import { types } from "../types";

const STACK_LIMIT = 25;

export const addToUndo = (editType, data, { history, setHistory }) => {
  setHistory((prev) => {
    let newEntry = { action: editType, data: data };
    let storeStart = prev.store.length > STACK_LIMIT ? 1 : 0;
    let storeEnd = Math.min(prev.position + 1, prev.store.length);

    let newHistory = {};
    newHistory.store = prev.store.slice(storeStart, storeEnd);
    newHistory.position = newHistory.store.length;
    newHistory.store.push(newEntry);

    return newHistory;
  });
};

export const undo = ({ history, setHistory }, elementsAndSetter) => {
  if (history.position < 0) return;

  let entry = null;
  setHistory((prev) => {
    let newHistory = {...prev};
    entry = newHistory.store[newHistory.position--];
    return newHistory;
  });

  console.log(`Undo:`);
  console.log(entry);
  undoInverses[entry.action](entry.data, elementsAndSetter);
};

const undoUpdate = (data, elementsAndSetter) => {
  let element = data.node ? data.node : data.edges[0];
  updates[element.type](elementsAndSetter, element);
};

const undoAdd = (data, elementsAndSetter) => {
  let element = data.node ? data.node : data.edges[0];
  deletes[element.type](elementsAndSetter, element);
};

const undoDelete = (data, elementsAndSetter) => {
  const { elements, setElements } = elementsAndSetter;
  if (data.node) {
    updates[data.node.type](elementsAndSetter, data.node);
  }
  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, relationships, edges } = newElements;
    data.edges.forEach((edge) => {
      edges[edge.id] = edge;
      if (edge.type === types.EDGE.RELATIONSHIP) {
        if (edge.source_type === types.ENTITY) {
          const parent = entities[edge.start];
          parent.edges[edge.id] = { type: edge.type };
          if (edge.isKey) {
            if (parent.isWeak.indexOf(edge.id) === -1) {
              parent.isWeak.push(edge.id);
            }
          }
        } else if (edge.source_type === types.RELATIONSHIP) {
          relationships[edge.start].edges[edge.id] = { type: edge.type };
        }
        relationships[edge.end].edges[edge.id] = { type: edge.type };
      } else if (edge.type === types.EDGE.HIERARCHY) {
        entities[edge.child].edges[edge.id] = { type: edge.type };
        if (edge.generalisation) {
          entities[edge.parent].generalisations[edge.generalisation].edges[
            edge.id
          ] = { type: edge.type };
        } else {
          entities[edge.parent].edges[edge.id] = { type: edge.type };
        }
      }
    });
    return newElements;
  });
};

const undoInverses = {
  deleteElement: undoDelete,
  updateElement: undoUpdate,
  addElement: undoAdd,
};
