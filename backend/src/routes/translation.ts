/*
	TABLE OF CONTENTS

	1. Imports
	2. Utilities
	3. Translation router
*/

// 1. Imports
import { Router } from "express";
import Entity from "../models/entity";
import Relationship, { LHConstraint } from "../models/relationship";
import FullTranslator from "../translators/fullTranslator";
import TranslatedTable from "../translators/models/translatedTable";
import Attribute from "src/models/attribute";

// 2. Utilities
export const parseEntities = (entities: Entity[]): Map<string, Entity> => {
	var entityMap = new Map<string, Entity>();
	for (var entity of entities) {
		entityMap.set(entity.id, entity);
	}
	return entityMap;
};

export const parseRelationships = (relationships: Relationship[]): Map<string, Relationship> => {
	var rsMap = new Map<string, Relationship>();
	for (var rs of relationships) {
		rsMap.set(rs.id, rs);
	}
	return rsMap;
};

// 3. Translation router
const router = Router();

router.post("/translate", async function (req, res, next) {
	// Parse req body for entities and relationships
	var modelAsJson = req.body.data;
	var entities: Map<string, Entity> = new Map<string, Entity>();
	for (let en in modelAsJson.entities) {
		var e = modelAsJson.entities[en];
		var attributes: Attribute[] = [];
		for (let a in e.attributes) {
			var att = e.attributes[a];
			attributes.push({
				id: att.id,
				text: att.text,
				relativePos: att.relativePos,
				isMultiValued: att.isMultiValued,
				isPrimaryKey: att.isPrimaryKey,
				isOptional: att.isOptional,
			});
		}
		var subsets: string[] = [];
		for (let edge in e.edges) {
			var s = e.edges[edge];
			if (s.type == "hierarchy_edge") {
				var ed = modelAsJson.edges[edge];
				var subset = modelAsJson.entities[ed.parent];
				if (subset.id != e.id) {
					subsets.push(subset.id);
				}
			}
		}
		entities.set(e.id, {
			id: e.id,
			text: e.text,
			pos: e.pos,
			isWeak: e.isWeak[0],
			attributes: attributes,
			subsets: subsets,
		});
	}

	var relationships: Map<string, Relationship> = new Map<string, Relationship>();
	for (let rs in modelAsJson.relationships) {
		var r = modelAsJson.relationships[rs];
		let map = new Map<string, LHConstraint>();
		for (let e in r.edges) {
			var edge = modelAsJson.edges[e];
			if (edge.start != r.id) {
				map.set(edge.start, LHConstraint[edge.cardinality as keyof typeof LHConstraint]);
			} else {
				map.set(edge.end, LHConstraint[edge.cardinality as keyof typeof LHConstraint]);
			}
		}

		var attributes: Attribute[] = [];
		for (let a in r.attributes) {
			var att = r.attributes[a];
			attributes.push({
				id: att.id,
				text: att.text,
				relativePos: att.relativePos,
				isMultiValued: att.isMultiValued,
				isPrimaryKey: att.isPrimaryKey,
				isOptional: att.isOptional,
			});
		}
		relationships.set(r.id, {
			id: r.id,
			text: r.text,
			pos: r.pos,
			attributes: attributes,
			lHConstraints: map,
		});
	}

	// Translate
	const translator: FullTranslator = new FullTranslator(entities, relationships);
	const translatedTable: TranslatedTable = translator.translateFromDiagramToSchema();

	return res.status(200).json({
		SUCCESS: true,
		translatedtables: {
			tables: Object.fromEntries(translatedTable.tables),
		},
	});
});

export default router;
