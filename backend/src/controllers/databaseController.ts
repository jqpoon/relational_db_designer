import neo4j, {Driver, QueryResult} from "neo4j-driver";
import Entity from "../models/entity";
import Attribute from "../models/attribute";
import Relationship, {LHConstraint} from "../models/relationship";
import {driver} from "neo4j-driver-core";

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

    public async closeDriver() {
        await this.databaseDriver.close();
    }

    public async createEntity({
                                  pos,
                                  ...entity
                              }: Entity) {
        const session = this.databaseDriver.session()

        var entityKeys = ['id', 'posX', 'posY', 'text', 'name']
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
                                  }: Attribute) {
        const session = this.databaseDriver.session()

        var attributeKeys: String[] = ['id', 'posX', 'posY', 'text', 'isMultiValued',
            'isPrimaryKey', 'isOptional', 'name']

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
                    },
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
                    'MATCH (a:RELATIONSHIP), (b:ATTRIBUTE) WHERE a.id = $relationshipIdentifier AND b.id = $attributeIdentifier ' +
                    'CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        relationshipIdentifier: relationship.id,
                        attributeIdentifier: attribute.id
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
                    'MATCH (a:ENTITY), (b:ATTRIBUTE) WHERE a.id = $entityIdentifier AND b.id = $attributeIdentifier ' +
                    'CREATE (a)-[r:Attribute]->(b) RETURN type(r)',
                    {
                        entityIdentifier: entity.id,
                        attributeIdentifier: attribute.id
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
                                     }: Relationship) {
        const session = this.databaseDriver.session()

        var relationshipKeys: String[] = ['id', 'posX', 'posY', 'text', 'name']

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
                    },
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
                const firstRelation = await session.writeTransaction(tx =>
                    tx.run(
                        'MATCH (a:ENTITY), (b:RELATIONSHIP) WHERE a.id = $entityIdentifier AND b.id = $relationshipIdentifier ' +
                        `CREATE (a)-[r:${relationship.lHConstraints.get(entityIdentifier)!}]->(b) RETURN type(r)`,
                        {
                            entityIdentifier: entityIdentifier,
                            relationshipIdentifier: relationship.id,
                        },
                    )
                )
                console.log(entityIdentifier)
                console.log(relationship.id)
                console.log(relationship.lHConstraints.get(entityIdentifier)!)
                DatabaseController.verifyDatabaseUpdate(firstRelation)

            }
        } finally {
            await session.close()
        }
    }

    public async createSubset({
                                  pos,
                                  ...subset
                              }: Entity) {
        const session = this.databaseDriver.session()

        var entityKeys = ['id', 'posX', 'posY', 'text', 'name']
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
                        name: subset.text
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(result)
        } finally {
            await session.close()
        }
    }

    public async addSubsets(entity: Entity, subset: Entity): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entities = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (a:ENTITY), (b:SUBSET) WHERE a.id = $entityIdentifier AND b.id = $subsetIdentifier ' +
                    `CREATE (a)-[r:SUBSET]->(b) RETURN type(r)`,
                    {
                        entityIdentifier: entity.id,
                        subsetIdentifier: subset.id,
                    },
                )
            )
            DatabaseController.verifyDatabaseUpdate(entities)
            return entities
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
            // DatabaseController.verifyDatabaseUpdate(entities)
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
                    'MATCH (n:ENTITY)-[r]->(a:ATTRIBUTE) WITH n, a as attributes RETURN { nodeID: n.id, ' +
                    'attributes: collect(attributes) }',
                )
            )
            // DatabaseController.verifyDatabaseUpdate(entitiesWithAttributes)
            return entitiesWithAttributes
        } finally {
            await session.close()
        }

    }

    public async getAllSubsets(): Promise<QueryResult> {
        const session = this.databaseDriver.session()

        try {
            const entitiesWithAttributes = await session.writeTransaction(tx =>
                tx.run(
                    'MATCH (n:ENTITY)-[r]->(s:SUBSET) WITH n, s as subsets RETURN { nodeID: n.id, ' +
                    'subsets: collect(subsets) }',
                )
            )
            // DatabaseController.verifyDatabaseUpdate(entitiesWithAttributes)
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
                    'MATCH (r:RELATIONSHIP)<-[re]-(n:ENTITY) with r, {lhConstraint: re, entityID: n.id} ' +
                    'as relations RETURN { relationship: r, entities: collect(relations) }',
                )
            )
            // DatabaseController.verifyDatabaseUpdate(entitiesWithAttributes)

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
                    'MATCH (n:RELATIONSHIP)-[r]->(a:ATTRIBUTE) WITH n, a as attributes RETURN { relationshipID: n.id, ' +
                    'attributes: collect(attributes) }',
                )
            )
            // DatabaseController.verifyDatabaseUpdate(relationshipWithAttributes)
            return relationshipWithAttributes
        } finally {
            await session.close()
        }

    }

}


export default DatabaseController
