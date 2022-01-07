import { useCallback, useEffect, useRef, useState } from "react";
import { useXarrow } from "react-xarrows";
import Draggable from "react-draggable";

import "./relationship.css";
import { actions, types } from "../types";
import { addAttributeToNode } from "../edges/attribute";
import { Node } from "./general";

export function Relationship({ node, ctx, functions }) {
  const ctxMenuActions = {
    ["Add Attribute"]: () =>
      addAttributeToNode({
        addElement: functions.addElement,
        getElement: functions.getElement,
        parentId: node.id,
        parentType: node.type,
      }),
  };
  return (
    <Node
      node={node}
      ctx={ctx}
      ctxMenuActions={ctxMenuActions}
      functions={functions}
    />
  );
}
