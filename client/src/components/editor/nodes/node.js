import { useCallback, useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { useXarrow } from "react-xarrows";
import Attribute, { addAttributeToNode } from "../edges/attribute";
import { actions, types } from "../types";
import { EntityContextMenu } from "../contextMenus/entityContextMenu";
import "./stylesheets/node.css";
import { HierarchyEdge } from "../edges/edge";

export function TestRelationship({ relationship, general }) {
  const attributes = Object.values(relationship.attributes).map((attribute) => {
    return <Attribute attribute={attribute} {...general} />;
  });
  return (
    <Node
      {...relationship}
      {...general}
      children={attributes}
      className="relationship"
    />
  );
}

export function TestEntity({ entity, general }) {
  const attributes = Object.values(entity.attributes).map((attribute) => {
    return <Attribute attribute={attribute} {...general} />;
  });
  const generalisations = Object.values(entity.generalisations).map(
    (generalisation) => {
      return (
        <>
          <Generalisation {...generalisation} {...general} />
        </>
      );
    }
  );
  const children = (
    <>
      {attributes}
      {generalisations}
    </>
  );
  return (
    <Node
      {...entity}
      {...general}
      children={children}
      className={entity.isWeak.length === 0 ? "entity" : "weak-entity"}
    />
  );
}

export function Generalisation(props) {
  return <Node {...props} className="generalisation" />;
}

// General draggable, editable node
export default function Node({
  id,
  type,
  text,
  pos,
  parentRef,
  scale,
  getElement,
  addElement,
  updateElement,
  setPanDisabled,
  context,
  setContext,
  setContextMenu,
  children,
  parent,
  className,
}) {
  // Reference to self allows info about self to be propagated
  const nodeRef = useRef(null);
  // Name of node which will be displayed
  const [name, setName] = useState(text);

  // To set bounds of draggable
  const [dimensions, setDimensions] = useState({});

  const [editable, setEditable] = useState(false);

  const contextMenuActions = {
    "Edit Label": () => setEditable(true),
  };

  switch (type) {
    case types.ENTITY:
    case types.RELATIONSHIP:
      contextMenuActions["Add Attribute"] = () =>
        addAttributeToNode({
          addElement: addElement,
          getElement: getElement,
          parentId: id,
          parentType: type,
        });
      break;
    default:
  }

  // Hides the context menu if we left click again
  const handleClick = useCallback(() => {
    setContextMenu(null); //TODO: check
  }, [setContextMenu]);

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setContextMenu({
        actions: contextMenuActions,
        anchor: { x: event.pageX, y: event.pageY },
      });
    },
    [setContextMenu]
  );

  // Set dimensions on mount
  useEffect(() => {
    const curNode = nodeRef.current;
    setDimensions({
      width: curNode.clientWidth,
      height: curNode.clientHeight,
    });
    // Right click
    document?.addEventListener("click", handleClick);
    curNode?.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document?.removeEventListener("click", handleClick);
      curNode?.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // For updating edges connected to the node
  const updateXarrow = useXarrow();

  // Event handlers
  const onDrag = updateXarrow;
  const onStop = (e, data) => {
    // Save new position of node
    let newNode = getElement(type, id, parent);
    newNode.pos = { x: data.x, y: data.y };
    updateElement(type, newNode);
    // Update arrow position
    updateXarrow(e); // TODO: check function signature of updateXarrow(E, DATA) ?
    // Re-enable panning of canvas
    setPanDisabled(false);
  };
  const onClick = () => {
    switch (context.action) {
      case actions.NORMAL:
      case actions.SELECT.NORMAL:
        setContext({
          action: actions.SELECT.NORMAL,
          selected: { type: type, id: id, parent: parent },
        });
        break;
      case actions.SELECT.ADD_RELATIONSHIP:
        setContext((prev) => {
          let newCtx = { ...prev };
          newCtx.target = {
            type: type,
            id: id,
            parent: parent,
            cardinality: "",
          };
          return newCtx;
        });
        break;
      case actions.SELECT.ADD_SUPERSET:
      case actions.SELECT.ADD_SUBSET:
        setContext((prev) => {
          let newCtx = { ...prev };
          newCtx.target = { type: type, id: id, parent: parent };
          return newCtx;
        });
        break;
      case actions.RELATIONSHIP_ADD.SELECT_SOURCES: {
        let newContext = { ...context };
        newContext.sources[id] = { type: type, cardinality: "" };
        setContext(newContext);
        console.log(newContext);
        break;
      }
      case actions.RELATIONSHIP_ADD.SELECT_TARGET: {
        let newContext = { ...context };
        newContext.target = { id: id, type: type };
        setContext(newContext);
        break;
      }
      default:
    }
  };

  // Configurations for rendered elements
  const draggableConfig = {
    position: pos,
    scale: scale,
    bounds: {
      // Uncomment below to limit nodes to only be dragged within the canvas
      // left: 5,
      // top: 5,
      // right: parentRef.current.clientWidth - dimensions.width - 5,
      // bottom: parentRef.current.clientHeight - dimensions.height - 5,
    },
    onDrag: onDrag,
    onStop: onStop,
    onMouseDown: () => setPanDisabled(true),
  };

  const contentsConfig = {
    id: id,
    ref: nodeRef,
    className: "node-wrapper",
    onClick: onClick,
  };

  // Contents displayed in node
  const editingMode = () => {
    return (
      <div className={className + "-input"}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              // Update node text
              let newNode = getElement(type, id, parent);
              newNode.text = name;
              updateElement(type, newNode);
              setEditable(false);
            }
          }}
        />
      </div>
    );
  };

  const highlightStyle = (className) => {
    if (
      context.action === actions.SELECT.NORMAL &&
      id === context.selected.id
    ) {
      return className === "weak-entity" ? { borderColor: "orange"} : { border: "2px solid orange" };
    } else if (
      context.action === actions.SELECT.ADD_RELATIONSHIP &&
      id === context.selected.id
    ) {
      return className === "weak-entity" ? { borderColor: "orange"} : { border: "2px solid orange" };
    } else if (
      context.action === actions.SELECT.ADD_RELATIONSHIP &&
      context.target !== null &&
      id === context.target.id
    ) {
      return className === "weak-entity" ? { borderColor: "orange"} : { border: "2px solid orange" };
    } else if (
      (context.action === actions.RELATIONSHIP_ADD.SELECT_SOURCES ||
        context.action === actions.RELATIONSHIP_ADD.SELECT_TARGET) &&
      context.sources != null &&
      idIsInSelectedRelationship(Object.keys(context.sources))
    ) {
      return className === "weak-entity" ? { borderColor: "orange"} : { border: "2px solid orange" };
    } else if (
      (context.action === actions.RELATIONSHIP_ADD.SELECT_SOURCES ||
        context.action === actions.RELATIONSHIP_ADD.SELECT_TARGET) &&
      context.target != null &&
      id === context.target.id
    ) {
      return className === "weak-entity" ? { borderColor: "orange"} : { border: "2px solid orange" };
    } else {
      return null;
    }
  };

  const idIsInSelectedRelationship = (sources) => {
    for (const x of sources) {
      if (x === id) {
        return true;
      }
    }
    return false;
  };

  const normalMode = (
    <div className={className} style={highlightStyle(className)}>
      {editable ? (
        editingMode()
      ) : (
        <div className={className + "-label"}>{text}</div>
      )}
    </div>
  );
  // TODO:conditional rendering

  return (
    <>
      <Draggable
        style={{ width: "150px", height: "75px" }}
        {...draggableConfig}
      >
        <div {...contentsConfig}>{normalMode}</div>
      </Draggable>
      {children}
    </>
  );
}
