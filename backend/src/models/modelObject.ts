import SchemaController from "src/controllers/schemaController";

// An interface for any object in the ER model that can be parsed from a JSON request.
interface ModelObject {
    buildFirstPassFromJson(objectAsJson: any): void;
    decodeObjectReferences(schemaController: SchemaController): void;
}

export default ModelObject;
