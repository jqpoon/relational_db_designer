import { types } from "../types";
import { deleteAttribute, updateAttribute } from "./attributes";
import { deleteEntity, updateEntity } from "./entities";
import { deleteGeneralisation, updateGeneralisation } from "./generalisations";
import { deleteHierarchyEdge, updateHierarchyEdge } from "./hierarchyEdges";
import { deleteRelationshipEdge, updateRelationshipEdge } from "./relationshipEdges";
import { deleteRelationship, updateRelationship } from "./relationships";

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
