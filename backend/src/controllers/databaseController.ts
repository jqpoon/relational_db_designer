import neo4j, {Driver, QueryResult} from "neo4j-driver";
import Entity from "../models/entity";
import Attribute from "../models/attribute";
import Relationship, {LHConstraint} from "../models/relationship";
import {driver} from "neo4j-driver-core";
import Generalisation from "src/models/generalisation";

class DatabaseController {

    private static instance: DatabaseController;
    private databaseDriver: Driver;

    private constructor() {
        // TODO use config or env to store variables
        this.databaseDriver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456"));
        // this.databaseDriver = neo4j.driver((process.env.NEO_URL ?? ""), neo4j.auth.basic((process.env.NEO_USERNAME ?? ""), (process.env.NEO_PASSWORD ?? "")));
    }

    public static getInstance(): DatabaseController {
        if (!DatabaseController.instance) {
            DatabaseController.instance = new DatabaseController();
        }
        return DatabaseController.instance;
    }

    private static verifyDatabaseUpdate(result: QueryResult): boolean {
        if (result.records[0] == undefined) {
            throw new Error('Database not updated')
        }
        return true
    }

    public async clearDB() {
        const session = this.databaseDriver.session()
        try {
            await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n) DETACH DELETE n'
                )
            )
        } finally {
            await session.close()
        }
    }

    public async clearSubGraph(graphID: number) {
        const session = this.databaseDriver.session()
        try {
            await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n) WHERE n.graphID = $graphID DETACH DELETE n',
                    {
                        graphID
                    }
                )
            )
        } finally {
            await session.close()
        }
    }

    public async closeDriver() {
        await this.databaseDriver.close();
    }

    public async getNextID(): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const nextID: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `MATCH (e:ID) RETURN e`,
                )
            )

            if (nextID.records[0] == undefined) {
                const nextID: QueryResult = await session.writeTransaction(tx =>
                    tx.run(
                        `CREATE (e:ID) SET e.id = 1 RETURN e`,
                    )
                )

                return nextID
            } else {
                const nextID: QueryResult = await session.writeTransaction(tx =>
                    tx.run(
                        `MATCH (e:ID) SET e.id = e.id + 1 RETURN e`,
                    )
                )
                return nextID
            }

        } finally {
            await session.close()
        }
    }

    public async createEntity({
                                  pos,
                                  ...entity
                              }: Entity, graphID: number) {
        const session = this.databaseDriver.session()

        var entityKeys = ['id', 'posX', 'posY', 'text', 'name', 'graphID']
        if (entity.isWeak !== undefined) {
            entityKeys.push('isWeak')
        }

        entityKeys = entityKeys.map((key) => {
            return `e.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (e:ENTITY) SET ${entityKeys.join(', ')} RETURN e.text`,
                    {
                        ...entity,
                        posX: pos.x,
                        posY: pos.y,
                        name: entity.text,
                        graphID,
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    private async createAttribute({
                                      relativePos,
                                      ...attribute
                                  }: Attribute, graphID: number) {
        const session = this.databaseDriver.session()

        var attributeKeys: String[] = ['id', 'posX', 'posY', 'text', 'isMultiValued',
            'isPrimaryKey', 'isOptional', 'name', 'graphID']

        attributeKeys = attributeKeys.map((key) => {
            return `a.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (a:ATTRIBUTE) SET ${attributeKeys.join(', ')} RETURN a.text`,
                    {
                        ...attribute,
                        posX: relativePos.x,
                        posY: relativePos.y,
                        name: attribute.text,
                        graphID,
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addRelationshipAttribute(relationship: Relationship, attribute: Attribute, graphID: number) {
        // assume relationship node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createAttribute(attribute, graphID);
            const result = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:RELATIONSHIP), (b:ATTRIBUTE) WHERE a.id = $relationshipIdentifier AND b.id = $attributeIdentifier ' +
                    'AND b.graphID = $graphID AND a.graphID = $graphID ' +
                    'CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        relationshipIdentifier: relationship.id,
                        attributeIdentifier: attribute.id,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addAttribute(entity: Entity, attribute: Attribute, graphID: number) {
        // assume entity node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createAttribute(attribute, graphID);
            const result = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:ENTITY), (b:ATTRIBUTE) WHERE a.id = $entityIdentifier AND b.id = $attributeIdentifier ' +
                    'AND b.graphID = $graphID AND a.graphID = $graphID CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        entityIdentifier: entity.id,
                        attributeIdentifier: attribute.id,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    private async createRelationship({
                                         pos,
                                         ...relationship
                                     }: Relationship, graphID: number) {
        const session = this.databaseDriver.session()

        var relationshipKeys: String[] = ['id', 'posX', 'posY', 'text', 'name', 'graphID']

        relationshipKeys = relationshipKeys.map((key) => {
            return `a.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (a:RELATIONSHIP) SET ${relationshipKeys} RETURN a.text`,
                    {
                        ...relationship,
                        posX: pos.x,
                        posY: pos.y,
                        name: relationship.text,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addRelationship(relationship: Relationship, graphID: number) {
        // assume entity node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createRelationship(relationship, graphID);
            for (var entityIdentifier of relationship.lHConstraints.keys()) {
                const firstRelation = await session.writeTransaction(tx =>
                    tx.run(
                        'MATCH (a:ENTITY), (b:RELATIONSHIP) WHERE a.id = $entityIdentifier AND b.id = $relationshipIdentifier ' +
                        'AND b.graphID = $graphID AND a.graphID = $graphID ' +
                        `CREATE (a)-[r:${relationship.lHConstraints.get(entityIdentifier)!}]->(b) RETURN type(r)`,
                        {
                            entityIdentifier: entityIdentifier,
                            relationshipIdentifier: relationship.id,
                            graphID
                        },
                    )
                )
                DatabaseController.verifyDatabaseUpdate(firstRelation)

            }
        } finally {
            await session.close()
        }
    }

    public async createSubset({
                                  pos,
                                  ...subset
                              }: Entity, graphID: number) {
        const session = this.databaseDriver.session()

        var entityKeys = ['id', 'posX', 'posY', 'text', 'name', 'graphID']
        if (subset.isWeak !== undefined) {
            entityKeys.push('isWeak')
        }

        entityKeys = entityKeys.map((key) => {
            return `e.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (e:SUBSET) SET ${entityKeys.join(', ')} RETURN e.text`,
                    {
                        ...subset,
                        posX: pos.x,
                        posY: pos.y,
                        name: subset.text,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addSubsets(entity: Entity, subset: Entity, graphID: number): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entities = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:ENTITY), (b:SUBSET) WHERE a.id = $entityIdentifier AND b.id = $subsetIdentifier ' +
                    'AND b.graphID = $graphID AND a.graphID = $graphID CREATE (a)-[r:SUBSET]->(b) RETURN type(r)',
                    {
                        entityIdentifier: entity.id,
                        subsetIdentifier: subset.id,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(entities)
            return entities
        } finally {
            await session.close()
        }
    }

    public async createGeneralisation({
                                        pos,
                                        ...generalisation
                                      }: Generalisation, graphID: number) {
        const session = this.databaseDriver.session()

        var generalisationKeys = ['id', 'posX', 'posY', 'text', 'name', 'parent', 'graphID']

        generalisationKeys = generalisationKeys.map((key) => {
            return `e.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (e:GENERALISATION) SET ${generalisationKeys.join(', ')} RETURN e.text`,
                    {
                        ...generalisation,
                        posX: pos.x,
                        posY: pos.y,
                        name: generalisation.text,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addGeneralisation(generalisation: Generalisation, graphID: number) {
        const session = this.databaseDriver.session()

        try {
            await this.createGeneralisation(generalisation, graphID)

            const parentEntity = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:ENTITY), (b:GENERALISATION) WHERE a.id = $entityIdentifier AND b.id = $generalisationIdentifier ' +
                    'AND b.graphID = $graphID AND a.graphID = $graphID CREATE (a)-[r:GENERALISATION]->(b) RETURN type(r)',
                    {
                        entityIdentifier: generalisation.parent,
                        generalisationIdentifier: generalisation.id,
                        graphID
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(parentEntity)

            for (var entityID of generalisation.entities) {
                const chilcEntity = await session.writeTransaction(tx =>
                    tx.run(
                        'MATCH (a:ENTITY), (b:GENERALISATION) WHERE a.id = $entityIdentifier AND b.id = $generalisationIdentifier ' +
                        'AND b.graphID = $graphID AND a.graphID = $graphID CREATE (b)-[r:GENERALISATION]->(a) RETURN type(r)',
                        {
                            entityIdentifier: entityID,
                            generalisationIdentifier: generalisation.id,
                            graphID
                        },
                    )
                )
                DatabaseController.verifyDatabaseUpdate(chilcEntity)
            }

        } finally {
            await session.close()
        }
    }

    public async getAllEntities(graphID: number): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entities = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (entity:ENTITY) WHERE entity.graphID = $graphID RETURN entity',
                    {
                        graphID
                    }
                )
            )
            return entities
        } finally {
            await session.close()
        }

    }

    public async getAllEntitiesWithAttributes(graphID: number): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entitiesWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:ENTITY)-[r]->(a:ATTRIBUTE) WHERE n.graphID = $graphID and a.graphID = $graphID' +
                    ' WITH n, a as attributes RETURN { nodeID: n.id, attributes: collect(attributes) }',
                    {
                        graphID
                    }
                )
            )
            return entitiesWithAttributes
        } finally {
            await session.close()
        }

    }

    public async getAllSubsets(graphID: number): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entitiesWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:ENTITY)-[r]->(s:SUBSET) WHERE n.graphID = $graphID and s.graphID = $graphID ' +
                    'WITH n, s as subsets RETURN { nodeID: n.id, subsets: collect(subsets) }',
                    {
                        graphID
                    }
                )
            )
            return entitiesWithAttributes
        } finally {
            await session.close()
        }
    }

    public async getAllRelationships(graphID: number): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entitiesWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (r:RELATIONSHIP)<-[re]-(n:ENTITY) WHERE n.graphID = $graphID and r.graphID = $graphID ' +
                    'with r, {lhConstraint: re, entityID: n.id} as relations RETURN { relationship: r, entities: ' +
                    'collect(relations) }',
                    {
                        graphID
                    }
                )
            )

            return entitiesWithAttributes
        } finally {
            await session.close()
        }

    }

    public async getAllRelationshipsWithAttributes(graphID: number): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const relationshipWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:RELATIONSHIP)-[r]->(a:ATTRIBUTE) WHERE n.graphID = $graphID and a.graphID = $graphID ' +
                    'WITH n, a as attributes RETURN { relationshipID: n.id, attributes: collect(attributes) }',
                    {
                        graphID
                    }
                )
            )

            return relationshipWithAttributes
        } finally {
            await session.close()
        }

    }

    public async getAllGeneralisations(graphID: number) {
        const session = this.databaseDriver.session()

        try {
            const generalisations = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:GENERALISATION)-[r]->(e:ENTITY) WHERE n.graphID = $graphID and e.graphID = $graphID ' +
                    'WITH n, e.id as entities RETURN { generalisation: n, entities: collect(entities) }',
                    {
                        graphID
                    }
                )
            )

            return generalisations
        } finally {
            await session.close()
        }
    }

}


export default DatabaseController
