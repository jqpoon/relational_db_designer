import React from 'react';
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer';

export interface EdgeProps {
  id: number;
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: number,
  targetPosition: number,
  style: any, // Used to be {}
  data: any,
  arrowHeadType: any,
  markerEndId: any,
}

// export default function CustomEdge(props : EdgeProps) {
//   let sourceX = props.id;
//   const edgePath = getBezierPath({ props.sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
//   const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

//   return (
//     <>
//       <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
//       <text>
//         <textPath href={`#${id}`} style={{ fontSize: '12px' }} startOffset="50%" textAnchor="middle">
//           {data.text}
//         </textPath>
//       </text>
//     </>
//   );