/*
	TABLE OF CONTENTS

	1. Imports
	2. Stack limit initialisation
	3. Add to undo stack
	4. Redo
	5. Undo
*/

// **********
// 1. Imports
// **********

import { deletes, updates } from "../elements/elementFunctions";
import { types } from "../types";

// *****************************
// 2. Stack limit initialisation
// *****************************

const STACK_LIMIT = 25;

// ********************
// 3. Add to undo stack
// ********************

export const addToUndo = (editType, arg, data, { history, setHistory }) => {
	setHistory((prev) => {
		let newEntry = { action: editType, arg: arg, data: data };
		let storeStart = prev.store.length > STACK_LIMIT ? 1 : 0;
		let storeEnd = Math.min(prev.position + 1, prev.store.length);

		let newHistory = {};
		newHistory.store = prev.store.slice(storeStart, storeEnd);
		newHistory.position = newHistory.store.length;
		newHistory.store.push(newEntry);

		return newHistory;
	});
};

// *******
// 4. Redo
// *******

const redoActions = {
	deleteElement: deletes,
	addElement: updates,
	updateElement: updates,
};

export const redo = ({ history, setHistory }, elementsAndSetter) => {
	if (history.position >= history.store.length - 1) return;

	const entry = history.store[history.position + 1];
	redoActions[entry.action][entry.arg.type](elementsAndSetter, entry.arg);
	setHistory((prev) => {
		let newHistory = { ...prev };
		newHistory.position++;
		return newHistory;
	});
};

// *******
// 5. Undo
// *******

const undoUpdate = (data, elementsAndSetter) => {
	let element = data.node ? data.node : data.edges[0];
	updates[element.type](elementsAndSetter, element);
};

const undoAdd = (data, elementsAndSetter) => {
	let element = data.node ? data.node : data.edges[0];
	deletes[element.type](elementsAndSetter, element);
};

const undoDelete = (data, elementsAndSetter) => {
	const { _, setElements } = elementsAndSetter;

	setElements((prev) => {
		let newElements = { ...prev };
		const { entities, relationships, edges } = newElements;
		if (data.node) {
			switch (data.node.type) {
				case types.ENTITY:
					entities[data.node.id] = data.node;
					break;
				case types.RELATIONSHIP:
					relationships[data.node.id] = data.node;
					break;
				case types.ATTRIBUTE:
					const state = data.node.parent.type === types.ENTITY ? entities : relationships;
					state[data.node.parent.id].attributes[data.node.id] = data.node;
					break;
				case types.GENERALISATION:
					entities[data.node.parent.id].generalisations[data.node.id] = data.node;
					break;
				default:
			}
		}
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
					entities[edge.parent].generalisations[edge.generalisation].edges[edge.id] = {
						type: edge.type,
					};
				} else {
					entities[edge.parent].edges[edge.id] = { type: edge.type };
				}
			}
		});
		return newElements;
	});
};

const undoActions = {
	deleteElement: undoDelete,
	updateElement: undoUpdate,
	addElement: undoAdd,
};

export const undo = ({ history, setHistory }, elementsAndSetter) => {
	if (history.position < 0) return;

	const entry = history.store[history.position];
	undoActions[entry.action](entry.data, elementsAndSetter);
	setHistory((prev) => {
		let newHistory = { ...prev };
		newHistory.position--;
		return newHistory;
	});
};
