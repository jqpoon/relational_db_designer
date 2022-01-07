import Xarrow from "react-xarrows";
import { cardinality as cardinality_all, types } from "../types";
import "./stylesheets/attribute.css";

function RelationshipEdge({ start, end, cardinality, isKey, scale }) {
  const style = {
    backgroundColor: "white",
    padding: "2.5px",
    fontSize: `${14 * scale}px`,
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
      strokeWidth={4 * scale}
      passProps={{
        onClick: () => {
          /*TODO */
        },
      }}
      zIndex={-1}
    />
  );
}

export function HierarchyEdge({ parent, child, generalisation, scale }) {
  return (
    <Xarrow
      start={child.toString()}
      end={(generalisation ? generalisation : parent).toString()}
      showHead={!generalisation}
      curveness={0}
      endAnchor={generalisation ? "middle" : "auto"}
      startAnchor="middle"
      strokeWidth={4 * scale}
      passProps={{
        onClick: () => {
          /*TODO */
        },
      }}
      zIndex={-1}
    />
  );
}

export function AttributeEdge({ parent, child, scale }) {
  return (
    <Xarrow
      start={child.toString()}
      end={parent.toString()}
      showTail
      tailShape="circle"
      tailSize={4}
      headSize="0"
      curveness={0}
      endAnchor="middle"
      strokeWidth={4 * scale}
      arrowTailProps={{
        fill: "white",
        strokeWidth: "0.2",
        stroke: "black",
      }}
      lineColor="black"
      zIndex={-1}
    />
  );
}

export default function Edge({ edge, scale }) {
  switch (edge.type) {
    case types.EDGE.RELATIONSHIP:
      return <RelationshipEdge {...edge} scale={scale} />;
    case types.EDGE.HIERARCHY:
      return <HierarchyEdge {...edge} scale={scale} />;
    default:
      console.log("Invalid edge type encountered: " + edge.type);
      return null;
  }
}
