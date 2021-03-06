/*
	TABLE OF CONTENTS

	1. Imports
	2. Display function for different node types
	3. React compoent for general node
		3.1 States and ref
		3.2 Side effect hooks
		3.3 Utilities
		3.4 Dragging configuration
		3.5 JSX
	4. General display function for edge
*/

// **********
// 1. Imports
// **********

import { useCallback, useEffect, useRef, useState } from "react";
import { useXarrow } from "react-xarrows";
import Draggable from "react-draggable";
import { actions, types } from "../types";
import { Attribute } from "./attributes/attribute";
import { RelationshipEdge } from "./relationshipEdges/relationshipEdge";
import { HierarchyEdge } from "./hierarchyEdges/hierarchyEdge";
import "./relationships/relationship.css";
import "./attributes/attribute.css";
import "./entities/entity.css";
import "./generalisations/generalisation.css";
import "./general.css";

// ********************************************
// 2. Display function for different node types
// ********************************************

const NodeView = ({ node }) => {
	return <div className="content view">{node.display ? node.display(node) : node.text}</div>;
};

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
	return (ctx.selected?.id && id === ctx.selected.id) || (ctx.target?.id && id === ctx.target.id);
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

	// Detect clicks outside of input box
	const handleClickOut = (e) => {
		if (inputRef.current && !inputRef.current.contains(e.target)) saveAndExit();
	};

	// Focus input on mount
	useEffect(() => {
		inputRef.current.focus();
	}, []);

	// Add / remove event listener for input box
	useEffect(() => {
		document.addEventListener("mousedown", handleClickOut);
		return () => {
			document.removeEventListener("mousedown", handleClickOut);
		};
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

// **********************************
// 3. React compoent for general node
// **********************************

export function Node({ className, node, ctx, ctxMenuActions, functions }) {
	// ******************
	// 3.1 States and ref
	// ******************

	const nodeRef = useRef(null);
	// posCache tracks position of node while being dragged
	const [posCache, setPosCache] = useState(null);
	const [editing, setEditing] = useState(false);

	// *********************
	// 3.2 Side effect hooks
	// *********************

	// Hides the context menu if we left click again
	const handleClick = useCallback(() => {
		functions.setContextMenu(null);
	}, [functions]);

	// Context menu
	const handleContextMenu = useCallback(
		(event) => {
			event.preventDefault();
			functions.setContextMenu({
				// Set position of context menu
				anchor: { x: event.pageX, y: event.pageY },
				// Set actions available in context menu
				actions: {
					"Edit Label": () => setEditing(true),
					...ctxMenuActions,
					Delete: () => functions.deleteElement(node.type, node),
				},
			});
			selectNode(node, ctx.context, functions.setContext);
		},
		[ctx, ctxMenuActions, functions, node]
	);

	// Set dimensions and event listeners on mount
	useEffect(() => {
		document?.addEventListener("click", handleClick);
		const curNode = nodeRef.current;
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

	// *************
	// 3.3 Utilities
	// *************

	// Hook for rendering edges:
	const updateXarrow = useXarrow();
	const saveChanges = (change) => functions.saveChanges(node, change);

	// **************************
	// 3.4 Dragging configuration
	// **************************

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
				saveChanges(setPosition);
				// Rerender edges
				updateXarrow();
				// Re-enable panning of canvas
				functions.setPanDisabled(false);
			}
			setPosCache(null);
		},
	};

	// *******
	// 3.5 JSX
	// *******

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
								saveChanges={saveChanges}
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
								parent={{ type: node.type, pos: posCache || node.pos }}
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

// ************************************
// 4. General display function for edge
// ************************************

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
