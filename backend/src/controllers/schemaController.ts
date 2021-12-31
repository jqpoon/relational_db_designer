import Entity from "../models/entity";
import Attribute from "../models/attribute";
import DatabaseController from "./databaseController";
import Relationship, {LHConstraint} from "../models/relationship";
import Generalisation from "../models/generalisation";
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

    public async getNextID(peek=false) {
        const nextID = await DatabaseController.getInstance().getNextID(peek)
        return nextID.records[0].toObject()['e'].properties.id.low
    }

    public async deleteOldGraph(graphID: number) {
        await DatabaseController.getInstance().clearSubGraph(graphID);
    }

    public async addAllEntities(entities: Entity[], graphID: number) {
        for (var entity of entities) {
            await DatabaseController.getInstance().createEntity(entity, graphID);
            for (var attribute of entity.attributes ?? []) {
                await DatabaseController.getInstance().addAttribute(entity, attribute, graphID)
            }

            for (var subset of entity.subsets ?? []) {
                await DatabaseController.getInstance().createSubset(subset, graphID)
                await DatabaseController.getInstance().addSubsets(entity, subset, graphID)
            }
        }
    }

    public async addAllRelationships(relationships: Relationship[], graphID: number) {
        for (var relationship of relationships) {
            await DatabaseController.getInstance().addRelationship(relationship, graphID)
            for (var attribute of relationship.attributes ?? []) {
                await DatabaseController.getInstance().addRelationshipAttribute(relationship, attribute, graphID)
            }
        }
    }

    public async addAllGeneralisations(generalisations: Generalisation[], graphID: number) {
        for (var generalisation of generalisations) {
            await DatabaseController.getInstance().addGeneralisation(generalisation, graphID)
        }
    }

    public async getAllEntities(graphID: number): Promise<Map<string, Entity>> {

        var entityResult: QueryResult = await DatabaseController.getInstance().getAllEntities(graphID)

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
				

        const entityWithAttributesResult: QueryResult = await DatabaseController.getInstance().getAllEntitiesWithAttributes(graphID)

        for (var e of entityWithAttributesResult.records) {
            for (let key in e.toObject()) {
                var nodeID = e.toObject()[key]['nodeID']
                var attributes = e.toObject()[key]['attributes']

                const entityAttributesList: Array<Attribute> = attributes.map(
                    (e: { properties: any; }) => {
                        e.properties['relativePos'] = {
                            x: e.properties.posX,
                            y: e.properties.posX,
                        }
                        delete e.properties.posX
                        delete e.properties.posY
                        delete e.properties.name
                        return e.properties
                    }
                )

                if (entitiesHashMap.get(nodeID) !== undefined) {
                    entitiesHashMap.get(nodeID)!.attributes = entityAttributesList
                }
            }
        }

        const entityWithSubsetsResult: QueryResult = await DatabaseController.getInstance().getAllSubsets(graphID)

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

    public async getAllRelationships(graphID: number): Promise<Map<string, Relationship>> {

        var relationshipResult: QueryResult = await DatabaseController.getInstance().getAllRelationships(graphID)

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
				

        const relationshipAttributeResult: QueryResult = await DatabaseController.getInstance().getAllRelationshipsWithAttributes(graphID)

        for (var e of relationshipAttributeResult.records) {
            for (let key in e.toObject()) {
                var relationshipID = e.toObject()[key]['relationshipID']
                var attributes = e.toObject()[key]['attributes']

                const relationshipAttributeList: Array<Attribute> = attributes.map(
                    (e: { properties: any; }) => {
                        e.properties['relativePos'] = {
                            x: e.properties.posX,
                            y: e.properties.posX,
                        }
                        delete e.properties.posX
                        delete e.properties.posY
                        delete e.properties.name
                        return e.properties
                    }
                )

                if (relationshipHashmap.get(relationshipID) !== undefined) {
                    relationshipHashmap.get(relationshipID)!.attributes = relationshipAttributeList
                }
            }

        }
				
        return relationshipHashmap
    }

    public async getAllGeneralisations(graphID: number): Promise<Generalisation[]> {
        var generalisationResult: QueryResult = await DatabaseController.getInstance().getAllGeneralisations(graphID)

        const generalisations: Generalisation[] = []

        for (var e of generalisationResult.records) {
            for (let key in e.toObject()) {
                var generalisation = e.toObject()[key]['generalisation']
                var entities = e.toObject()[key]['entities']

                generalisation.properties['pos'] = {
                        x: generalisation.properties.posX,
                        y: generalisation.properties.posX,
                    }
                delete generalisation.properties.posX
                delete generalisation.properties.posY
                delete generalisation.properties.name

                generalisations.push({
                    ...generalisation.properties,
                    entities: entities
                })

            }
        }

        return generalisations
    }

}

export default SchemaController
