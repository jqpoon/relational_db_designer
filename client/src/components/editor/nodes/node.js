import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { useXarrow } from "react-xarrows";
import { types } from "..";
import { ContextMenu } from "../contextMenu";
import { actions } from "../types";
import "./stylesheets/node.css";

export function TestRelationship(props) {
  return <Node {...props} />;
}

export function TestEntity(props) {
  return <Node {...props} />;
}

const classFromNodeType = {
  [types.ENTITY]: "entity",
  [types.RELATIONSHIP]: "relationship",
};

// General draggable, editable node
export default function Node({
  id,
  type,
  text,
  pos,
  parentRef,
  scale,
  updateNode,
  getNode,
  setPanDisabled,
  context,
  setContext,
}) {
  // Reference to self allows info about self to be propagated
  const nodeRef = useRef(null);
  // Name of node which will be displayed
  const [name, setName] = useState(text);
  // ?
  // To set bounds of draggable
  const [dimensions, setDimensions] = useState({});

  // Set dimensions on mount
  useEffect(() => {
    const curNode = nodeRef.current;
    setDimensions({
      width: curNode.clientWidth,
      height: curNode.clientHeight,
    });
    // TODO: add right click event handlers
    // const handler = (e) => {
    //   e.preventDefault();
    // };
    // // Right click
    // entityCurr?.addEventListener("contextmenu", handler);
    // return () => {
    //   entityCurr?.removeEventListener("contextmenu", handler);
    // };
  }, []);

  // For updating edges connected to the node
  const updateXarrow = useXarrow();

  // Event handlers
  const onDrag = updateXarrow;
  const onStop = (e, data) => {
    // Save new position of node
    let newNode = getNode(type, id);
    newNode.pos = { x: data.x, y: data.y };
    updateNode(type, newNode);
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
          selected: { type: type, id: id },
        });
        break;
      case actions.SELECT.ADD_RELATIONSHIP:
        setContext((prev) => {
          let newCtx = { ...prev };
          newCtx.target = { type: type, id: id, cardinality: "" };
          return newCtx;
        });
        break;
      case actions.SELECT.ADD_SUPERSET:
        setContext((prev) => {
          let newCtx = { ...prev };
          newCtx.target = { type: type, id: id };
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
    defaultPosition: pos,
    scale: scale,
    bounds: {
      // ?
      left: 5,
      top: 5,
      right: parentRef.current.clientWidth - dimensions.width - 5,
      bottom: parentRef.current.clientHeight - dimensions.height - 5,
    },
    onDrag: onDrag,
    onStop: onStop,
    onMouseDown: () => setPanDisabled(true),
  };

  const contentsConfig = {
    id: id,
    ref: nodeRef,
    className: "node-wrapper", //classFromNodeType[type],
    onClick: onClick,
  };

  // Contents displayed in node
  const editingMode = () => {
    return (
      <div className="node-content-input">
        <input
          value={text}
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              // Update node text
              let newNode = getNode(type, id);
              newNode.text = text;
              updateNode(newNode);
            }
          }}
        />
      </div>
    );
  };
  const normalMode = (
    <div className={classFromNodeType[type]}>
      <div>{text}</div>
    </div>
  );
  // TODO:conditional rendering

  return (
    <Draggable {...draggableConfig}>
      <div {...contentsConfig}>{normalMode}</div>
    </Draggable>
  );
}
