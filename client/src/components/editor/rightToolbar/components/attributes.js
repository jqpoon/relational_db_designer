import { types } from "../../types";
import { Name } from "./name";
import "../../toolbar.css";
import "./toolbar-components.css";
import {
  addAttributeToNode,
  toggleKeyAttribute,
  toggleMultiValuedAttribute,
  toggleOptionalAttribute,
} from "../../elements/attributes/attribute";
import { Tooltip } from "@mui/material";
import { DeleteButton } from "./deleteButton";

export function Attributes({ parent, attributes, functions }) {
  return (
    <>
      <h4 className="toolbar-section-header">Attribute(s)</h4>
      {attributes.map((attribute) => (
        <Attribute attribute={attribute} functions={functions} />
      ))}
      <div
        className="toolbar-text-action"
        onClick={() =>
          addAttributeToNode({ addElement: functions.addElement, ...parent })
        }
      >
        + Add Attribute
      </div>
    </>
  );
}

function Attribute({ attribute, functions }) {
  const saveChanges = (change) => functions.saveChanges(attribute, change);

  return (
    <div className="toolbar-section-item">
      <div style={{ display: "flex", alignItems: "center" }}>
        <DeleteButton elem={attribute} deleteElem={functions.deleteElement} />
        <div style={{ padding: "0px 5px" }}>
          <Name name={attribute.text} saveChanges={saveChanges} />
        </div>
      </div>
      {/* Toggle attribute properties  */}
      <div className="attributes-checkbox">
        <input
          type="checkbox"
          checked={attribute.isPrimaryKey}
          onChange={() => toggleKeyAttribute(saveChanges)}
        />
        <label>Primary Key</label>
        <br />

        <Tooltip
          title={
            attribute.isPrimaryKey
              ? "Key attributes must be mandatory and unique."
              : ""
          }
          placement="left"
        >
          <div>
            <input
              disabled={attribute.isPrimaryKey}
              type="checkbox"
              checked={attribute.isOptional}
              onChange={() => toggleOptionalAttribute(saveChanges)}
            />
            <label>Optional</label>
            <br />

            <input
              disabled={attribute.isPrimaryKey}
              type="checkbox"
              checked={attribute.isMultiValued}
              onChange={() => toggleMultiValuedAttribute(saveChanges)}
            />
            <label>Multi-Valued</label>
            <br />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
