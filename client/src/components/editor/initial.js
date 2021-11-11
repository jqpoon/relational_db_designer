import { types } from "./types";

export const initialEntities = {
  E0: {
    id: "E0",
    text: "Person",
    pos: { x: 300, y: 250 },
    type: types.ENTITY,
    edges: {
      E0R0: { type: types.EDGE.RELATIONSHIP },
      E1E0: { type: types.EDGE.HIERARCHY },
    },
    attributes: {
      E0A0: {
        parentId: "E0",
        parentType: types.ENTITY,
        id: "E0A0",
        type: types.ATTRIBUTE,
        text: "Name",
        relativePos: { x: -100, y: -30 },
        isOptional: false,
        isPrimaryKey: false,
      },
    },
  },
  E1: {
    id: "E1",
    text: "Manager",
    pos: { x: 100, y: 250 },
    type: types.ENTITY,
    edges: {
      E1E0: { type: types.EDGE.HIERARCHY },
    },
    attributes: {},
  },
  E2: {
    id: "E2",
    text: "Department",
    pos: { x: 750, y: 250 },
    type: types.ENTITY,
    edges: {
      E2R0: { type: types.EDGE.RELATIONSHIP },
    },
    attributes: {},
  },
};

export const initialRelationships = {
  R0: {
    id: "R0",
    text: "Works In",
    pos: { x: 550, y: 250 },
    type: types.RELATIONSHIP,
    edges: {
      E0R0: { type: types.EDGE.RELATIONSHIP },
      E2R0: { type: types.EDGE.RELATIONSHIP },
    },
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
    target_type: types.RELATIONSHIP,
  },
  E2R0: {
    start: "E2",
    end: "R0",
    id: "E2R0",
    cardinality: "ZERO_TO_MANY",
    type: types.EDGE.RELATIONSHIP,
    source_type: types.ENTITY,
    target_type: types.RELATIONSHIP,
  },
  E1E0: {
    start: "E1",
    end: "E0",
    id: "E1E0",
    type: types.EDGE.HIERARCHY,
    source_type: types.ENTITY,
    target_type: types.ENTITY,
  },
};
