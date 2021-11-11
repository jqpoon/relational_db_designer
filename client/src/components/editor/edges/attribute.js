import { useRef, useState } from "react";
import Xarrow from "react-xarrows";
import "./stylesheets/attribute.css";
import { types } from "../types";

export default function Attribute({
  parentType,
  parentId,
  id,
  text, // Attribute name
  relativePos, // Relative x, y position of attribute to parent node
  parentPos, // Position of parent node. If this field is null, then the parent's position will be obtained by going through list of entities/relationships
  start, // Id of the node this attribute should be joined to
  updateElement, // Generic update function for dict in editor.js
  getElement, // Generic getter for dict in editor.js
}) {
  // TODO: maybe include scale in function arguments?

  // Name of attribute to be displayed
  const [name, setName] = useState(text);
  const [editable, setEditable] = useState(true);

  // Ref of lollipop end
  const attributeEndRef = useRef(null);

  // Calculate position of entity end
  const calculateEntityEndPos = () => {
    if (parentPos == null || parentPos.x == null || parentPos.y == null) {
      let parentNode = getElement(types.ENTITY, parentId); // assume only entities have attributes for now TODO: change to include other node types
      parentPos = { x: parentNode.pos.x, y: parentNode.pos.y };
    }
    return { x: parentPos.x + relativePos.x, y: parentPos.y + relativePos.y };
  };
  let absolutePos = calculateEntityEndPos();

  // change style with transform(x, y) and re-render attribute
  var chosenStyle = {
    transform: `translate(${absolutePos.x}px, ${absolutePos.y}px)`,
  };

  // Automatically adjusts text location based on where the arrow is.
  let leftStyle = {
    transform: "translate(-110%, -6.5px)",
    display: "inline-block",
  };
  let rightStyle = {
    transform: "translate(20px, -6.5px)",
    display: "inline-block",
  };
  let bottomStyle = {
    transform: "translate(-40%, 20px)",
    display: "inline-block",
  };

  let textStyle = null;
  if (relativePos.x < 0) {
    textStyle = leftStyle;
  } else if (relativePos.y > 100) {
    textStyle = bottomStyle;
  } else {
    textStyle = rightStyle;
  }

  // Used for editing name of attribute
  const editingMode = () => {
    return editable ? (
      <div>
        <input
          value={name}
          placeholder="Attribute"
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              // Update node text
              let newNode = getElement(
                types.ATTRIBUTE,
                id,
                parentType,
                parentId
              );
              newNode.text = name;
              updateElement(types.ATTRIBUTE, newNode);
              setEditable(false);
            }
          }}
        />
      </div>
    ) : (
      <div>{text}</div>
    );
  };

  let attributeEnd = (
    <div
      ref={attributeEndRef}
      className="attribute-end"
      style={chosenStyle}
      onClick={() => {
        setEditable(true);
      }}
    >
      <div style={textStyle}>{editingMode()}</div>
    </div>
  );

  let attribute = (
    <div>
      {attributeEnd}
      <Xarrow
        start={parentId}
        end={attributeEndRef}
        path="straight"
        headSize="0"
        zIndex={-10}
      />
    </div>
  );

  return attribute;
}

// Class to store global count of attributes, so that we can generate
// new attribute ids
class idCounter {
  static counter = 1;
  static getCount() {
    return idCounter.counter++;
  }
}

export function addAttributeToNode(
  updateElement, // Generic update node function from editor.js
  addElement, // Generic add node function from editor.js
  getElement, // Generic get node function from editor.js
  text, // Attribute name
  parentId // Id of parent node
) {
  // Assume only entities have attributes for now TODO: change to include other node types
  const parentNode = getElement(types.ENTITY, parentId);
  const attributeCount = Object.keys(parentNode.attributes).length;

  // Calculate relative position based on number of attributes parent has
  const preconfiguredRelativePositions = [
    { x: -100, y: -30 },
    { x: -100, y: 30 },
    { x: -100, y: 90 },
    { x: 0, y: 150 },
    { x: 68, y: 150 },
    { x: 136, y: 150 },
    { x: 230, y: 90 },
    { x: 230, y: 30 },
    { x: 230, y: -30 },
  ];
  let relativePos = preconfiguredRelativePositions[attributeCount % 9];

  // Update parent node's attribute list
  const attributeId = parentId + "A" + idCounter.getCount();

  const attributeEntry = {
    parentId: parentId,
    parentType: types.ENTITY,
    id: attributeId,
    text: text,
    relativePos: relativePos,
    type: types.ATTRIBUTE,
  };

  addElement(types.ATTRIBUTE, attributeEntry);
}
