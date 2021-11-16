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
        parent: { id: "E0", type: types.ENTITY },
        id: "E0A0",
        type: types.ATTRIBUTE,
        text: "Name",
        relativePos: { x: -100, y: -30 },
        isMultiValued: false,
        isOptional: false,
        isPrimaryKey: false,
      },
    },
    generalisations: {
      E0G0: {
        id: "E0G0",
        type: types.GENERALISATION,
        parent: { id: "E0" },
        text: "Messages",
        pos: { x: 300, y: 400 },
        edges: {
          E3E0G0: {},
          E4E0G0: {},
        },
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
    attributes: {},
    generalisations: {},
  },
  E3: {
    id: "E3",
    text: "Email Users",
    pos: { x: 100, y: 500 },
    type: types.ENTITY,
    edges: {
      E3E0G0: { type: types.EDGE.HIERARCHY },
    },
    attributes: {},
    generalisations: {},
  },
  E4: {
    id: "E4",
    text: "Non-email Users",
    pos: { x: 550, y: 500 },
    type: types.ENTITY,
    edges: {
      E4E0G0: { type: types.EDGE.HIERARCHY },
    },
    attributes: {},
    generalisations: {},
  },
};

export const initialRelationships = {
  R0: {
    id: "R0",
    text: "Works In",
    pos: { x: 550, y: 250 },
    type: types.RELATIONSHIP,
    attributes: {},
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
    id: "E1E0",
    parent: "E0",
    child: "E1",
    type: types.EDGE.HIERARCHY,
  },
  E3E0G0: {
    id: "E3E0G0",
    parent: "E0",
    child: "E3",
    generalisation: "E0G0",
    type: types.EDGE.HIERARCHY,
  },
  E4E0G0: {
    id: "E4E0G0",
    parent: "E0",
    child: "E4",
    generalisation: "E0G0",
    type: types.EDGE.HIERARCHY,
  },
};
