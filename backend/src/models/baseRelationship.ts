import SchemaController from "src/controllers/schemaController";
import Attribute from "./attribute";
import BaseAttribute from "./baseAttribute";
import Entity from "./entity";
import Relationship from "./relationship";

class BaseRelationship implements Relationship {
    private entityRefs: String[] = [];

    identifier: number;
    name: String;
    attributes: Attribute[] = [];
    entities: Entity[] = [];
    lHConstraints: String[] = [];

    constructor(identifer = 0, name = "Unknown") {
        this.identifier = identifer;
        this.name = name;
    }

    buildFirstPassFromJson(objectAsJson: any): void {
        this.identifier = objectAsJson.identifier;
        this.name = objectAsJson.name;

        for (var rawAttribute in objectAsJson.attributes) {
            var attributeAsJson = JSON.parse(rawAttribute);
            var attribute = new BaseAttribute();
            attribute.buildFirstPassFromJson(attributeAsJson);
            this.attributes.push(attribute);
        }

        for (var rawLink in objectAsJson.entities) {
            var linkAsJson = JSON.parse(rawLink);
            this.entityRefs.push(String(linkAsJson.name));
            this.lHConstraints.push(String(linkAsJson.lookHereConstraint));
        }
    } // TODO: Populate attributes array.

    decodeObjectReferences(schemaController: SchemaController): void {
        throw new Error("Method not implemented.");
    }
}

export default BaseRelationship;
