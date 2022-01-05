import { types } from "../types";
import { deleteAttribute, getAttribute, updateAttribute } from "./attributes";
import { createEntity, deleteEntity, getEntity, updateEntity } from "./entities";
import { deleteGeneralisation, getGeneralisation, updateGeneralisation } from "./generalisations";
import { deleteHierarchyEdge, getHierarchyEdge, updateHierarchyEdge } from "./hierarchyEdges";
import { deleteRelationshipEdge, getRelationshipEdge, updateRelationshipEdge } from "./relationshipEdges";
import { createRelationship, deleteRelationship, getRelationship, updateRelationship } from "./relationships";

export const creates = {
  [types.ENTITY]: createEntity,
  [types.RELATIONSHIP]: createRelationship,
}

export const gets = {
  [types.ENTITY]: getEntity,
  [types.RELATIONSHIP]: getRelationship,
  [types.ATTRIBUTE]: getAttribute,
  [types.GENERALISATION]: getGeneralisation,
  [types.EDGE.RELATIONSHIP]: getRelationshipEdge,
  [types.EDGE.HIERARCHY]: getHierarchyEdge,
}

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
}
