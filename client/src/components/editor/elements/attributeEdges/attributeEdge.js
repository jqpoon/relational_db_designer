import Xarrow from "react-xarrows";

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
