// Display a list of nodes connected to the current selected node eg:
// -------
// Relationship: "Works In"
// Cardinality: "1:1"
// -------
// Relationship: "Next Relationship"
// Cardinality: "0:N"
// -------
// ....
import { types } from "../../types";

import "../../toolbar.css";
import { EditOnIcon } from "../../oldRightToolbar/utilities/components";
import { MdClear } from "react-icons/md";
import { DeleteButton } from "./deleteButton";

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

export function DisplaySupersets({ parents, getElement, deleteElement }) {
  const idToNode = (id) => {
    const edge = getElement(types.EDGE.HIERARCHY, id);
    const parent = getElement(types.ENTITY, edge.parent);
    return (
      <div className="toolbar-section-item">
        <div style={{ display: "flex", alignItems: "" }}>
          <DeleteButton elem={edge} deleteElem={deleteElement} />
          <div style={{ padding: "0px 0px 0px 10px" }}>
            <h4>{parent.text}</h4>
            {edge.generalisation ? (
              <h4>- {parent.generalisations[edge.generalisation].text}</h4>
            ) : null}
          </div>
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
      <div className="toolbar-section-item">
        <div style={{ display: "flex", alignItems: "center" }}>
          <DeleteButton elem={edge} deleteElem={deleteElement} />
          <li>{child.text}</li>
        </div>
      </div>
    );
  };
  return <DisplayNodes ids={children} idToNode={idToNode} />;
}
