import { types } from "../../types";

export function typeToString(type) {
  const typesString = {
    [types.ENTITY]: "Entity",
    [types.RELATIONSHIP]: "Relationship",
    [types.ATTRIBUTE]: "Attribute",
    [types.GENERALISATION]: "Generalisation",
    [types.EDGE.HIERARCHY]: "Edge",
    [types.EDGE.RELATIONSHIP]: "Edge",
  };
  return typesString[type];
}

export function generateID(x, y) {
  return `Edge${x}${y}`;
}
