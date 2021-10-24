// A disjoint is a category object that contains multiple entities.
interface Disjoint {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;

    // Variables used for generating the shape of the object on the client.
    positionX: number;
    positionY: number;
    shapeWidth: number;
    shapeHeight: number;

    // General-use variables.
    name: String;
    // A list of all the sub-entities' identifier numbers.
    entities: number[];
}

export default Disjoint;
