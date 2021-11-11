import { types } from "./types";

// TODO: consider moving generalisations within entity nodes
export const initialGeneralisations = {
  G0: {
    type: types.GENERALISATION,
    id: "G0",
    text: "Messages",
    pos: { x: 300, y: 400 },
    edges: {
      G0E0: { type: types.EDGE.HIERARCHY },
      E3E0G0: { type: types.EDGE.GENERALISATION },
      E4E0G0: { type: types.EDGE.GENERALISATION },
    },
  },
};

export const initialEntities = {
  E0: {
    id: "E0",
    text: "Person",
    pos: { x: 300, y: 250 },
    type: types.ENTITY,
    edges: {
      E0R0: { type: types.EDGE.RELATIONSHIP },
      E1E0: { type: types.EDGE.HIERARCHY },
      G0E0: { type: types.EDGE.HIERARCHY },
    },
    attributeList: ["E0A0"],
  },
  E1: {
    id: "E1",
    text: "Manager",
    pos: { x: 100, y: 250 },
    type: types.ENTITY,
    edges: {
      E1E0: { type: types.EDGE.HIERARCHY },
    },
    attributeList: [],
    generalisations: {},
  },
  E2: {
    id: "E2",
    text: "Department",
    pos: { x: 750, y: 250 },
    type: types.ENTITY,
    edges: {
      E2R0: { type: types.EDGE.RELATIONSHIP },
    },
    attributeList: [],
    generalisations: {},
  },
  E3: {
    id: "E3",
    text: "Email User",
    pos: { x: 100, y: 600 },
    type: types.ENTITY,
    edges: {
      E3E0G0: { type: types.EDGE.GENERALISATION },
    },
    attributeList: [],
    generalisations: {},
  },
  E4: {
    id: "E4",
    text: "Non-email User",
    pos: { x: 500, y: 600 },
    type: types.ENTITY,
    edges: {
      E4E0G0: { type: types.EDGE.GENERALISATION },
    },
    attributeList: [],
    generalisations: {},
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
  G0E0: {
    // TODO: consider removing these edges, and automatically generate them with the entity node
    start: "G0",
    end: "E0",
    id: "G0E0",
    type: types.EDGE.HIERARCHY,
    source_type: types.GENERALISATION,
    target_type: types.ENTITY,
  },
  E3E0G0: {
    start: "E3",
    end: "G0",
    id: "E3E0G0",
    type: types.EDGE.GENERALISATION,
    source_type: types.ENTITY,
    target_type: types.GENERALISATION,
  },
  E4E0G0: {
    start: "E4",
    end: "G0",
    id: "E4E0G0",
    type: types.EDGE.GENERALISATION,
    source_type: types.ENTITY,
    target_type: types.GENERALISATION,
  },
};

export const initialAttributes = {
  E0A0: {
    start: "E0",
    id: "E0A0",
    text: "Attribute1",
    relativePos: { x: -100, y: -30 },
    type: types.ATTRIBUTE,
  },
};
