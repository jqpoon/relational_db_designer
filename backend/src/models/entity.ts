import Attribute from "./attribute";
import ModelObject from "./modelObject";

interface Entity extends ModelObject {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;
    name: String;
    isWeak: Boolean;
    attributes: Attribute[];
    subsets: Entity[];
}

export default Entity;
