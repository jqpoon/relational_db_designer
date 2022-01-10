/*
	TABLE OF CONTENTS

	1. Imports
	2. CRUD for relationship edge
	3. relationship edge component
*/

// **********
// 1. Imports
// **********

import Xarrow from "react-xarrows";
import { getId } from "../../utilities/idGenerator";
import { cardinality as cardinality_all, types } from "../../types";

// *****************************
// 2. CRUD for relationship edge
// *****************************

export const createRelationshipEdge = (source, target) => {
	const newEdge = {
		id: getId(types.EDGE.RELATIONSHIP, source.id, target.id),
		type: types.EDGE.RELATIONSHIP,
		source_type: source.type,
		target_type: target.type,
		start: source.id,
		end: target.id,
		isKey: false,
		cardinality: target.cardinality,
	};
	return newEdge;
};

export const getRelationshipEdge = ({ edges }, id) => {
	return edges[id] ? { ...edges[id] } : null;
};

export const deleteRelationshipEdge = ({ elements, setElements }, edge) => {
	let data = { node: null, edges: [edge] };
	data = JSON.parse(JSON.stringify(data));

	setElements((prev) => {
		let newElements = { ...prev };
		const { entities, relationships, edges } = newElements;
		// Delete references to edge in nodes
		if (edge.source_type === types.ENTITY) {
			let source = entities[edge.start];
			source.isWeak = source.isWeak.filter((id) => id !== edge.id);
			delete source.edges[edge.id];
		} else if (edge.source_type === types.RELATIONSHIP) {
			delete relationships[edge.start].edges[edge.id];
		}
		delete relationships[edge.end].edges[edge.id];
		// Delete edge
		delete edges[edge.id];
		return newElements;
	});

	return data;
};

export const updateRelationshipEdge = ({ elements, setElements }, edge) => {
	const oldEntry = elements.edges[edge.id];
	let data = { node: null, edges: [oldEntry ? oldEntry : edge] };
	data = JSON.parse(JSON.stringify(data));

	setElements((prev) => {
		let newElements = { ...prev };
		const { entities, relationships, edges } = newElements;
		edges[edge.id] = edge;
		if (!oldEntry) {
			// Newly added edge, update source and target
			if (edge.source_type === types.ENTITY) {
				entities[edge.start].edges[edge.id] = {
					type: types.EDGE.RELATIONSHIP,
				};
			} else if (edge.source_type === types.RELATIONSHIP) {
				relationships[edge.start].edges[edge.id] = {
					type: types.EDGE.RELATIONSHIP,
				};
			}
			console.assert(edge.target_type === types.RELATIONSHIP);
			relationships[edge.end].edges[edge.id] = {
				type: types.EDGE.RELATIONSHIP,
			};
		} else {
			if (edge.isKey !== oldEntry.isKey) {
				console.assert(edge.source_type === types.ENTITY);
				const parent = entities[edge.start];
				if (edge.isKey) {
					parent.isWeak.push(edge.id);
				} else {
					parent.isWeak = parent.isWeak.filter((id) => id !== edge.id);
				}
			}
		}
		return newElements;
	});

	return data;
};

// ******************************
// 3. relationship edge component
// ******************************

export function RelationshipEdge({ start, end, cardinality, isKey, scale }) {
	const style = {
		backgroundColor: "white",
		padding: "2.5px",
		fontSize: `${14 * scale}px`,
	};
	if (isKey) style["textDecoration"] = "underline";

	return (
		<Xarrow
			start={start.toString()}
			end={end.toString()}
			labels={<div style={style}>{cardinality_all[cardinality]}</div>}
			showHead={false}
			curveness={0}
			endAnchor="middle"
			startAnchor="middle"
			strokeWidth={4 * scale}
			zIndex={-1}
		/>
	);
}
