export const types = {
  ENTITY: "entity",
  RELATIONSHIP: "relationship",
  GENERALISATION: "generalisation",
  EDGE: {
    RELATIONSHIP: "relationship_edge",
    HIERARCHY: "hierarchy_edge",
  },
  ATTRIBUTE: "attribute",
};

export const actions = {
  NORMAL: "normal",
  SELECT: {
    NORMAL: "select_normal",
    ADD_RELATIONSHIP: "select_add_relationship",
    ADD_SUPERSET: "select_add_superset",
    ADD_SUBSET: "select_add_subset",
  },
  NODE_EDIT: "node_edit",
  RELATIONSHIP_ADD: {
    SELECT_SOURCES: "relationship_add_source",
    SELECT_TARGET: "relationship_add_target",
  },
};

export const cardinality = {
  ZERO_TO_ONE: "0:1",
  ZERO_TO_MANY: "0:N",
  ONE_TO_ONE: "1:1",
  ONE_TO_MANY: "1:N",
};
