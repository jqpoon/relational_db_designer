import neo4j, {Driver, QueryResult} from "neo4j-driver";
import Entity from "../models/entity";
import Attribute from "../models/attribute";
import Relationship from "../models/relationship";

class DatabaseController {

    private static instance: DatabaseController;
    private databaseDriver: Driver;

    private constructor() {
        // TODO use config or env to store variables
        this.databaseDriver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "123456"));
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

    public async createEntity(entity: Entity) {

        const session = this.databaseDriver.session()

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    'CREATE (e:ENTITY) SET e.name = $name, e.id = $id RETURN e.name',
                    entity,
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    private async createAttribute(attribute: Attribute) {
        const session = this.databaseDriver.session()

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    'CREATE (a:ATTRIBUTE) SET a.name = $name RETURN a.name',
                    attribute,
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addAttribute(entity: Entity, attribute: Attribute) {
        // assume entity node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createAttribute(attribute);
            const result = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:ENTITY), (b:ATTRIBUTE) WHERE a.name = $entityName AND b.name = $attributeName ' +
                    'CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        entityName: entity.name,
                        attributeName: attribute.name
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    private async createRelationship(relationship: Relationship) {
        const session = this.databaseDriver.session()

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    'CREATE (a:RELATIONSHIP) SET a.name = $name RETURN a.name',
                    relationship,
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addRelationship(entityOne: Entity, entityTwo: Entity, relationship: Relationship) {
        // assume entity node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createRelationship(relationship);
            const firstRelation = await session.writeTransaction(tx =>
                tx.run(
                    // TODO add relationship one to many to name once know where to retrieve the info
                    'MATCH (a:ENTITY), (b:RELATIONSHIP) WHERE a.name = $entityName AND b.name = $relationshipName ' +
                    'CREATE (a)-[r:Relationship]->(b) RETURN type(r)',
                    {
                        entityName: entityOne.name,
                        relationshipName: relationship.name,
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(firstRelation)

            const secondRelation = await session.writeTransaction(tx =>
                tx.run(
                    // TODO add relationship one to many to name once know where to retrieve the info
                    'MATCH (a:ENTITY), (b:RELATIONSHIP) WHERE a.name = $entityName AND b.name = $relationshipName ' +
                    'CREATE (a)-[r:Relationship]->(b) RETURN type(r)',
                    {
                        entityName: entityTwo.name,
                        relationshipName: relationship.name,
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(secondRelation)
        } finally {
            await session.close()
        }

    }

    public async getAllEntities(): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entities = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (entity:ENTITY) RETURN entity',
                )
            )
            DatabaseController.verifyDatabaseUpdate(entities)
            return entities
        } finally {
            await session.close()
        }

    }

    public async getAllEntitiesWithAttributes(): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entitiesWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:ENTITY)-[r]->(a:ATTRIBUTE) WITH n, a as attributes RETURN { nodeID: n.id, attributes: collect(attributes) }',
                )
            )
            DatabaseController.verifyDatabaseUpdate(entitiesWithAttributes)

            return entitiesWithAttributes
        } finally {
            await session.close()
        }

    }

    // MATCH (r:RELATIONSHIP)<-[re]-(n:ENTITY) with r, [{type: re, name: n.name}] as relations RETURN { relationName: r.name, entities: collect(relations) }

}


export default DatabaseController
