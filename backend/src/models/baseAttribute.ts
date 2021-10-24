import SchemaController from "src/controllers/schemaController";
import Attribute from "./attribute";
import ModelObject from "./modelObject";

class BaseAttribute implements Attribute, ModelObject {
    name: String;
    isPrimaryKey: Boolean;
    isOptional: Boolean;

    constructor(name = "Unknown", isPrimaryKey = false, isOptional = false) {
        this.name = name;
        this.isPrimaryKey = isPrimaryKey;
        this.isOptional = isOptional;
    }

    buildFirstPassFromJson(objectAsJson: any): void {
        this.name = objectAsJson.name;
        this.isPrimaryKey = objectAsJson.isPrimaryKey;
        this.isOptional = objectAsJson.isOptional;
    }

    decodeObjectReferences(schemaController: SchemaController): void {
        // There are no referenced objects to parse.
    }
}

export default BaseAttribute;
