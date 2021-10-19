import Entity from "../models/entity";
import Attribute from "../models/attribute";
import DatabaseController from "./databaseController";
import Relationship from "../models/relationship";

class SchemaController {

    private static instance: SchemaController;

    private constructor() {}

    public static getInstance(): SchemaController {
        if (!SchemaController.instance) {
            SchemaController.instance = new SchemaController();
        }
        return SchemaController.instance;
    }

    public testing(entityOne: Entity, entityTwo: Entity, attribute: Attribute, relationship: Relationship): void {
        // TODO return response back to API, checking entity validity
        DatabaseController.getInstance().createEntity(entityOne);
        DatabaseController.getInstance().createEntity(entityTwo);
        DatabaseController.getInstance().addAttribute(entityOne, attribute);
        DatabaseController.getInstance().addRelationship(entityOne, entityTwo, relationship)
    }

}

export default SchemaController
