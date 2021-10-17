import Entity from "../models/entity";
import DatabaseController from "./databaseController";

class SchemaController {

    private static instance: SchemaController;

    private constructor() {}

    public static getInstance(): SchemaController {
        if (!SchemaController.instance) {
            SchemaController.instance = new SchemaController();
        }
        return SchemaController.instance;
    }

    public createEntity(entity: Entity): void {
        // TODO return response back to API, checking entity validity
        DatabaseController.getInstance().createEntity(entity);
    }

}

export default SchemaController
