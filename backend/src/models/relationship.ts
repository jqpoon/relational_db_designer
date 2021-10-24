import Attribute from "./attribute";

// Look-here constraints.
enum LHConstraint {
    ONE_TO_ONE,
    ONE_TO_MANY,
    MANY_TO_ONE,
}

// This is the relatioship object between two associated entities.
interface Relationship {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;

    // Variables used for generating the shape of the object on the client.
    positionX: number;
    positionY: number;
    shapeWidth: number;
    shapeHeight: number;

    // General-use variables.
    name: string;
    attributes?: Attribute[];
    // A map between the entity's identifier number and the constraint used for that link.
    lHConstraints: Map<number, LHConstraint>;
}

export { LHConstraint, Relationship as default };
