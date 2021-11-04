import { types } from "./types";

export const initialEntities = {
  E0: {
    id: "E0",
    text: "Person",
    pos: { x: 300, y: 250 },
    type: types.ENTITY,
    edges: ["E0R0"],
    parents: [],
    children: ["E1E0"],
  },
  E1: {
    id: "E1",
    text: "Manager",
    pos: { x: 100, y: 250 },
    type: types.ENTITY,
    edges: [],
    parents: ["E1E0"],
    children: [],
  },
  E2: {
    id: "E2",
    text: "Department",
    pos: { x: 750, y: 250 },
    type: types.ENTITY,
    edges: ["E2R0"],
    parents: [],
    children: [],
  },
};

export const initialRelationships = {
  R0: {
    id: "R0",
    text: "Works In",
    pos: { x: 550, y: 250 },
    type: types.RELATIONSHIP,
    edges: ["E0R0", "E2R0"]
  },
};

export const initialEdges = {
  E0R0: {
    start: "E0",
    end: "R0",
    id: "E0R0",
    cardinality: "ONE_TO_ONE",
    type: types.EDGE.RELATIONSHIP,
    source_type: types.ENTITY,
  },
  E2R0: {
    start: "E2",
    end: "R0",
    id: "E2R0",
    cardinality: "ZERO_TO_MANY",
    type: types.EDGE.RELATIONSHIP,
    source_type: types.ENTITY,
  },
  E1E0: {
    start: "E1",
    end: "E0",
    id: "E1E0",
    type: types.EDGE.HIERARCHY,
    source_type: types.ENTITY,
  },
};

// TODO: add initialAttributes
