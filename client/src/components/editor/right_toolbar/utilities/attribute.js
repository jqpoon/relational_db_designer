import { addAttributeToNode } from "../../edges/attribute";
import { types } from "../../types";

export function AddAttribute(props) {
  return (
    <div className="section-tool" onClick={() => addAttributeToNode(props)}>
      + Add Attribute
    </div>
  );
}

export function Attributes({ attributes, updateElement }) {
  return (
    <>
      {attributes.map((attribute) => (
        <Attribute attribute={attribute} updateElement={updateElement} />
      ))}
    </>
  );
}

function Attribute({ attribute, updateElement }) {
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
      <input
        type="text"
        style={{ fontSize: "medium" }}
        value={attribute.text}
        onChange={(e) => {
          updateAttributeName(e.target.value);
        }}
      />
      <br />
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
      <input
        type="checkbox"
        checked={attribute.isPrimaryKey}
        onChange={() => {
          const change = (attribute) => {
            attribute.isPrimaryKey = !attribute.isPrimaryKey;
          };
          updateAttribute(change);
        }}
      />
      <label style={{ fontWeight: "normal" }}>Primary Key</label>
    </div>
  );
}
