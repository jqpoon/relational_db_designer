import React from 'react';
import { ArrowHeadType, getBezierPath, getMarkerEnd , Position, getEdgeCenter} from 'react-flow-renderer';
import './edges.css'

export interface EdgeProps {
  id: string;
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  style: any, // Used to be {}
  data: any,
  arrowHeadType: ArrowHeadType,
  markerEndId: any,
}

const foreignObjectSize = 20;

export default function AttributeEdge(props : EdgeProps) {
  let edgePathDict = {sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition, targetX: props.targetX, targetY: props.targetY - 10, targetPosition: props.targetPosition};
  
  const edgePath = getBezierPath(edgePathDict);
  const markerEnd = getMarkerEnd(props.arrowHeadType, props.markerEndId);

  return (
    <>
      <path id={props.id} style={props.style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />

      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={props.targetX - foreignObjectSize / 2}
        y={props.targetY - 15}
      >
        <div className="attribute-end"></div>
      </foreignObject>
    </>
  );
}