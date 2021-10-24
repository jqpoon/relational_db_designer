import Attribute from "./attribute";

interface Entity {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;

    // Variables used for generating the shape of the object on the client.
    positionX: number;
    positionY: number;
    shapeWidth: number;
    shapeHeight: number;

    // General-use variables.
    name: string;
    isWeak?: boolean;
    attributes?: Attribute[];
    // A list of all the sub-entities' identifier numbers.
    subsets?: number[];
}

export default Entity;
