import { Name } from "./name";
import "../toolbar.css";
import {
  addAttributeToNode,
  toggleKeyAttribute,
  toggleMultiValuedAttribute,
  toggleOptionalAttribute,
} from "../../elements/attributes/attribute";
import { Tooltip } from "@mui/material";
import { DeleteButton } from "./deleteButton";
import { types } from "../../types";

export function Attributes({ parent, attributes, functions }) {
  return (
    <>
      <h4 className="toolbar-section-header">Attribute(s)</h4>
      {attributes.map((attribute) => (
        <Attribute
          parent={parent}
          attribute={attribute}
          functions={functions}
        />
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

function Attribute({ parent, attribute, functions }) {
  const saveChanges = (change) => functions.saveChanges(attribute, change);

  return (
    <div className="toolbar-section-item">
      <div style={{ display: "flex" }}>
        <DeleteButton elem={attribute} deleteElem={functions.deleteElement} />
        <div>
          <div style={{ padding: "0px 5px" }}>
            <Name name={attribute.text} saveChanges={saveChanges} />
          </div>

          {/* Toggle attribute properties  */}
          <div className="attributes-checkbox">
            <div
              style={{
                display: parent.parentType === types.ENTITY ? "block" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={attribute.isPrimaryKey}
                onChange={() => toggleKeyAttribute(saveChanges)}
              />
              <label>Primary Key</label>
              <br />
            </div>

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
      </div>
    </div>
  );
}
