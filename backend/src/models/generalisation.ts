import Position from "./position";
import Entity from "./entity";

// A generalisation is a category object that contains multiple entities.
interface Generalisation {
	// An identifier given to every single object that exists in the ER model.
	id: string;
	text: string;

	// Variables used for generating the shape of the object on the client.
	pos: Position;

	// General-use variables.
	parent: Entity;
	// A list of all the sub-entities.
	entities: Entity[];
}

export default Generalisation;
