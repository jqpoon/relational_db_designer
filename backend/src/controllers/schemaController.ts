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
            SchemaController.instance = new SchemaController();
        }
        return SchemaController.instance;
    }

    public async addAllEntities(entities: Entity[]) {
        for (var entity of entities) {
            DatabaseController.getInstance().createEntity(entity);
            for (var attribute of entity.attributes ?? []) {
                DatabaseController.getInstance().addAttribute(entity, attribute);
            }
        }
    }

    public async addAllRelationships(relationships: Relationship[]) {
        for (var relationship of relationships) {
            DatabaseController.getInstance().addRelationship(relationship);
            for (var attribute of relationship.attributes ?? []) {
                DatabaseController.getInstance().addRelationshipAttribute(relationship, attribute);
            }
        }
    }

    public async getAllEntities(): Promise<Map<Number, Entity>> {

        var entityResult: QueryResult = await DatabaseController.getInstance().getAllEntities()

        // Use hashmap to update entity O(1)
        const entitiesHashMap: Map<Number, Entity> = new Map()

        for (var elem of entityResult.records) {
            // TODO see if can directly iterate through the key entity without implicitly saying entity
            const entity = elem.toObject()['entity']
            if (!entitiesHashMap.has(entity.properties.identifier)) {
                entitiesHashMap.set(entity.properties.identifier, entity.properties)
            }
        }

        const entityWithAttributesResult: QueryResult = await DatabaseController.getInstance().getAllEntitiesWithAttributes()

        for (var e of entityWithAttributesResult.records) {
            // TODO see if can directly iterate through the key entity without implicitly saying '{ nodeID: n.id, attributes: collect(attributes) }'
            var nodeID = e.toObject()['{ nodeID: n.identifier, attributes: collect(attributes) }'].nodeID
            var attributes = e.toObject()['{ nodeID: n.identifier, attributes: collect(attributes) }'].attributes

            const entityAttributesList: Array<Attribute> = attributes.map(
                (e: { properties: any; }) => e.properties
            )

            if (entitiesHashMap.get(nodeID) !== undefined) {
                entitiesHashMap.get(nodeID)!.attributes = entityAttributesList
            }
        }

        // TODO figure out why hashmap not updated when sent as request
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

            if (!relationshipHashmap.has(relationship.properties.identifier)) {
                relationshipHashmap.set(relationship.properties.identifier, {
                    lHConstraints: lhConstraint,
                    ...relationship.properties
                })
            }
        }

        const relationshipAttributeResult: QueryResult = await DatabaseController.getInstance().getAllRelationshipsWithAttributes()

        for (var e of relationshipAttributeResult.records) {
            // TODO see if can directly iterate through the key entity without implicitly saying '{ nodeID: n.id, attributes: collect(attributes) }'
            var relationshipID = e.toObject()['{ relationshipID: n.identifier, attributes: collect(attributes) }'].relationshipID
            var attributes = e.toObject()['{ relationshipID: n.identifier, attributes: collect(attributes) }'].attributes

            const relationshipAttributeList: Array<Attribute> = attributes.map(
                (e: { properties: any; }) => e.properties
            )

            if (relationshipHashmap.get(relationshipID) !== undefined) {
                relationshipHashmap.get(relationshipID)!.attributes = relationshipAttributeList
            }
        }

        // TODO figure out why hashmap not updated when sent as request
        return relationshipHashmap
    }

}

export default SchemaController
