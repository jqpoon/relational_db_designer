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
import { EditOnIcon } from "./components";
import { MdClear } from "react-icons/md";

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

export function DisplaySupersets({ parents, getElement, deleteElement }) {
  const idToNode = (id) => {
    const edge = getElement(types.EDGE.HIERARCHY, id);
    const parent = getElement(types.ENTITY, edge.parent);
    const generalisation = edge.generalisation ? (
      <>Generalisation: {parent.generalisations[edge.generalisation].text}</>
    ) : null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <div>
          {parent.text}
          <br />
          {generalisation}
        </div>
        <div>
          <MdClear
            onClick={() => {
              deleteElement(types.EDGE.HIERARCHY, edge);
            }}
          />
        </div>
      </div>
    );
  };
  return <DisplayNodes ids={parents} idToNode={idToNode} />;
}

export function DisplaySubsets({ children, getElement, deleteElement }) {
  const idToNode = (id) => {
    const edge = getElement(types.EDGE.HIERARCHY, id);
    const child = getElement(types.ENTITY, edge.child);
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <div>
          <li>{child.text}</li>
        </div>
        <div>
          <MdClear
            onClick={() => {
              deleteElement(types.EDGE.HIERARCHY, edge);
            }}
          />
        </div>
      </div>
    );
  };
  return <DisplayNodes ids={children} idToNode={idToNode} />;
}

export function DisplayAttributes({ attributes, updateNodeText }) {
  const idToNode = (attribute) => {
    return (
      <>
        <hr
          style={{
            height: "0.5px",
            margin: "0",
            padding: "0",
            backgroundColor: "black",
          }}
        />
        <EditOnIcon
          value={attribute.text}
          updateValue={(name) => updateNodeText(attribute, name)}
        />
      </>
    );
  };
  return <DisplayNodes ids={attributes} idToNode={idToNode} />;
}
