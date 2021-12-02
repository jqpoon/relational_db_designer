import Xarrow from "react-xarrows";
import { cardinality as cardinality_all, types } from "../types";
import "./stylesheets/attribute.css";

function RelationshipEdge({ start, end, cardinality, isKey }) {
  console.log("Start:" + start + ", End: " + end);
  const style = {
    backgroundColor: "white",
    padding: "2.5px",
  };
  if (isKey) {
    style["textDecoration"] = "underline";
  }
  return (
    <Xarrow
      start={start.toString()}
      end={end.toString()}
      labels={<div style={style}>{cardinality_all[cardinality]}</div>}
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
