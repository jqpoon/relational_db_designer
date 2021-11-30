import { useRef, useState, useEffect, useCallback } from "react";
import "./stylesheets/attribute.css";
import { types } from "../types";
import { AttributeContextMenu } from "../contextMenus/attributeContextMenu";

export default function Attribute({
  attribute,
  parentPos, // Position of parent node. If this field is null, then the parent's position will be obtained by going through list of entities/relationships
  updateElement, // Generic update function for dict in editor.js
  getElement, // Generic getter for dict in editor.js
}) {
  const [name, setName] = useState(attribute.text);
  const [editable, setEditable] = useState(true);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 }); // Context menu stuff
  const [show, setShow] = useState(false); // State to show context menu

  // Ref of lollipop end
  const attributeEndRef = useRef(null);

  // Hides the context menu if we left click again
  const handleClick = useCallback(() => {
    setShow(false);
  }, [show]);

  // Show context menu
  const handleContextMenu = useCallback((event) => {    
    event.preventDefault();
    setAnchorPoint({ x: 0, y: 0 }); // TODO: figure out how to fix anchor point
    setShow(true);
  }, []);

  // Handle context menus callbacks on mount
  useEffect(() => {
    const curAttr = attributeEndRef.current;
    // Right click
    document?.addEventListener("click", handleClick);
    curAttr?.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document?.removeEventListener("click", handleClick);
      curAttr?.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Calculate position of entity end
  const calculateEntityEndPos = () => {
    if (parentPos == null || parentPos.x == null || parentPos.y == null) {
      let parentNode = getElement(types.ENTITY, attribute.parent.id); // assume only entities have attributes for now TODO: change to include other node types
      parentPos = { x: parentNode.pos.x, y: parentNode.pos.y };
    }
    return { x: parentPos.x + attribute.relativePos.x, y: parentPos.y + attribute.relativePos.y };
  };
  let absolutePos = calculateEntityEndPos();

  // change style with transform(x, y) and re-render attribute
  var chosenStyle = {
    transform: `translate(${absolutePos.x}px, ${absolutePos.y}px)`,
  };

  // Automatically adjusts text location based on where the arrow is.
  let leftStyle = {
    top: "50%",
    transform: "translate(-120%, -1px)",
    display: "inline-block",
  };
  let rightStyle = {
    transform: "translate(30px, -1px)",
    display: "inline-block",
  };
  let bottomStyle = {
    transform: "translate(-40%, 20px)",
    display: "inline-block",
  };

  let textStyle = null;
  if (attribute.relativePos.x < 0) {
    textStyle = leftStyle;
  } else if (attribute.relativePos.y > 100) {
    textStyle = bottomStyle;
  } else {
    textStyle = rightStyle;
  }

  // Toggles key attribute feature
  const toggleKeyAttribute = () => {
    let attrNode = {...attribute};
    attrNode.isPrimaryKey = !attrNode.isPrimaryKey;
    updateElement(types.ATTRIBUTE, attrNode);
  };

  // Toggles optional attribute feature
  const toggleOptionalAttribute = () => {
    let attrNode = {...attribute};
    attrNode.isOptional = !attrNode.isOptional;
    updateElement(types.ATTRIBUTE, attrNode);
  };

  // Toggles multi-valued attribute feature
  const toggleMultiValuedAttribute = () => {
    let attrNode = {...attribute};
    attrNode.isMultiValued = !attrNode.isMultiValued;
    updateElement(types.ATTRIBUTE, attrNode);
  };

  // Used for editing name of attribute
  const editingMode = () => {
    if (editable) {
      return (
        <div>
          <input
            value={name}
            placeholder="Attribute"
            onChange={(e) => setName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                // Update node text
                let newNode = {...attribute};
                newNode.text = name;
                updateElement(types.ATTRIBUTE, newNode);
                setEditable(false);
              }
            }}
          />
        </div>
      );
    }

    // Cases:
    // key attribute only (cannot be optional or multi-valued)
    // not key, not optional, not multi (default) (mandatory)
    // only optional (?), 0 or 1
    // only multi-valued (+), 1 or more
    // both optional and multi-valued (*) 0 or more

    if (attribute.isPrimaryKey) {
      return <u>{attribute.text}</u>;
    } 

    if (attribute.isOptional && attribute.isMultiValued) {
      if (!name.endsWith("\u2217")) {
        return <div>{attribute.text + "\u2217"}</div>;
      }
    }

    if (attribute.isOptional) {
      // Manually add a question mark (for optional attr) if it doesn't exist
      // Maybe change such that users cannot input special chars
      if (!name.endsWith('?')) {
        return <div>{attribute.text + '?'}</div>;
      }
    }

    if (attribute.isMultiValued) {
      // Manually add a question mark (for optional attr) if it doesn't exist
      // Maybe change such that users cannot input special chars
      if (!name.endsWith('+')) {
        return <div>{attribute.text + '+'}</div>;
      }
    }

    return <div>{attribute.text}</div>;

  };

  // Define component to be rendered
  let attributeEnd = (
    <div
      id={attribute.id}
      ref={attributeEndRef}
      className="attribute-end"
      style={chosenStyle}
      onDoubleClick={() => {
        setEditable(true);
      }}
    >
      <AttributeContextMenu
        anchorPoint={anchorPoint}
        show={show}
        setEditable={setEditable}
        toggleKeyAttribute={toggleKeyAttribute}
        toggleOptionalAttribute={toggleOptionalAttribute}
        toggleMultiValuedAttribute={toggleMultiValuedAttribute}
      />
      <div style={textStyle}>{editingMode()}</div>
    </div>
  );

  return (
    <div>
      {attributeEnd}
    </div>
  );;
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
    parent: { id: parentId, type: types.ENTITY },
    id: attributeId,
    text: text,
    relativePos: relativePos,
    type: types.ATTRIBUTE,
  };

  addElement(types.ATTRIBUTE, attributeEntry);
}
