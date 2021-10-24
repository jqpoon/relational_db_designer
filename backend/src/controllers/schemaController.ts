import Entity from "../models/entity";
import Attribute from "../models/attribute";
import DatabaseController from "./databaseController";
import Relationship from "../models/relationship";
import { QueryResult } from "neo4j-driver";

class SchemaController {

    private static instance: SchemaController;

    private constructor() {}

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
        }
    }

    public async getAllEntities(): Promise<Map<Number, Entity>> {

        var entityResult: QueryResult = await DatabaseController.getInstance().getAllEntities()

        // Use hashmap to update entity O(1)
        const entitiesHashMap: Map<Number, Entity> = new Map()

        for (var elem of entityResult.records) {
            // TODO see if can directly iterate through the key entity without implicitly saying entity
            const entity = elem.toObject()['entity']
            if (!entitiesHashMap.has(entity.properties.id)) {
                entitiesHashMap.set(entity.properties.id, entity.properties)
            }
        }

        const entityWithAttributesResult: QueryResult = await DatabaseController.getInstance().getAllEntitiesWithAttributes()

        for (var e of entityWithAttributesResult.records) {
            // TODO see if can directly iterate through the key entity without implicitly saying '{ nodeID: n.id, attributes: collect(attributes) }'
            var nodeID = e.toObject()['{ nodeID: n.id, attributes: collect(attributes) }'].nodeID
            var attributes = e.toObject()['{ nodeID: n.id, attributes: collect(attributes) }'].attributes

            const entityAttributesList: Array<Attribute> = attributes.map(
                (e: { properties: any; }) => e.properties
            )

            if (entitiesHashMap.get(nodeID) !== undefined) {
                entitiesHashMap.get(nodeID)!.attributes = entityAttributesList
            }
        }

        // TODO convert entitiesHashMap to list of values (Array<Entity>)
        console.log(entitiesHashMap)

        // const iterator1 = entitiesHashMap.values();

        return entitiesHashMap
    }

    public async getAllRelationships(): Promise<Relationship[]> {

        var relationshipResult: QueryResult = await DatabaseController.getInstance().getAllRelationships()

        const relationships: Array<Relationship> = [];

        for (var e of relationshipResult.records) {
            var relationName = e.toObject()['{ relationName: r.name, entities: collect(relations) }'].relationName
            var entities = e.toObject()['{ relationName: r.name, entities: collect(relations) }'].entities

            // relationships.push({
            //     name: relationName,
            //     // TODO add type of relationship as well, maybe store full entity object instead?
            //     entities: entities.map((e: { entityID: number }) => e.entityID)
            // })
        }

        console.log(relationships)
        return relationships
    }

}

export default SchemaController
