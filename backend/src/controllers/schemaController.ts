import Entity from "../models/entity";
import Attribute from "../models/attribute";
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

    public testing(entity: Entity, attribute: Attribute): void {
        // TODO return response back to API, checking entity validity
        DatabaseController.getInstance().createEntity(entity);
        DatabaseController.getInstance().addAttribute(entity, attribute);
    }

}

export default SchemaController
