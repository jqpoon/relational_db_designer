// Display a list of nodes connected to the current selected node eg:
// -------
// Relationship: "Works In"
// Cardinality: "1:1"
// -------
// Relationship: "Next Relationship"
// Cardinality: "0:N"
// -------
// ....
import Divider from "./divider";
import { cardinality, types } from "../../types";
import { typeToString } from "./general";

import "../toolbar-right.css";

// Generic function which maps over given ids,
// converting them to HTML elements via idToNode
function DisplayNodes({ ids, idToNode }) {
  return (
    <>
      {ids.length === 0 ? null : <Divider />}
      {ids.map((id) => (
        <>
          <div className="selected-element">{idToNode(id)}</div>
          <Divider />
        </>
      ))}
    </>
  );
}

export function DisplayRelationships({ relationships, getNode, isSource }) {
  const idToNode = (id) => {
    const edge = getNode(types.EDGE.RELATIONSHIP, id);
    const connected = isSource
      ? getNode(edge.target_type, edge.end)
      : getNode(edge.source_type, edge.start);
    return (
      <>
        <div>
          {typeToString(connected.type)}: {connected.text}
        </div>
        <div>Cardinality: {cardinality[edge.cardinality]}</div>
      </>
    );
  };
  return <DisplayNodes ids={relationships} idToNode={idToNode} />;
}

export function DisplaySupersets({ parents, getNode }) {
  const idToNode = (id) => {
    const edge = getNode(types.EDGE.HIERARCHY, id);
    console.log('Getting Edge:')
    console.log(edge);
    const parent = getNode(edge.target_type, edge.end);
    return (
      <div>
        {typeToString(edge.target_type)}: {parent.text}
      </div>
    );
  };
  return <DisplayNodes ids={parents} idToNode={idToNode} />;
}

export function DisplaySubsets({ children, getNode }) {
  const idToNode = (id) => {
    const edge = getNode(types.EDGE.HIERARCHY, id);
    const child = getNode(edge.source_type, edge.start);
    return (
      <div>
        {typeToString(edge.source_type)}: {child.text}
      </div>
    );
  };
  return <DisplayNodes ids={children} idToNode={idToNode} />;
}
