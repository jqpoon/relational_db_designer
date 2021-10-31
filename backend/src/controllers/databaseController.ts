import neo4j, {Driver, QueryResult} from "neo4j-driver";
import Entity from "../models/entity";
import Attribute from "../models/attribute";
import Relationship, { LHConstraint } from "../models/relationship";

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

        var entityKeys = ['identifier', 'positionX', 'positionY', 'shapeWidth', 'shapeHeight', 'name']
        if (entity.isWeak !== undefined) {
            entityKeys.push('isWeak')
        }

        entityKeys = entityKeys.map((key) => {
            return `e.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (e:ENTITY) SET ${entityKeys.join(', ')} RETURN e.name`,
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

        var attributeKeys: String[] = ['identifier', 'positionX', 'positionY', 'shapeWidth', 'shapeHeight', 'name',
            'isPrimaryKey', 'isOptional']

        attributeKeys = attributeKeys.map((key) => {
            return `a.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (a:ATTRIBUTE) SET ${attributeKeys.join(', ')} RETURN a.name`,
                    attribute,
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addRelationshipAttribute(relationship: Relationship, attribute: Attribute) {
        // assume relationship node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createAttribute(attribute);
            const result = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:RELATIONSHIP), (b:ATTRIBUTE) WHERE a.identifier = $relationshipIdentifier AND b.identifier = $attributeIdentifier ' +
                    'CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        relationshipIdentifier: relationship.identifier,
                        attributeIdentifier: attribute.identifier
                    },
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
                    'MATCH (a:ENTITY), (b:ATTRIBUTE) WHERE a.identifier = $entityIdentifier AND b.identifier = $attributeIdentifier ' +
                    'CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        entityIdentifier: entity.identifier,
                        attributeIdentifier: attribute.identifier
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

        var relationshipKeys: String[] = ['identifier', 'positionX', 'positionY', 'shapeWidth', 'shapeHeight', 'name']

        relationshipKeys = relationshipKeys.map((key) => {
            return `a.${key} = $${key}`
        })

        try {
            const result: QueryResult = await session.writeTransaction(tx =>
                tx.run(
                    `CREATE (a:RELATIONSHIP) SET ${relationshipKeys} RETURN a.name`,
                    relationship,
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addRelationship(relationship: Relationship) {
        // assume entity node exists already

        const session = this.databaseDriver.session()

        try {
            await this.createRelationship(relationship);
            for (var entityIdentifier of relationship.lHConstraints.keys()) {
                console.log(entityIdentifier)
                const firstRelation = await session.writeTransaction(tx =>
                    tx.run(
                        'MATCH (a:ENTITY), (b:RELATIONSHIP) WHERE a.identifier = $entityIdentifier AND b.identifier = $relationshipIdentifier ' +
                        `CREATE (a)-[r:${LHConstraint[relationship.lHConstraints.get(entityIdentifier)!]}]->(b) RETURN type(r)`,
                        {
                            entityIdentifier: entityIdentifier,
                            relationshipIdentifier: relationship.identifier,
                        },
                    )
                )
                DatabaseController.verifyDatabaseUpdate(firstRelation)

            }
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
                    'MATCH (n:ENTITY)-[r]->(a:ATTRIBUTE) WITH n, a as attributes RETURN { nodeID: n.identifier, ' +
                    'attributes: collect(attributes) }',
                )
            )
            DatabaseController.verifyDatabaseUpdate(entitiesWithAttributes)
            return entitiesWithAttributes
        } finally {
            await session.close()
        }

    }

    public async getAllRelationships(): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entitiesWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (r:RELATIONSHIP)<-[re]-(n:ENTITY) with r, {lhConstraint: re, entityID: n.identifier} ' +
                    'as relations RETURN { relationship: r, entities: collect(relations) }',
                )
            )
            DatabaseController.verifyDatabaseUpdate(entitiesWithAttributes)

            return entitiesWithAttributes
        } finally {
            await session.close()
        }

    }

    public async getAllRelationshipsWithAttributes(): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const relationshipWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:RELATIONSHIP)-[r]->(a:ATTRIBUTE) WITH n, a as attributes RETURN { relationshipID: n.identifier, ' +
                    'attributes: collect(attributes) }',
                )
            )
            DatabaseController.verifyDatabaseUpdate(relationshipWithAttributes)
            return relationshipWithAttributes
        } finally {
            await session.close()
        }

    }

}


export default DatabaseController
