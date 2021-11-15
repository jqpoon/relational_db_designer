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
      {ids.map((id) => (
        <>
          <div className="selected-element">{idToNode(id)}</div>
        </>
      ))}
    </>
  );
}

export function DisplayRelationships({ relationships, getElement, isSource }) {
  const idToNode = (id) => {
    const edge = getElement(types.EDGE.RELATIONSHIP, id);
    const connected = isSource
      ? getElement(edge.target_type, edge.end)
      : getElement(edge.source_type, edge.start);
    return (
      <>
        <li>
          {connected.text} | {cardinality[edge.cardinality]}
        </li>
      </>
    );
  };
  return <DisplayNodes ids={relationships} idToNode={idToNode} />;
}

export function DisplaySupersets({ parents, getElement }) {
  const idToNode = (id) => {
    const edge = getElement(types.EDGE.HIERARCHY, id);
    const parent = getElement(types.ENTITY, edge.parent);
    const generalisation = edge.generalisation ? (
      <>Generalisation: {parent.generalisations[edge.generalisation].text}</>
    ) : null;
    return (
      <div>
        <div>
          {typeToString(types.ENTITY)}: {parent.text}
        </div>
        <div>{generalisation}</div>
      </div>
    );
  };
  return <DisplayNodes ids={parents} idToNode={idToNode} />;
}

export function DisplaySubsets({ children, getElement }) {
  const idToNode = (id) => {
    const edge = getElement(types.EDGE.HIERARCHY, id);
    const child = getElement(types.ENTITY, edge.child);
    return <li>{child.text}</li>;
  };
  return <DisplayNodes ids={children} idToNode={idToNode} />;
}

export function DisplayAttributes({ attributes }) {
  const idToNode = (attribute) => {
    return <li>{attribute.text}</li>;
  };
  return <DisplayNodes ids={attributes} idToNode={idToNode} />;
}
