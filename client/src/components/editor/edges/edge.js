import Xarrow from "react-xarrows";
import { cardinality as cardinality_all, types } from "../types";

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

function HierarchyEdge({ start, end }) {
  return (
    <Xarrow
      start={start.toString()}
      end={end.toString()}
      showHead
      curveness={0}
      endAnchor="auto"
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

function GeneralisationEdge({ start, end }) {
  return (
    <Xarrow
      start={start.toString()}
      end={end.toString()}
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

export default function Edge({ edge }) {
  switch (edge.type) {
    case types.EDGE.RELATIONSHIP:
      return <RelationshipEdge {...edge} />;
    case types.EDGE.HIERARCHY:
      return <HierarchyEdge {...edge} />;
    case types.EDGE.GENERALISATION:
      return <GeneralisationEdge {...edge} />;
    default:
      console.log("Invalid edge type encountered: " + edge.type);
      return null;
  }
}
