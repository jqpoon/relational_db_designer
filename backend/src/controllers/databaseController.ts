import neo4j, { Driver } from "neo4j-driver";
import Entity from "../models/entity";

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

    public async createEntity({
                            name,
                        }: Entity) {

        const session = this.databaseDriver.session()

        try {
            const result = await session.writeTransaction(tx =>
                tx.run(
                    'CREATE (a:ENTITY) SET a.name = $name RETURN a.name',
                    { name: name }
                )
            )
            const singleRecord = result.records[0]
            console.log(singleRecord)
            const greeting = singleRecord.get(0)
            console.log(greeting)
        } finally {
            await session.close()
        }
    }

}


export default DatabaseController
