import { types } from "../types";
import {
  createEntity,
  deleteEntity,
  getEntity,
  updateEntity,
} from "./entities/entity";
import {
  createGeneralisation,
  deleteGeneralisation,
  getGeneralisation,
  updateGeneralisation,
} from "./generalisations/generalisation";
import {
  createHierarchyEdge,
  deleteHierarchyEdge,
  getHierarchyEdge,
  updateHierarchyEdge,
} from "./hierarchyEdges/hierarchyEdge";
import {
  createRelationshipEdge,
  deleteRelationshipEdge,
  getRelationshipEdge,
  updateRelationshipEdge,
} from "./relationshipEdges/relationshipEdge";
import {
  createRelationship,
  deleteRelationship,
  getRelationship,
  updateRelationship,
} from "./relationships/relationship";
import {
  createAttribute,
  deleteAttribute,
  getAttribute,
  updateAttribute,
} from "./attributes/attribute";

export const creates = {
  [types.ENTITY]: createEntity,
  [types.RELATIONSHIP]: createRelationship,
  [types.ATTRIBUTE]: createAttribute,
  [types.EDGE.RELATIONSHIP]: createRelationshipEdge,
  [types.EDGE.HIERARCHY]: createHierarchyEdge,
  [types.GENERALISATION]: createGeneralisation,
};

export const gets = {
  [types.ENTITY]: getEntity,
  [types.RELATIONSHIP]: getRelationship,
  [types.ATTRIBUTE]: getAttribute,
  [types.GENERALISATION]: getGeneralisation,
  [types.EDGE.RELATIONSHIP]: getRelationshipEdge,
  [types.EDGE.HIERARCHY]: getHierarchyEdge,
};

export const deletes = {
  [types.ENTITY]: deleteEntity,
  [types.RELATIONSHIP]: deleteRelationship,
  [types.ATTRIBUTE]: deleteAttribute,
  [types.GENERALISATION]: deleteGeneralisation,
  [types.EDGE.RELATIONSHIP]: deleteRelationshipEdge,
  [types.EDGE.HIERARCHY]: deleteHierarchyEdge,
};

export const updates = {
  [types.ENTITY]: updateEntity,
  [types.RELATIONSHIP]: updateRelationship,
  [types.ATTRIBUTE]: updateAttribute,
  [types.GENERALISATION]: updateGeneralisation,
  [types.EDGE.RELATIONSHIP]: updateRelationshipEdge,
  [types.EDGE.HIERARCHY]: updateHierarchyEdge,
};
