import Entity from "../models/entity";
import Attribute from "../models/attribute";
import DatabaseController from "./databaseController";
import Relationship, {LHConstraint} from "../models/relationship";
import {QueryResult} from "neo4j-driver";

class SchemaController {

    private static instance: SchemaController;

    private constructor() {
    }

    public static getInstance(): SchemaController {
        if (!SchemaController.instance) {
            SchemaController.instance = new SchemaController()
        }
        return SchemaController.instance
    }

    public async addAllEntities(entities: Entity[]) {
        for (var entity of entities) {
            await DatabaseController.getInstance().createEntity(entity);
            for (var attribute of entity.attributes ?? []) {
                await DatabaseController.getInstance().addAttribute(entity, attribute)
            }

            for (var subset of entity.subsets ?? []) {
                await DatabaseController.getInstance().createSubset(subset)
                await DatabaseController.getInstance().addSubsets(entity, subset)
            }
        }
    }

    public async addAllRelationships(relationships: Relationship[]) {
        for (var relationship of relationships) {
            await DatabaseController.getInstance().addRelationship(relationship)
            for (var attribute of relationship.attributes ?? []) {
                await DatabaseController.getInstance().addRelationshipAttribute(relationship, attribute)
            }
        }
    }

    public async getAllEntities(): Promise<Map<Number, Entity>> {

        var entityResult: QueryResult = await DatabaseController.getInstance().getAllEntities()

        // Use hashmap to update entity O(1)
        const entitiesHashMap: Map<Number, Entity> = new Map()

        for (var elem of entityResult.records) {
            const entity = elem.toObject()['entity']
            if (!entitiesHashMap.has(entity.properties.id)) {
                entitiesHashMap.set(entity.properties.id, entity.properties)
            }
        }

        const entityWithAttributesResult: QueryResult = await DatabaseController.getInstance().getAllEntitiesWithAttributes()

        for (var e of entityWithAttributesResult.records) {
            for (let key in e.toObject()) {
                var nodeID = e.toObject()[key]['nodeID']
                var attributes = e.toObject()[key]['attributes']

                const entityAttributesList: Array<Attribute> = attributes.map(
                    (e: { properties: any; }) => e.properties
                )

                if (entitiesHashMap.get(nodeID) !== undefined) {
                    entitiesHashMap.get(nodeID)!.attributes = entityAttributesList
                }
            }
        }

        const entityWithSubsetsResult: QueryResult = await DatabaseController.getInstance().getAllSubsets()

        for (var e of entityWithSubsetsResult.records) {
            for (let key in e.toObject()) {
                var nodeID = e.toObject()[key]['nodeID']
                var subsets = e.toObject()[key]['subsets']

                const subsetsList: Array<Entity> = subsets.map(
                    (e: { properties: any; }) => e.properties
                )

                if (entitiesHashMap.get(nodeID) !== undefined) {
                    entitiesHashMap.get(nodeID)!.subsets = subsetsList
                }
            }
        }

        return entitiesHashMap
    }

    public async getAllRelationships(): Promise<Map<Number, Relationship>> {

        var relationshipResult: QueryResult = await DatabaseController.getInstance().getAllRelationships()

        // Use hashmap to update relationship O(1)
        const relationshipHashmap: Map<Number, Relationship> = new Map()

        for (var e of relationshipResult.records) {
            var relationship = e.toObject()['{ relationship: r, entities: collect(relations) }'].relationship
            var entities = e.toObject()['{ relationship: r, entities: collect(relations) }'].entities

            const lhConstraint = new Map()

            entities.map((e: {
                entityID: number,
                lhConstraint: {
                    type: number
                }
            }) => {
                lhConstraint.set(e.entityID, LHConstraint[e.lhConstraint.type])
            })

            if (!relationshipHashmap.has(relationship.properties.id)) {
                relationshipHashmap.set(relationship.properties.id, {
                    lHConstraints: lhConstraint,
                    ...relationship.properties
                })
            }
        }

        const relationshipAttributeResult: QueryResult = await DatabaseController.getInstance().getAllRelationshipsWithAttributes()

        for (var e of relationshipAttributeResult.records) {
            for (let key in e.toObject()) {
                var relationshipID = e.toObject()[key]['relationshipID']
                var attributes = e.toObject()[key]['attributes']

                const relationshipAttributeList: Array<Attribute> = attributes.map(
                    (e: { properties: any; }) => e.properties
                )

                if (relationshipHashmap.get(relationshipID) !== undefined) {
                    relationshipHashmap.get(relationshipID)!.attributes = relationshipAttributeList
                }
            }

        }

        return relationshipHashmap
    }

}

export default SchemaController
