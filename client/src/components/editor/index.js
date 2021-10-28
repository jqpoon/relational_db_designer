import { useState, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Entity from "./nodes/entity";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";

import Attribute from "./edges/attribute";
import Relationship from "./nodes/relationship";
import "./right_toolbar/toolbar-right.css";
import { DummyEdge, DummyEntity, DummyRelationship } from "./nodes/dummy_nodes";
import Xarrow, { Xwrapper } from "react-xarrows";
import Normal from "./right_toolbar/normal";
import SelectEntity from "./right_toolbar/selectEntity";
import SelectRelationship from "./right_toolbar/selectRelationship";
import EdgeToRelationship from "./right_toolbar/edgeRelationship";
import SelectEdge from "./right_toolbar/selectEdge";

const sampleDEntities = [
	{ idx: 0, pos: { x: 350, y: 250 }, id: "E0", type: "ent" },
	{ idx: 1, pos: { x: 550, y: 250 }, id: "E1", type: "ent" },
];
const sampleDRelationships = [
	{ idx: 0, pos: { x: 350, y: 100 }, id: "R0", type: "rel" },
];
const sampleEdges = [
	{ start: "E0", end: "R0", labels: "Hello" },
	// { start: "E0", end: "E0", labels: "World" },
];

export const actions = {
	NORMAL: "normal",
	SELECT: "select",
	RELATIONSHIP_ADD_SOURCE: "relationship_add_source",
	RELATIONSHIP_ADD_TARGET: "relationship_add_target",
	RELATIONSHIP_ADD_CARDINALITY: "relationship_add_cardinality",
};

function Editor() {
	// Passed to children for metadata (eg width and height of main container)
	const parentRef = useRef(null);

	const [attributes, setAttributes] = useState([]);
	const [entities, setEntities] = useState([]);
	const [relationships, setRelationships] = useState([]);
	const [focusEntity, setFocusEntity] = useState(null);
	const [focusRs, setFocusRs] = useState(null);

	const [dEntities, setDEntities] = useState(sampleDEntities);
	const [dRelationships, setDRelationships] = useState(sampleDRelationships);
	const [edges, setEdges] = useState(sampleEdges);
	const [action, setAction] = useState(actions.NORMAL);
	const [context, setContext] = useState(null);
	const [pendingChanges, setPendingChanges] = useState({ edges: [] });

	// Zoom and pan states
	const [panDisabled, setPanDisabled] = useState(false);
	const [scale, setScale] = useState(1);

	// Add attribute
	const addAttribute = () => {
		const newAttribute = {
			pos: {
				x: 50,
				y: 250,
			},
			text: "",
		};
		setAttributes([...attributes, newAttribute]);
	};

	// Update position of attribute
	const updateAttributePos = (data, index) => {
		let newAttributes = [...attributes];
		newAttributes[index].pos = { x: data.x, y: data.y };
		setAttributes(newAttributes);
	};

	// Update position of entity
	const updateEntityPos = (data, index) => {
		let newEntities = [...entities];
		newEntities[index].pos = { x: data.x, y: data.y };
		setEntities(newEntities);
	};

	// Update position of relationship
	const updateRelationshipPos = (data, index) => {
		let newRelationships = [...relationships];
		newRelationships[index].pos = { x: data.x, y: data.y };
		setRelationships(newRelationships);
	};

	// Update text in entity
	const updateText = (text, index) => {
		let newEntities = [...entities];
		newEntities[index].text = text;
		setEntities(newEntities);
		setFocusEntity(null);
		setPanDisabled(false);
	};
	// Normal mode
	const resetToNormal = () => {
		setAction(actions.NORMAL);
		setContext(null);
		setPendingChanges({ edges: [] });
	};

	// Relationship Adding Mode
	const enterAddRelationship = () => {
		setAction(actions.RELATIONSHIP_ADD_TARGET);
		setContext({ sources: [], targets: [] });
	};
	const changeCardinality = (card) => {
		const newContext = {
			sources: context.sources,
			targets: context.targets,
			cardinality: card,
		};
		setContext(newContext);
		if (newContext.targets?.length !== 0) {
			const t = newContext.targets[0];
			const newPendingEdges = newContext.sources.map((s) => ({
				start: s.id,
				end: t.id,
				labels: newContext.cardinality,
			}));
			console.log("Adding new temp edges");
			console.log(newPendingEdges);
			let newPendingChanges = { ...pendingChanges };
			newPendingChanges.edges = newPendingEdges;
			setPendingChanges(newPendingChanges);
		}
	};

	// All (what happens on click)
	const modifyContext = (idx, type) => {
		const getElement = () => {
			switch (type) {
				case "rel":
					return dRelationships[idx];
				case "ent":
					return dEntities[idx];
				case "edge":
					return edges[idx];
				default:
					return null;
			}
		};
		const element = getElement();
		let newContext = { ...context };
		switch (action) {
			case actions.NORMAL:
				setAction(actions.SELECT);
			case actions.SELECT:
				newContext = { selected: element };
				break;
			case actions.RELATIONSHIP_ADD_SOURCE:
				newContext = {
					sources: [element],
					targets: context.targets,
					cardinality: context.cardinality,
				};
				break;
			case actions.RELATIONSHIP_ADD_TARGET:
				newContext = {
					sources: context.sources,
					targets: [element],
					cardinality: context.cardinality,
				};
				break;
			default:
		}
		console.log("Loading new context:");
		console.log(newContext);
		setContext(newContext);
		if (
			(action === actions.RELATIONSHIP_ADD_SOURCE ||
				action === actions.RELATIONSHIP_ADD_TARGET) &&
			newContext.targets.length > 0
		) {
			const t = newContext.targets[0];
			const newPendingEdges = newContext.sources.map((s) => ({
				start: s.id,
				end: t.id,
				labels: newContext.cardinality,
			}));
			console.log("Adding new temp edges");
			console.log(newPendingEdges);
			let newPendingChanges = { ...pendingChanges };
			newPendingChanges.edges = newPendingEdges;
			setPendingChanges(newPendingChanges);
		}
	};

	const addEdge = () => {
		setEdges([
			...edges,
			{
				start: context.sources[0].id,
				end: context.targets[0].id,
				labels: { middle: context.cardinality },
			},
		]);
		resetToNormal();
	};

	const addEdgeToRelationship = (source) => {
		setContext({ sources: [source] });
		setAction(actions.RELATIONSHIP_ADD_TARGET);
	};

	const showRightToolbar = () => {
		switch (action) {
			case actions.NORMAL:
				return <Normal />;
			case actions.SELECT:
				return context.selected.type === "rel" ? (
					<SelectRelationship relationship={context.selected} />
				) : context.selected.type === "ent" ? (
					<SelectEntity
						entity={context.selected}
						edgeToRelationship={addEdgeToRelationship}
					/>
				) : (
					<SelectEdge edge={context.selected} />
				);
			case actions.RELATIONSHIP_ADD_SOURCE:
			case actions.RELATIONSHIP_ADD_TARGET:
			case actions.RELATIONSHIP_ADD_CARDINALITY:
				return (
					<EdgeToRelationship
						action={action}
						setAction={setAction}
						context={context}
						changeCardinality={changeCardinality}
						addEdge={addEdge}
						cancel={resetToNormal}
					/>
				);
			default:
				return null;
		}
	};

	const showPendingChanges = () => {
		return (
			<div>
				{pendingChanges.edges.map((edge) => (
					<Xarrow {...edge} color="red" />
				))}
			</div>
		);
	};

	const panProps = { disabled: panDisabled, excluded: ["input", "button"] };

	return (
		<div className="editor">
			<Xwrapper>
				<Toolbar
					entities={entities}
					setEntities={setEntities}
					relationships={relationships}
					setRelationships={setRelationships}
					addRelationship={enterAddRelationship}
					addAttribute={addAttribute}
				/>
				<TransformWrapper
					panning={panProps}
					onZoomStop={(ref) => setScale(ref.state.scale)}
					doubleClick={{ disabled: true }}
				>
					<TransformComponent>
						<div
							className="dnd"
							onClick={() => {
								setFocusEntity(null);
								setFocusRs(null);
								setPanDisabled(false);
							}}
							ref={parentRef}
						>
							{entities.map((e, index) => (
								<Entity
									key={index}
									index={index}
									{...e}
									updatePos={updateEntityPos}
									setFocus={setFocusEntity}
									focus={focusEntity}
									updateText={updateText}
									parentRef={parentRef}
									setPanDisabled={setPanDisabled}
								/>
							))}

							{relationships.map((e, index) => (
								<Relationship
									key={index}
									index={index}
									{...e}
									updatePos={updateRelationshipPos}
									setFocus={setFocusRs}
									relationships={relationships}
									setRelationships={setRelationships}
								/>
							))}

							{attributes.map((e, index) => (
								<Attribute
									key={index}
									index={index}
									{...e}
									updatePos={updateAttributePos}
								/>
							))}

							{dEntities.map((ent) => (
								<DummyEntity
									{...ent}
									modifyContext={modifyContext}
								/>
							))}
							{dRelationships.map((rel) => (
								<DummyRelationship
									{...rel}
									modifyContext={modifyContext}
								/>
							))}
						</div>{" "}
					</TransformComponent>
				</TransformWrapper>
				{edges.map((edge, idx) => (
					<DummyEdge
						edge={edge}
						idx={idx}
						modifyContext={modifyContext}
					/>
				))}
				{showPendingChanges()}
				{/* {focusEntity !== null ? (
					<Entity
						index={focusEntity}
						{...entities[focusEntity]}
						editable
						updateText={updateText}
					/>
				) : null} */}

				{focusRs !== null ? (
					<Relationship
						index={focusRs}
						{...relationships[focusRs]}
						editable
						setFocus={setFocusRs}
						relationships={relationships}
						setRelationships={setRelationships}
					/>
				) : null}
				{showRightToolbar()}
			</Xwrapper>
		</div>
	);
}

export default Editor;
