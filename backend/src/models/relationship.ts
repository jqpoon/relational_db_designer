import Attribute from "./attribute";
import Entity from "./entity";

// This is the relatioship object between two associated entities.
interface Relationship {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;
    name: String;
    attributes?: Attribute[];
    entities: Entity[];
    lHConstraints: Map<Number, String>;
    // TODO string here will be an enum, number here is the id of entity
}

enum LHCONSTRAINTS {
    ONE_TO_MANY
}

export default Relationship;
