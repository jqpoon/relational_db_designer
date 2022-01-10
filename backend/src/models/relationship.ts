import Attribute from "./attribute";
import Position from "./position";

// Look-here constraints.
enum LHConstraint {
	ONE_TO_ONE,
	ONE_TO_MANY,
	ZERO_TO_ONE,
	ZERO_TO_MANY,
}

// This is the relatioship object between two associated entities.
interface Relationship {
	// An identifier given to every single object that exists in the ER model.
	id: string;
	text: string;

	// Variables used for generating the shape of the object on the client.
	pos: Position;

	// General-use variables.
	attributes?: Attribute[];
	// A map between the entity's identifier number and the constraint used for that link.
	lHConstraints: Map<string, LHConstraint>;
}

export { LHConstraint, Relationship as default };
