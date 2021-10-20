import Attribute from "./attribute";

interface Entity {
    id: number,
    name: String,
    attributes?: Array<Attribute>
}

export default Entity
