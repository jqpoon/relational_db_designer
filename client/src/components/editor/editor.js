import { useState, useRef, useEffect } from "react";
import {
	initialEntities,
	initialRelationships,
	initialEdges,
	initialAttributes,
} from "./initial";
import { actions, types } from "./types";
import Edge from "./edges/edge";
import { Xwrapper } from "react-xarrows";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Toolbar from "./toolbar";
import Attribute from "./edges/attribute";
import "./stylesheets/editor.css";
import { TestEntity, TestRelationship } from "./nodes/node";

import SelectEntity from "./right_toolbar/selectEntity";
import SelectRelationship from "./right_toolbar/selectRelationship";
import Normal from "./right_toolbar/normal";
import SelectEdge from "./right_toolbar/selectEdge";
import { ContextMenu } from "./contextMenu";
import EdgeToRelationship from "./right_toolbar/edgeRelationship";

// TODO: update left,right toolbar to match new data structures
// TODO: add initial attributes to initial.js + implement position update based on parent node of the attribute
// TODO: migrate remaining functions from index.js
// TODO: implement node editing by merging into actions + context
// TODO: extract common base node in node.js
// TODO: figure out where parentref should go and update render appropriately

const STACK_LIMIT = 25;

export default function Editor() {
	// Canvas states: passed to children for metadata (eg width and height of main container)
	const parentRef = useRef(null);
	const [counter, setCounter] = useState(1);
	const [render, setRender] = useState(false);
	const [scale, setScale] = useState(1);
	const [panDisabled, setPanDisabled] = useState(false);
	const [editableId, setEditableId] = useState(0);

	// List of components that will be rendered
	const [entities, setEntities] = useState(initialEntities);
	const [relationships, setRelationships] = useState(initialRelationships);
	const [attributes, setAttributes] = useState(initialAttributes);
	const [edges, setEdges] = useState(initialEdges);
	const [undoStack, setUndoStack] = useState([]);
	const [redoStack, setRedoStack] = useState([]);

	const [context, setContext] = useState({ action: actions.NORMAL });

	const [, setRerender] = useState(false);
	const forceRerender = () => setRerender((rerender) => !rerender);

	useEffect(() => {
		setRender(true);
	}, []);

	const nodeStates = {
		[types.ENTITY]: entities,
		[types.RELATIONSHIP]: relationships,
		[types.ATTRIBUTE]: attributes,
		[types.EDGE.RELATIONSHIP]: edges,
		[types.EDGE.HIERARCHY]: edges,
	};

	const nodeSetters = {
		[types.ENTITY]: setEntities,
		[types.RELATIONSHIP]: setRelationships,
		[types.ATTRIBUTE]: setAttributes,
		[types.EDGE.RELATIONSHIP]: setEdges,
		[types.EDGE.HIERARCHY]: setEdges,
	};

	const getId = () => {
		const id = counter;
		setCounter(counter + 1);
		return id;
	};

	// Utility for adding to undo and redo
	const addToHistory = (action, type, id, isUndo) => {
		// Toggle between undo and redo
		let state = isUndo ? undoStack : redoStack;
		let setter = isUndo ? setUndoStack : setRedoStack;

		// Build func object (Note that element should be passed in as a copy)
		let func = {
			action,
			type,
			id,
			element: { ...nodeStates[type][id] },
		};

		// Update state within limit
		let stateClone = [...state, func];
		if (stateClone.length > STACK_LIMIT) {
			stateClone.shift();
		}
		setter(stateClone);
	};
	const addToUndo = (action, type, id) =>
		addToHistory(action, type, id, true);
	const addToRedo = (action, type, id) =>
		addToHistory(action, type, id, false);

	// Utility for executing undo and redo
	const execHistory = (isUndo) => {
		// Toggle between undo and redo
		let state = isUndo ? undoStack : redoStack;
		let setter = isUndo ? setUndoStack : setRedoStack;
		let addFunc = isUndo ? addToRedo : addToUndo;

		// Nothing to do
		if (state.length === 0) return;

		// Grab top of stack
		let stateClone = [...state];
		let top = stateClone.pop();

		// Add to undo/redo stack current state
		addFunc(nodeFunctionsOpposite[top["action"]], top["type"], top["id"]);

		// Run and update state
		let element =
			top["element"] && Object.keys(top["element"]).length > 0
				? top["element"]
				: { ...nodeStates[top["type"]][top["id"]] };
		nodeFunctions[top["action"]](top["type"], element, true);
		setter(stateClone);
	};
	const undo = () => execHistory(true);
	const redo = () => execHistory(false);

	// TODO: instead of _Node, should probably rename to _Element since it applies to edges as well
	// Generic update, add and delete functions for elements
	// Element should be the (whole) updated element
	const updateNode = (type, element, isHistory) => {
		if (!isHistory) {
			addToUndo(nodeFunctionsOpposite["updateNode"], type, element.id);
			setRedoStack([]);
		}
		let newNodeState = { ...nodeStates[type] };
		newNodeState[element.id] = element;
		nodeSetters[type](newNodeState);
	};

	const getNode = (type, id) => {
		return { ...nodeStates[type][id] };
	};

	const addNode = (type, element, isHistory) => {
		if (!isHistory) {
			addToUndo(nodeFunctionsOpposite["addNode"], type, element.id);
			setRedoStack([]);
		}
		// TODO: update other functions into callbacks
		nodeSetters[type]((prevState) => ({
			...prevState,
			[element.id]: element,
		}));
	};

	const deleteNode = (type, element, isUndo) => {
		let newNodeState = { ...nodeStates[type] };
		delete newNodeState[element.id];
		// TODO: recursively remove other nodes/edges connected + undo
		nodeSetters[type](newNodeState);
		setContext({ action: actions.NORMAL });
	};

	const nodeFunctions = {
		updateNode: updateNode,
		getNode: getNode,
		addNode: addNode,
		deleteNode: deleteNode,
		getId: getId,
		undo: undo,
		redo: redo,
		setEditableId: setEditableId,
	};

	const nodeFunctionsOpposite = {
		updateNode: "updateNode",
		addNode: "deleteNode",
		deleteNode: "addNode",
	};

	const generalFunctions = {
		setPanDisabled: setPanDisabled,
		setContext: setContext,
		context: context,
	};

	const leftToolBarActions = {
		addEdgeToRelationship: () => {
			setContext({
				action: actions.RELATIONSHIP_ADD.SELECT_TARGET,
				sources: {},
				target: null,
			});
		},
		addAttribute: () => {},
	};

	const rightToolBarActions = {
		cancel: () => {
			setContext({ action: actions.NORMAL });
		},
	};

	const canvasConfig = {
		panning: {
			disabled: panDisabled,
			excluded: ["input", "button"],
			velocityDisabled: true,
		},
		// TODO: check if we need scale here
		onZoomStop: (ref) => setScale(ref.state.scale),
		onZoom: forceRerender,
		onPanning: forceRerender,
		alignmentAnimation: { animationTime: 0 },
		onAlignBound: forceRerender,
		doubleClick: { disabled: true },
	};

	const nodeConfig = {
		parentRef: parentRef,
		scale: scale, // TODO
	};

	// TODO
	const showPendingChanges = () => {};
	const showRightToolbar = () => {
		switch (context.action) {
			case actions.NORMAL:
				return <Normal />;
			case actions.SELECT.NORMAL:
			case actions.SELECT.ADD_RELATIONSHIP:
			case actions.SELECT.ADD_SUPERSET:
			case actions.SELECT.ADD_SUBSET:
				switch (context.selected.type) {
					case types.ENTITY:
						return (
							<SelectEntity
								entity={entities[context.selected.id]}
								{...nodeFunctions}
								{...generalFunctions}
							/>
						);
					case types.RELATIONSHIP:
						return (
							<SelectRelationship
								relationship={
									relationships[context.selected.id]
								}
								{...nodeFunctions}
								{...generalFunctions}
							/>
						);
					case types.EDGE.RELATIONSHIP:
					case types.EDGE.HIERARCHY:
						return <SelectEdge edge={edges[context.selected.id]} />;
					default:
						return <Normal />; // TODO: type not found page
				}
			case actions.RELATIONSHIP_ADD.SELECT_SOURCES:
			case actions.RELATIONSHIP_ADD.SELECT_TARGET:
				return (
					<EdgeToRelationship
						{...nodeFunctions}
						{...rightToolBarActions}
						{...generalFunctions}
					/>
				);
			default:
				// TODO
				return <Normal />;
		}
	};

	return (
		<Xwrapper>
			<div className="editor" ref={parentRef}>
				{render ? (
					<>
						<Toolbar {...nodeFunctions} {...leftToolBarActions} />
						<TransformWrapper {...canvasConfig}>
							<TransformComponent>
								<div
									className="canvas" // TODO: previously "dnd"
									// ref={parentRef}
									onClick={() => setPanDisabled(false)}
								>
									{Object.values(entities).map((entity) => (
										<TestEntity
											key={entity.id}
											{...entity}
											{...nodeConfig}
											{...nodeFunctions}
											{...generalFunctions}
										/>
									))}
									{Object.values(relationships).map(
										(relationship) => (
											<TestRelationship
												key={relationship.id}
												{...relationship}
												{...nodeConfig}
												{...nodeFunctions}
												{...generalFunctions}
											/>
										)
									)}
									{Object.values(attributes).map(
										(attribute) => (
											<Attribute
												key={attribute.id}
												{...attribute}
												{...nodeFunctions}
											/>
										)
									)}
								</div>
							</TransformComponent>
						</TransformWrapper>
						{Object.values(edges).map((edge) => (
							<Edge edge={edge} />
						))}
						{showPendingChanges()}
						{showRightToolbar()}
					</>
				) : null}
			</div>
		</Xwrapper>
	);
}
