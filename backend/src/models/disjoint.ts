import Entity from "./entity";
import ModelObject from "./modelObject";

// A disjoint is a category object that contains multiple entities.
interface Disjoint extends ModelObject {
    // An identifier given to every single object that exists in the ER model.
    identifier: number;
    name: String;
    entities: Entity[];
}

export default Disjoint;
