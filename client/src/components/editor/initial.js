import { types } from ".";

export const initialEntities = {
  E0: {
    id: "E0",
    text: "Entity-0",
    pos: { x: 350, y: 250 },
    type: types.ENTITY,
  },
  E1: {
    id: "E1",
    text: "Entity-1",
    pos: { x: 550, y: 250 },
    type: types.ENTITY,
  },
};

export const initialRelationships = {
  R0: {
    id: "R0",
    text: "Relationship-0",
    pos: { x: 350, y: 100 },
    type: types.RELATIONSHIP,
  },
};

export const initialEdges = {
  E0R0: { start: "E0", end: "R0", id: "E0R0", labels: "Hello" },
};

// TODO: add initialAttributes
