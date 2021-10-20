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

const foreignObjectSize = 200;

const onEdgeClick = (evt: any, id: any) => {
  evt.stopPropagation();
  alert(`remove ${id}`);
};

export default function AttributeEdge(props : EdgeProps) {
  let edgePathDict = {sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition, targetX: props.targetX, targetY: props.targetY, targetPosition: props.targetPosition};
  const edgePath = getBezierPath(edgePathDict);
  const markerEnd = getMarkerEnd(props.arrowHeadType, props.markerEndId);

  let randomDict = {
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  }

  const [edgeCenterX, edgeCenterY] = getEdgeCenter(randomDict);

  return (
    <>
      <path id={props.id} style={props.style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />

      <text>
        <textPath href={`#${props.id}`} style={{ fontSize: '12px' }} startOffset="50%" textAnchor="middle">
          {props.data.text}
        </textPath>
      </text>

      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={props.targetX}
        y={props.targetY}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="circle"></div>
      </foreignObject>
    </>
  );
}