import ModelObject from "./modelObject";

// Attributes can be part of entities or relationships.
interface Attribute {
    name: String;
    isPrimaryKey: Boolean;
    isOptional: Boolean;
}

export default Attribute;
