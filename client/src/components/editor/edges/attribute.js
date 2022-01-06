import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import "./stylesheets/attribute.css";
import { types } from "../types";
import { getId } from "../idGenerator";

export default function Attribute({
  attribute,
  updateElement, // Generic update function for dict in editor.js
  getElement, // Generic getter for dict in editor.js
  setContextMenu,
}) {
  const [name, setName] = useState(attribute.text);
  const [editable, setEditable] = useState(false);

  // Ref of lollipop end
  const attributeEndRef = useRef(null);

  const updateAttribute = useCallback(
    () => (change) => {
      let attr = getElement(types.ATTRIBUTE, attribute.id, attribute.parent);
      change(attr);
      updateElement(types.ATTRIBUTE, attr);
    },
    [attribute, getElement, updateElement]
  );

  const contextMenuActions = useMemo(() => {
    // Toggles key attribute feature
    const toggleKeyAttribute = () =>
      updateAttribute((attr) => {
        attr.isPrimaryKey = !attr.isPrimaryKey;
        if (attr.isPrimaryKey) {
          // Key attributes are mandatory and unique
          attr.isOptional = false;
          attr.isMultiValued = false;
        }
      });

    // Toggles optional attribute feature
    const toggleOptionalAttribute = () =>
      updateAttribute((attr) => {
        attr.isOptional = !attr.isOptional;
        attr.isPrimaryKey = false;
      });

    // Toggles multi-valued attribute feature
    const toggleMultiValuedAttribute = () =>
      updateAttribute((attr) => {
        attr.isMultiValued = !attr.isMultiValued;
        attr.isPrimaryKey = false;
      });
    return {
      "Edit Label": () => setEditable(true),
      "Toggle Key Attribute": toggleKeyAttribute,
      "Toggle Optional Attribute": toggleOptionalAttribute,
      "Toggle Multi-valued Attribute": toggleMultiValuedAttribute,
    };
  }, [updateAttribute]);

  // Hides the context menu if we left click again
  const handleClick = useCallback(() => {
    setContextMenu(null); //TODO: check
  }, [setContextMenu]);

  // Show context menu
  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setContextMenu({
        actions: contextMenuActions,
        anchor: { x: event.pageX, y: event.pageY },
      });
    },
    [setContextMenu, contextMenuActions]
  );

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
  }, [handleClick, handleContextMenu]);

  // Calculate position of entity end
  const calculateEntityEndPos = () => {
    let parentNode = getElement(attribute.parent.type, attribute.parent.id);
    return {
      x: parentNode.pos.x + attribute.relativePos.x,
      y: parentNode.pos.y + attribute.relativePos.y,
    };
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
                let newNode = { ...attribute };
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
      if (!name.endsWith("?")) {
        return <div>{attribute.text + "?"}</div>;
      }
    }

    if (attribute.isMultiValued) {
      // Manually add a question mark (for optional attr) if it doesn't exist
      // Maybe change such that users cannot input special chars
      if (!name.endsWith("+")) {
        return <div>{attribute.text + "+"}</div>;
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
    >
      <div style={textStyle}>{editingMode()}</div>
    </div>
  );

  return <div>{attributeEnd}</div>;
}

export function addAttributeToNode({
  addElement, // Generic add node function from editor.js
  getElement, // Generic get node function from editor.js
  parentId, // Id of parent node
  parentType,
}) {
  // Assume only entities have attributes for now TODO: change to include other node types
  const parentNode = getElement(parentType, parentId);
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
  const attributeId = getId(types.ATTRIBUTE, parentId);

  const attributeEntry = {
    parent: { id: parentId, type: parentType },
    id: attributeId,
    text: "Attribute",
    relativePos: relativePos,
    isPrimaryKey: false,
    isMultiValued: false,
    isOptional: false,
    type: types.ATTRIBUTE,
  };

  addElement(types.ATTRIBUTE, attributeEntry);
}
