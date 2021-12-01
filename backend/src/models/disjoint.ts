import Position from "./position";

// A disjoint is a category object that contains multiple entities.
interface Disjoint {
    // An identifier given to every single object that exists in the ER model.
    id: string;
    text: String;

    // Variables used for generating the shape of the object on the client.
    pos: Position; 

    // General-use variables.
    // A list of all the sub-entities' identifier numbers.
    entities: number[];
}

export default Disjoint;
