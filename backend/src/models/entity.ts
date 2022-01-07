import Attribute from "./attribute";
import Position from "./position";

interface Entity {
    // An identifier given to every single object that exists in the ER model.
    id: string;
    text: string;

    // Variables used for generating the shape of the object on the client.
    pos: Position
    
    // General-use variables.
    isWeak?: boolean;
    attributes?: Attribute[];
    // A list of all the sub-entities
    subsets?: string[];
}


export default Entity;
