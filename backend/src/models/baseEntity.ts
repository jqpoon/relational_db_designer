import SchemaController from "src/controllers/schemaController";
import Attribute from "./attribute";
import BaseAttribute from "./baseAttribute";
import Entity from "./entity";
import ModelObject from "./modelObject";

class BaseEntity implements Entity, ModelObject {
    private subsetRefs: String[] = [];

    identifier: number;
    name: String;
    isWeak: Boolean;
    attributes: Attribute[] = [];
    subsets: Entity[] = [];

    constructor(identifier = 0, name = "Unknown", isWeak = false) {
        this.identifier = identifier;
        this.name = name;
        this.isWeak = isWeak;
    }

    buildFirstPassFromJson(objectAsJson: any): void {
        this.identifier = objectAsJson.identifier;
        this.name = objectAsJson.name;
        this.isWeak = objectAsJson.isWeak;

        for (var rawAttribute in objectAsJson.attributes) {
            var attributeAsJson = JSON.parse(rawAttribute);
            var attribute = new BaseAttribute();
            attribute.buildFirstPassFromJson(attributeAsJson);
            this.attributes.push(attribute);
        }

        this.subsetRefs = objectAsJson.subsets
            .split(/(\s+)/)
            .filter((e: String) => e.trim().length > 0);
    }

    decodeObjectReferences(schemaController: SchemaController): void {
        // TODO: Populate the subsets array by finding all the entities with matching names in schemaController.
    }

    generateDatabaseModel(): Entity {
        return {
            identifier: this.identifier,
            name: this.name,
        }
    }
}

export default BaseEntity;
