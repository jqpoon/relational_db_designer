import {OK} from "http-status-codes";
import {Router} from "express";
import Entity from "../models/entity";
import Relationship, {LHConstraint} from "../models/relationship";
import FullTranslator from "../translators/fullTranslator";
import TranslatedTable from "../translators/models/translatedTable";

const router = Router();

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

router.post('/translate', async function (req, res, next) {
    // Parse req body for entities and relationships
    var modelAsJson = req.body;
    var entities: Entity[] = modelAsJson.entities;
    var relationships: Relationship[] = modelAsJson.relationships
			.map((r: any) => {
				let map = new Map<string, LHConstraint>()
				for (var entityId in r.lHConstraints) {
					map.set(entityId, r.lHConstraints[entityId])
				}
				r.lHConstraints = map
				return r;
			});

    // Translate
    const translator: FullTranslator = new FullTranslator(
        parseEntities(entities), parseRelationships(relationships));
    const translatedTable: TranslatedTable = translator.translateFromDiagramToSchema();

    // Return translation
    return res.status(OK).json({SUCCESS: true, translatedtables: {
        tables: Object.fromEntries(translatedTable.tables),
    }});
});

router.get('/test', async function (req, res, next) {
    // Parse req body for entities and relationships
    var person: Entity = {
        id: "1", text: "person", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "10", text: "bonus", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: true},
            {id: "11", text: "salary number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: true, isOptional: false},
            {id: "12", text: "name", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}]};

    var entities: Entity[] = [
        {id: "0", text: "manager", pos: {x: 0, y: 0}, isWeak: false, attributes: [
            {id: "00", text: "mobile number", relativePos: {x: 0, y: 0}, 
                isMultiValued: false, isPrimaryKey: false, isOptional: false}
        ], subsets: [person]},
        person];
    
    var relationships: Relationship[] = [];

    // Translate
    const translator: FullTranslator = new FullTranslator(
        parseEntities(entities), parseRelationships(relationships));
    const translatedTable: TranslatedTable = translator.translateFromDiagramToSchema();
    // Return translation
    return res.status(OK).json({SUCCESS: true, translatedtables: {
        tables: Object.fromEntries(translatedTable.tables),
    }});
});

export default router;
