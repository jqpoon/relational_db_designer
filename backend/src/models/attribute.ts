// Attributes can be part of entities or relationships.
interface Attribute {
    // Variables used for generating the shape of the object on the client.
    positionX: number;
    positionY: number;
    shapeWidth: number;
    shapeHeight: number;

    // General-use variables.
    name: string;
    isPrimaryKey: boolean;
    isOptional: boolean;
}

export default Attribute;
