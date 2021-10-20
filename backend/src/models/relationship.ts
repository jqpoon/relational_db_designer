import Attribute from "./attribute";
import Entity from "./entity";
import ModelObject from "./modelObject";

enum LookHereConstraint {
    OneToOne,
    ZeroToN,
}

// This is the link between a relationship node and an enttity node.
interface RelationshipEntityLink extends ModelObject {
    entity: Entity;
    lookHereConstraint: LookHereConstraint;
}

// This is the relatioship object between two associated entities.
interface Relationship extends ModelObject {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;
    name: String;
    attributes: Array<Attribute>;
    entities: Array<RelationshipEntityLink>;
}

export default Relationship;
