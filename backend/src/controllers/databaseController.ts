import neo4j, {Driver, QueryResult} from "neo4j-driver";
import Entity from "../models/entity";
import Attribute from "../models/attribute";

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
                    'CREATE (a:ENTITY) SET a.name = $name RETURN a.name',
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

}


export default DatabaseController
