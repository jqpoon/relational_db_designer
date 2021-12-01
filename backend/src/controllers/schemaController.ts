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

    public async getAllEntities(): Promise<Map<string, Entity>> {

        var entityResult: QueryResult = await DatabaseController.getInstance().getAllEntities()

        // Use hashmap to update entity O(1)
        const entitiesHashMap: Map<string, Entity> = new Map()

        for (var elem of entityResult.records) {
            const entity = elem.toObject()['entity']
            if (!entitiesHashMap.has(entity.properties.id)) {
                entity.properties['pos'] = {
                    x: entity.properties.posX,
                    y: entity.properties.posY,
                }
								entity.properties['attributes'] = []
								entity.properties['subsets'] = []
                delete entity.properties.posX
                delete entity.properties.posY
                delete entity.properties.name
                entitiesHashMap.set(entity.properties.id, entity.properties)
            }
        }
				

        const entityWithAttributesResult: QueryResult = await DatabaseController.getInstance().getAllEntitiesWithAttributes()

        for (var e of entityWithAttributesResult.records) {
            for (let key in e.toObject()) {
                var nodeID = e.toObject()[key]['nodeID']
								if (entitiesHashMap.has(nodeID)) {
									var attributes = e.toObject()[key]['attributes']
									attributes.forEach((e: { properties: any; }) => {
										e.properties['relativePos'] = {
												x: e.properties.posX,
												y: e.properties.posY,
										}
										delete e.properties.posX
										delete e.properties.posY
										delete e.properties.name

										entitiesHashMap.get(nodeID)!.attributes!.push(e.properties)
									});
								}
            }
        }

        const entityWithSubsetsResult: QueryResult = await DatabaseController.getInstance().getAllSubsets()

        for (var e of entityWithSubsetsResult.records) {
            for (let key in e.toObject()) {
								var nodeID = e.toObject()[key]['nodeID']
								if (entitiesHashMap.has(nodeID)) {
									var subsets = e.toObject()[key]['subsets']
									subsets.forEach((e: { properties: any; }) => {
										e.properties['pos'] = {
												x: e.properties.posX,
												y: e.properties.posY,
										}
										delete e.properties.posX
										delete e.properties.posY
										delete e.properties.name

										entitiesHashMap.get(nodeID)!.subsets!.push(e.properties)
									});
								}
            }
        }
				
        return entitiesHashMap
    }

    public async getAllRelationships(): Promise<Map<string, Relationship>> {

        var relationshipResult: QueryResult = await DatabaseController.getInstance().getAllRelationships()

        // Use hashmap to update relationship O(1)
        const relationshipHashmap: Map<string, Relationship> = new Map()
				
        for (var e of relationshipResult.records) {
            for (let key in e.toObject()) {
                var relationship = e.toObject()[key]['relationship']
                var entities = e.toObject()[key]['entities']

                const lhConstraint = new Map()

                entities.map((e: {
                    entityID: string,
                    lhConstraint: {
                        type: string
                    }	
                }) => {
                    lhConstraint.set(e.entityID, e.lhConstraint.type)
                })

                if (!relationshipHashmap.has(relationship.properties.id)) {
                    relationship.properties['pos'] = {
                        x: relationship.properties.posX,
                        y: relationship.properties.posY,
                    }
										relationship.properties['attributes'] = []
                    delete relationship.properties.posX
                    delete relationship.properties.posY
                    delete relationship.properties.name

                    relationshipHashmap.set(relationship.properties.id, {
                        lHConstraints: lhConstraint,
                        ...relationship.properties
                    })
                }
            }
        }
				

        const relationshipAttributeResult: QueryResult = await DatabaseController.getInstance().getAllRelationshipsWithAttributes()

        for (var e of relationshipAttributeResult.records) {
            for (let key in e.toObject()) {
                var relationshipID = e.toObject()[key]['relationshipID']
								if (relationshipHashmap.has(relationshipID)) {
									var attributes = e.toObject()[key]['attributes']
									attributes.array.forEach(
										(e: { properties: any; }) => {
											e.properties['pos'] = {
													x: e.properties.posX,
													y: e.properties.posY,
											}
											delete e.properties.posX
											delete e.properties.posY
											delete e.properties.name
											
											relationshipHashmap.get(relationshipID)!.attributes!.push(e.properties)
										}
									)
								}
            }

        }
				
        return relationshipHashmap
    }

}

export default SchemaController
