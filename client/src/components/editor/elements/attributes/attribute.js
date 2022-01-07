import { getId } from "../../idGenerator";
import { types } from "../../types";
import { Node, saveChanges } from "../general";

// Toggles key attribute feature
const toggleKeyAttribute = (attr, functions) => () =>
  saveChanges(attr, functions, (attr) => {
    attr.isPrimaryKey = !attr.isPrimaryKey;
    if (attr.isPrimaryKey) {
      // Key attributes are mandatory and unique
      attr.isOptional = false;
      attr.isMultiValued = false;
    }
  });

// Toggles optional attribute feature
const toggleOptionalAttribute = (attr, functions) => () =>
  saveChanges(attr, functions, (attr) => {
    attr.isOptional = !attr.isOptional;
    attr.isPrimaryKey = false;
  });

// Toggles multi-valued attribute feature
const toggleMultiValuedAttribute = (attr, functions) => () =>
  saveChanges(attr, functions, (attr) => {
    attr.isMultiValued = !attr.isMultiValued;
    attr.isPrimaryKey = false;
  });

export const addAttributeToNode = ({ addElement, parent }) => {
  addElement(types.ATTRIBUTE, createAttribute(parent));
};

export const createAttribute = (parent) => {
  return {
    parent: { id: parent.id, type: parent.type },
    id: getId(types.ATTRIBUTE, parent.id),
    text: "Attribute",
    relativePos: { x: -130, y: 15 }, // Preconfigured initial position
    isPrimaryKey: false,
    isMultiValued: false,
    isOptional: false,
    type: types.ATTRIBUTE,
  };
};

export function Attribute({ parent, attribute, ctx, functions }) {
  /** Position calculations */
  const pos = {
    x: parent.x + attribute.relativePos.x,
    y: parent.y + attribute.relativePos.y,
  };
  const updatePos = (data) => {
    return (attr) => {
      attr.relativePos = { x: data.x - parent.x, y: data.y - parent.y };
    };
  };
  /** Styling */
  const display = (attribute) => {
    if (attribute.isPrimaryKey) {
      return <u>{attribute.text}</u>;
    }
    if (attribute.isOptional && attribute.isMultiValued) {
      return <div>{attribute.text + "\u2217"}</div>;
    }
    if (attribute.isOptional) {
      return <div>{attribute.text + "?"}</div>;
    }
    if (attribute.isMultiValued) {
      return <div>{attribute.text + "+"}</div>;
    }
    return <div>{attribute.text}</div>;
  };

  const ctxMenuActions = {
    "Toggle Key Attribute": toggleKeyAttribute(attribute, functions),
    "Toggle Optional Attribute": toggleOptionalAttribute(attribute, functions),
    "Toggle Multi-valued Attribute": toggleMultiValuedAttribute(
      attribute,
      functions
    ),
  };

  return (
    <Node
      className="attribute"
      node={{ ...attribute, pos: pos, updatePos: updatePos, display: display }}
      ctxMenuActions={ctxMenuActions}
      ctx={ctx}
      functions={functions}
    />
  );
}
