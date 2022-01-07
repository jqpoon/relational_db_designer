import { MdClear } from "react-icons/md";
import { addAttributeToNode } from "../../elements/attributes/attribute";
import { types } from "../../types";

export function AddAttribute(props) {
  return (
    <div className="section-tool" onClick={() => addAttributeToNode(props)}>
      + Add Attribute
    </div>
  );
}

export function Attributes({ attributes, updateElement, deleteElement }) {
  return (
    <>
      {attributes.map((attribute) => (
        <Attribute
          attribute={attribute}
          updateElement={updateElement}
          deleteElement={deleteElement}
        />
      ))}
    </>
  );
}

function Attribute({ attribute, updateElement, deleteElement }) {
  const updateAttributeName = (name) => {
    let newAttribute = { ...attribute };
    newAttribute.text = name;
    updateElement(types.ATTRIBUTE, newAttribute);
  };
  const updateAttribute = (change) => {
    let newAttribute = { ...attribute };
    change(newAttribute);
    console.log(newAttribute);
    updateElement(types.ATTRIBUTE, newAttribute);
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px 5px 0px 0px",
        }}
      >
        <div>
          <input
            type="text"
            style={{ fontSize: "medium", padding: "5px 0px 0px 5px" }}
            value={attribute.text}
            onChange={(e) => {
              updateAttributeName(e.target.value);
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "5px" }}>
          <MdClear
            onClick={() => {
              deleteElement(types.ATTRIBUTE, attribute);
            }}
          />
        </div>
      </div>
      <div style={{ padding: "0px 5px" }}>
        <div>
          <input
            type="checkbox"
            checked={attribute.isPrimaryKey}
            onChange={() => {
              const change = (attribute) => {
                attribute.isPrimaryKey = !attribute.isPrimaryKey;
                if (attribute.isPrimaryKey) {
                  // Key attributes are mandatory and unique
                  attribute.isOptional = false;
                  attribute.isMultiValued = false;
                }
              };
              updateAttribute(change);
            }}
          />
          <label style={{ fontWeight: "normal" }}>Primary Key</label>
          <br />
        </div>
        <div style={{ display: attribute.isPrimaryKey ? "none" : "block" }}>
          <input
            type="checkbox"
            checked={attribute.isOptional}
            onChange={() => {
              const change = (attribute) => {
                attribute.isOptional = !attribute.isOptional;
              };
              updateAttribute(change);
            }}
          />
          <label style={{ fontWeight: "normal" }}>Optional</label>
          <br />
        </div>
        <div style={{ display: attribute.isPrimaryKey ? "none" : "block" }}>
          <input
            type="checkbox"
            checked={attribute.isMultiValued}
            onChange={() => {
              const change = (attribute) => {
                attribute.isMultiValued = !attribute.isMultiValued;
              };
              updateAttribute(change);
            }}
          />
          <label style={{ fontWeight: "normal" }}>Multi-Valued</label>
          <br />
        </div>
      </div>
    </div>
  );
}
