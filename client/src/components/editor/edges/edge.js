import Xarrow from "react-xarrows";
import { cardinality as cardinality_all, types } from "../types";
import "./stylesheets/attribute.css";

function RelationshipEdge({ start, end, cardinality }) {
  console.log("Start:" + start + ", End: " + end);
  return (
    <Xarrow
      start={start.toString()}
      end={end.toString()}
      labels={cardinality_all[cardinality]}
      showHead={false}
      curveness={0}
      endAnchor="middle"
      startAnchor="middle"
      passProps={{
        onClick: () => {
          /*TODO */
        },
      }}
      zIndex={-1}
    />
  );
}

export function HierarchyEdge({ parent, child, generalisation }) {
  return (
    <Xarrow
      start={child.toString()}
      end={(generalisation ? generalisation : parent).toString()}
      showHead={!generalisation}
      curveness={0}
      endAnchor={generalisation ? "middle" : "auto"}
      startAnchor="middle"
      passProps={{
        onClick: () => {
          /*TODO */
        },
      }}
      zIndex={-1}
    />
  );
}

export function AttributeEdge({ parent, child }) {
  return (
    <Xarrow
      start={child.toString()}
      end={parent.toString()}
      // showTail
      // tailShape="circle"
      headSize="0"
      curveness={0}
      endAnchor="middle"
      startAnchor="middle"
      passProps={{
        onClick: () => {
          /*TODO */
        },
      }}
      zIndex={-1}
    />
  );
}

export default function Edge({ edge }) {
  switch (edge.type) {
    case types.EDGE.RELATIONSHIP:
      return <RelationshipEdge {...edge} />;
    case types.EDGE.HIERARCHY:
      return <HierarchyEdge {...edge} />;
    default:
      console.log("Invalid edge type encountered: " + edge.type);
      return null;
  }
}
