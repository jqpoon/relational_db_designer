import SchemaController from "src/controllers/schemaController";
import Disjoint from "./disjoint";
import Entity from "./entity";

class BaseDisjoint implements Disjoint {
    private entityRefs: String[] = [];

    identifier: number;
    name: String;
    entities: Entity[] = [];

    constructor(identifier = 0, name = "Unknown") {
        this.identifier = identifier;
        this.name = name;
    }

    buildFirstPassFromJson(objectAsJson: any): void {
        this.identifier = objectAsJson.identifier;
        this.name = objectAsJson.name;
        this.entityRefs = objectAsJson.entities
            .split(/(\s+)/)
            .filter((e: String) => e.trim().length > 0);
    }

    decodeObjectReferences(schemaController: SchemaController): void {
        // TODO: Populate the entities array by finding all the entities with matching names in schemaController.
    }
}

export default BaseDisjoint;
