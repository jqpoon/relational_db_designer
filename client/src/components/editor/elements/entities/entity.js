/*
	TABLE OF CONTENTS

	1. Imports
	2. CRUD for entities
	3. Entity component
*/

// **********
// 1. Imports
// **********

import { getId } from "../../utilities/idGenerator";
import { types } from "../../types";
import { addAttributeToNode } from "../attributes/attribute";
import { Node } from "../general";
import { Generalisation } from "../generalisations/generalisation";

// ********************
// 2. CRUD for entities
// ********************

export const createEntity = ({ x, y }) => ({
	id: getId(types.ENTITY),
	pos: {
		x: x,
		y: y,
	},
	text: "Entity",
	type: types.ENTITY,
	isWeak: [],
	edges: {},
	attributes: {},
	generalisations: {},
});

export const getEntity = ({ entities }, id) => {
	return entities[id] ? { ...entities[id] } : null;
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

	return data;
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
				console.assert(edge.source_type === types.ENTITY && edge.start === entity.id);
				console.assert(edge.target_type === types.RELATIONSHIP);
				delete entities[edge.start].edges[edge.id];
				delete relationships[edge.end].edges[edge.id];
			} else if (edge.type === types.EDGE.HIERARCHY) {
				// Hierarchical edges can only exist from entity to entity
				delete entities[edge.child].edges[edge.id];
				if (edge.generalisation) {
					delete entities[edge.parent].generalisations[edge.generalisation].edges[
						edge.id
					];
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
	return data;
};

// *******************
// 3. Entity component
// *******************

export function Entity({ entity, ctx, functions }) {
	const ctxMenuActions = {
		"Add Attribute": () =>
			addAttributeToNode({
				addElement: functions.addElement,
				getElement: functions.getElement,
				parentId: entity.id,
				parentType: entity.type,
			}),
	};
	return (
		<>
			<Node
				node={entity}
				className={entity.isWeak.length === 0 ? "entity" : "weak-entity"}
				ctx={ctx}
				ctxMenuActions={ctxMenuActions}
				functions={functions}
			/>
			{Object.values(entity.generalisations).map((generalisation) => {
				return (
					<Generalisation
						generalisation={generalisation}
						ctx={ctx}
						ctxMenuActions={ctxMenuActions}
						functions={functions}
					/>
				);
			})}
		</>
	);
}
