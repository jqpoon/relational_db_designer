import {OK} from "http-status-codes";
import {Router} from "express";
import Entity from "../models/entity";
import Relationship, {LHConstraint} from "../models/relationship";
import FullTranslator from "../translators/fullTranslator";
import TranslatedTable from "../translators/models/translatedTable";
import Attribute from "src/models/attribute";

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
    var modelAsJson = req.body.data;
    var entities: Map<string, Entity> = new Map<string, Entity>();
    for (let en in modelAsJson.entities) {
        var e = modelAsJson.entities[en];
        var attributes: Attribute[] = [];
        for (let a in e.attributes) {
            var att = e.attributes[a]
            attributes.push({
                id: att.id,
                text: att.text,
                relativePos: att.relativePos,
                isMultiValued: att.isMultiValued,
                isPrimaryKey: att.isPrimaryKey,
                isOptional: att.isOptional
            })
        }
        var subsets: string[] = [];
        for (let edge in e.edges) {
            var s = e.edges[edge]
            if (s.type == 'hierarchy_edge') {
                var ed = modelAsJson.edges[edge]
                var subset = modelAsJson.entities[ed.parent]
                if (subset.id != e.id) {
                    subsets.push(subset.id)
                }
            }
        }
        entities.set(e.id, {
            id: e.id,
            text: e.text,
            pos: e.pos,
            isWeak: e.isWeak[0],
            attributes: attributes,
            subsets: subsets
        })
    }
    
    var relationships: Map<string, Relationship> = new Map<string, Relationship>();
    for (let rs in modelAsJson.relationships) {
        var r = modelAsJson.relationships[rs];
        let map = new Map<string, LHConstraint>();
        for (let e in r.edges) {
            var edge = modelAsJson.edges[e]
            map.set(edge.start, LHConstraint[edge.cardinality as keyof typeof LHConstraint])
        }

        var attributes: Attribute[] = [];
        for (let a in r.attributes) {
            var att = r.attributes[a]
            attributes.push({
                id: att.id,
                text: att.text,
                relativePos: att.relativePos,
                isMultiValued: att.isMultiValued,
                isPrimaryKey: att.isPrimaryKey,
                isOptional: att.isOptional
            })
        }
        console.log(attributes)
        relationships.set(r.id, {
            id: r.id,
            text: r.text,
            pos: r.pos,
            attributes: attributes,
            lHConstraints: map
        })
    }
		
    // Translate
    const translator: FullTranslator = new FullTranslator(
        entities, relationships);
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
        ], subsets: ["person"]},
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
