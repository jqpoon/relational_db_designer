import Position from "./position";

// Attributes can be part of entities or relationships.
interface Attribute {
    // An identifier given to every single object that exists in the ER model.
    id: string;
    text: string;

    // Variables used for generating the shape of the object on the client.
    relativePos: Position; 

    // General-use variables.
    isMultiValued: boolean;
    isPrimaryKey: boolean;
    isOptional: boolean;
}

export default Attribute;
