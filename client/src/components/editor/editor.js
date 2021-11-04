import { useState, useRef, useEffect } from "react";
import { initialEntities, initialRelationships, initialEdges } from "./initial";
import { actions, types } from "./types";
import Entity from "./nodes/entity";
import Relationship from "./nodes/relationship";
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

// TODO: update left,right toolbar to match new data structures
// TODO: add initial attributes to initial.js + implement position update based on parent node of the attribute
// TODO: migrate remaining functions from index.js
// TODO: implement node editing by merging into actions + context
// TODO: extract common base node in node.js
// TODO: figure out where parentref should go and update render appropriately

const UNDO_STACK_LIMIT = 25;

export default function Editor() {
	// Canvas states: passed to children for metadata (eg width and height of main container)
	const parentRef = useRef(null);
	const [counter, setCounter] = useState(0);
	const [render, setRender] = useState(false);
	const [scale, setScale] = useState(1);
	const [panDisabled, setPanDisabled] = useState(false);

	// List of components that will be rendered
	const [entities, setEntities] = useState(initialEntities);
	const [relationships, setRelationships] = useState(initialRelationships);
	const [attributes, setAttributes] = useState({}); // TODO
	const [edges, setEdges] = useState(initialEdges);
	const [stack, setStack] = useState([]);

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
		[types.EDGE]: edges,
	};

	const nodeSetters = {
		[types.ENTITY]: setEntities,
		[types.RELATIONSHIP]: setRelationships,
		[types.ATTRIBUTE]: setAttributes,
		[types.EDGE]: setEdges,
	};

	const getId = () => {
		const id = counter;
		setCounter(counter + 1);
		return id;
	};

	const addToUndo = (action, type, element) => {
		let undoFunc = {
			action,
			type,
			element,
		};
		let newStack = [...stack, undoFunc];
		if (newStack.length > UNDO_STACK_LIMIT) {
			newStack.shift();
		}
		setStack(newStack);
	};

	const undo = () => {
		let stackClone = [...stack];
		let top = stackClone.pop();
		if (!top) return;
		nodeFunctions[top["action"]](top["type"], top["element"], true);
		setStack(stackClone);
	};

	// TODO: instead of _Node, should probably rename to _Element since it applies to edges as well
	// Generic update, add and delete functions for elements
	// Element should be the (whole) updated element
	const updateNode = (type, element, isUndo) => {
		if (!isUndo) {
			addToUndo("updateNode", type, { ...nodeStates[type][element.id] });
		}
		let newNodeState = { ...nodeStates[type] };
		newNodeState[element.id] = element;
		nodeSetters[type](newNodeState);
	};

	const getNode = (type, id) => {
		return { ...nodeStates[type][id] };
	};

	const addNode = (type, element, isUndo) => {
		let newNodeState = { ...nodeStates[type], [element.id]: element };
		nodeSetters[type](newNodeState);
		// TODO UNDO BUG
		if (!isUndo) addToUndo("deleteNode", type, { ...element });
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
	};

	const generalFunctions = {
		setPanDisabled: setPanDisabled,
		setContext: setContext,
		context: context,
	};

	const leftToolBarActions = {
		addEdgeToRelationship: () => {},
		addAttribute: () => {},
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
			case actions.SELECT:
				switch (context.selected.type) {
					case types.ENTITY:
						return (
							<SelectEntity
								entity={entities[context.selected.id]}
							/>
						);
					case types.RELATIONSHIP:
						return (
							<SelectRelationship
								relationship={
									relationships[context.selected.id]
								}
							/>
						);
					case types.EDGE:
						return <SelectEdge edge={edges[context.selected.id]} />;
					default:
						return <Normal />; // TODO: type not found page
				}
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
						<ContextMenu />
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
