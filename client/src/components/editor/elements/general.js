import { useCallback, useEffect, useRef, useState } from "react";
import { useXarrow } from "react-xarrows";
import Draggable from "react-draggable";

import { actions, types } from "../types";
import "./relationships/relationship.css";
import "./attributes/attribute.css";
import "./entities/entity.css";
import "./generalisations/generalisation.css";
import "./general.css";
import { Attribute } from "./attributes/attribute";
import { RelationshipEdge } from "./relationshipEdges/relationshipEdge";
import { HierarchyEdge } from "./hierarchyEdges/hierarchyEdge";

function NodeView({ node }) {
  return (
    <div className="content view">
      {node.display ? node.display(node) : node.text}
    </div>
  );
}

const selectNode = ({ type, id, parent }, ctx, setContext) => {
  switch (ctx.action) {
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
    default:
  }
};

const nodeSelected = (id, ctx) => {
  return (
    (ctx.selected?.id && id === ctx.selected.id) ||
    (ctx.target?.id && id === ctx.target.id)
  );
};

function NodeInEdit({ node, saveChanges, exitEdit }) {
  const [text, setText] = useState(node.text);
	const inputRef = useRef(null);

	const saveAndExit = () => {
    if (node.text !== text) {
      saveChanges((node) => {
        node.text = text;
      });
    }
    exitEdit();
  };

	const handleClickOut = (e) => {
		if (inputRef.current && !inputRef.current.contains(e.target)) saveAndExit();
	}

	useEffect(() => {
		inputRef.current.focus();
	}, [])

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOut);
		return () => {
			document.removeEventListener("mousedown", handleClickOut);
		}
	}, [text]);

  return (
    <div className="content edit">
      <input
				ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            saveAndExit();
          }
        }}
      />
    </div>
  );
}

/** Node operations */
export const saveChanges = (node, functions, change) => {
  let newNode = functions.getElement(node.type, node.id, node.parent);
  change(newNode);
  functions.updateElement(newNode.type, newNode);
};

export function Node({ className, node, ctx, ctxMenuActions, functions }) {
  // posCache tracks position of node while being dragged
  const [posCache, setPosCache] = useState(null);
  const [editing, setEditing] = useState(false);

  /** Initialisations and event handlers */
  // TODO: check why?
  // Reference to self allows info about self to be propagated
  const nodeRef = useRef(null);
  // To set bounds of draggable
  const [dimensions, setDimensions] = useState({});
  // Hides the context menu if we left click again
  const handleClick = useCallback(() => {
    functions.setContextMenu(null); //TODO: check
  }, [functions]);
  // Context menu
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    functions.setContextMenu({
      // Set position of context menu
      anchor: { x: event.pageX, y: event.pageY },
      // Set actions available in context menu
      actions: { "Edit Label": () => setEditing(true), ...ctxMenuActions },
    });
		selectNode(node, ctx.context, functions.setContext);
  }, []);
  // Set dimensions and event listeners on mount
  useEffect(() => {
    const curNode = nodeRef.current;
    setDimensions({
      width: curNode.clientWidth,
      height: curNode.clientHeight,
    });
    document?.addEventListener("click", handleClick);
    curNode?.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document?.removeEventListener("click", handleClick);
      curNode?.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleContextMenu, handleClick]);

  // Disables editing-mode if right tool bar is editing name as well
  useEffect(() => {
    if (ctx.context.disableNodeNameEditing === true) {
      setEditing(false);
    }
  }, [ctx.context.disableNodeNameEditing]);

  /** Dragging configurations */
  // Hook for rendering edges:
  const updateXarrow = useXarrow();
  const draggableConfig = {
    position: node.pos,
    scale: ctx.scale,
    onMouseDown: () => functions.setPanDisabled(true),
    onDrag: (e, data) => {
      // Store position internally
      setPosCache({ x: data.x, y: data.y });
      // Rerender edges
      updateXarrow();
    },
    onStop: (e, data) => {
      // If position of node changed, save and update
      if (data.x !== node.pos.x || data.y !== node.pos.y) {
        // Save new position of node
        const setPosition = node.updatePos
          ? node.updatePos(data)
          : (node) => {
              node.pos = { x: data.x, y: data.y };
            };
        saveChanges(node, functions, setPosition);
        // Rerender edges
        updateXarrow();
        // Re-enable panning of canvas
        functions.setPanDisabled(false);
      }
      setPosCache(null);
    },
  };

  /** Display */
  return (
    <>
      <Draggable {...draggableConfig}>
        <div
          ref={nodeRef}
          id={node.id}
          className="node-wrapper"
          onClick={() => selectNode(node, ctx.context, functions.setContext)}
        >
          <div
            className={className}
            style={{
              cursor: "grab",
              [`--${className}-color`]: `var(--${className}-${
                nodeSelected(node.id, ctx.context) ? `darken` : `norm`
              })`,
            }}
          >
            {editing ? (
              <NodeInEdit
                node={node}
                saveChanges={(change) => saveChanges(node, functions, change)}
                exitEdit={() => setEditing(false)}
              />
            ) : (
              <NodeView node={node} />
            )}
          </div>
        </div>
      </Draggable>
      {node.attributes
        ? Object.values(node.attributes).map((attribute) => {
            return (
              <Attribute
                parent={posCache || node.pos}
                attribute={attribute}
                ctx={ctx}
                functions={functions}
              />
            );
          })
        : null}
    </>
  );
}

export default function Edge({ edge, scale }) {
  switch (edge.type) {
    case types.EDGE.RELATIONSHIP:
      return <RelationshipEdge {...edge} scale={scale} />;
    case types.EDGE.HIERARCHY:
      return <HierarchyEdge {...edge} scale={scale} />;
    default:
      console.log("Invalid edge type encountered: " + edge.type);
      return null;
  }
}
