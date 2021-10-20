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

    public testing(entityOne: Entity, entityTwo: Entity, attribute: Attribute, relationship: Relationship): void {
        // TODO return response back to API, checking entity validity
        DatabaseController.getInstance().createEntity(entityOne);
        DatabaseController.getInstance().createEntity(entityTwo);
        DatabaseController.getInstance().addAttribute(entityOne, attribute);
        DatabaseController.getInstance().addRelationship(entityOne, entityTwo, relationship)
        DatabaseController.getInstance().getAllEntities()
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
        return entitiesHashMap
    }

}

export default SchemaController
