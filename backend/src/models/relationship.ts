import Attribute from "./attribute";
import Entity from "./entity";
import ModelObject from "./modelObject";

// This is the relatioship object between two associated entities.
interface Relationship extends ModelObject {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;
    name: String;
    attributes: Attribute[];
    entities: Entity[];
    lHConstraints: String[];
}

export default Relationship;
