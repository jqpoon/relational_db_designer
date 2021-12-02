import { useState, useRef, useEffect } from "react";
import { initialEntities, initialRelationships, initialEdges } from "./initial";
import { actions, types } from "./types";
import Edge, { AttributeEdge, HierarchyEdge } from "./edges/edge";
import { Xarrow, Xwrapper } from "react-xarrows";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";
import { TestEntity, TestRelationship } from "./nodes/node";

import SelectEntity from "./right_toolbar/selectEntity";
import SelectRelationship from "./right_toolbar/selectRelationship";
import Normal from "./right_toolbar/normal";
import SelectEdge from "./right_toolbar/selectEdge";
import EdgeToRelationship from "./right_toolbar/edgeRelationship";
import SelectGeneralisation from "./right_toolbar/selectGeneralisation";
import { ContextMenu } from "./contextMenus/contextMenu";
import DisplayTranslation from "./right_toolbar/translationDisplay";
// import { relationalSchema } from "./right_toolbar/relationalSchemaExample";
import { getId } from "./idGenerator";

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
  const [render, setRender] = useState(false);
  const [scale, setScale] = useState(1);
  const [panDisabled, setPanDisabled] = useState(false);
  const [editableId, setEditableId] = useState(0);

  // List of components that will be rendered
  const [entities, setEntities] = useState({});
  const [relationships, setRelationships] = useState({});
  const [edges, setEdges] = useState({});
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [context, setContext] = useState({ action: actions.NORMAL });

  const [, setRerender] = useState(false);
  const forceRerender = () => setRerender((rerender) => !rerender);

  const [contextMenu, setContextMenu] = useState(null);

  const resetClick = (e) => {
    if (e.target.classList.contains("canvas")) {
      setContext({ action: actions.NORMAL });
    }
  };

  useEffect(() => {
    setRender(true);
    document?.addEventListener("click", resetClick);
  }, []);

  const getEdge = (id) => ({ ...edges[id] });

  // Returns a copy of the element
  const elementGetters = {
    [types.ENTITY]: (id) => ({ ...entities[id] }),
    [types.RELATIONSHIP]: (id) => ({ ...relationships[id] }),
    [types.ATTRIBUTE]: (id, parent) => {
      console.assert([types.ENTITY, types.RELATIONSHIP].includes(parent.type));
      const parentNode = elementGetters[parent.type](parent.id);
      return { ...parentNode.attributes[id] };
    },
    [types.GENERALISATION]: (id, parent) => {
      // Parent must be of ENTITY type
      const parentNode = elementGetters[types.ENTITY](parent.id);
      return { ...parentNode.generalisations[id] };
    },
    [types.EDGE.RELATIONSHIP]: getEdge,
    [types.EDGE.HIERARCHY]: getEdge,
  };
  const getElement = (type, id, parent) => {
    return elementGetters[type](id, parent);
  };

  // TODO:: refactor similar functions (ent, rel)
  const elementSetters = {
    [types.ENTITY]: (entity, editType) =>
      setEntities((prev) => {
        let entities = { ...prev };
        switch (editType) {
          case "deleteElement":
            // Remove all edges
            for (const [edgeId, edgeInfo] of Object.entries(entity.edges)) {
              deleteElement(edgeInfo.type, initialEdges[edgeId], false);
            }

            // Attributes are only stored within entity, so there is no need
            // to recursively remove them

            // Remove all generalisations, and edges linked to generalisations
            for (const [_, generalisationInfo] of Object.entries(
              entity.generalisations
            )) {
              deleteElement(generalisationInfo.type, generalisationInfo, false);
            }
            delete entities[entity.id];
            break;
          default:
            entities[entity.id] = entity;
        }
        return entities;
      }),
    [types.RELATIONSHIP]: (relationship, editType) =>
      setRelationships((prev) => {
        let relationships = { ...prev };
        switch (editType) {
          case "deleteElement":
            // Delete all edges related to this relationship
            for (const [edgeId, edgeInfo] of Object.entries(
              relationship.edges
            )) {
              deleteElement(edgeInfo.type, initialEdges[edgeId], false);
            }

            // Since attributes are only stored within the relationship itself,
            // there is no need to recursively remove attributes.

            // Delete relationship itself, including its attributes
            delete relationships[relationship.id];
            break;
          default:
            relationships[relationship.id] = relationship;
        }

        return relationships;
      }),
    [types.ATTRIBUTE]: (attribute, editType) => {
      const setter =
        attribute.parent.type === types.ENTITY ? setEntities : setRelationships;
      setter((prev) => {
        let newState = { ...prev };
        let parent = newState[attribute.parent.id];
        switch (editType) {
          case "deleteElement":
            delete parent.attributes[attribute.id];
            break;
          default:
            parent.attributes[attribute.id] = attribute;
        }
        return newState;
      });
    },
    [types.GENERALISATION]: (generalisation, editType) => {
      // Parent type must be of ENTITY type
      setEntities((prev) => {
        let newEntities = { ...prev };
        let parent = newEntities[generalisation.parent.id];
        switch (editType) {
          case "deleteElement":
            // Delete all edges related to this generalisation
            for (const [edgeId, edgeInfo] of Object.entries(
              generalisation.edges
            )) {
              deleteElement(edgeInfo.type, initialEdges[edgeId], false);
            }

            // Warning: Potential race condition here, where the generalisation
            // is removed from parent before deleteElement can access it
            delete parent.generalisations[generalisation.id];
            break;
          default:
            parent.generalisations[generalisation.id] = generalisation;
        }
        return newEntities;
      });
    },
    [types.EDGE.RELATIONSHIP]: (edge, editType) => {
      setEdges((prev) => {
        let edges = { ...prev };
        switch (editType) {
          case "deleteElement":
            // Remove edges from its source and target's edge list
            let source = elementGetters[edge.source_type](edge.start);
            let target = elementGetters[edge.target_type](edge.end);

            // If statements in case of race conditions
            if (source.edges !== undefined) {
              delete source.edges[edge.id];
            }
            if (target.edges !== undefined) {
              delete target.edges[edge.id];
            }

            delete edges[edge.id];
            break;
          default:
            edges[edge.id] = edge;
        }
        return edges;
      });
    },
    [types.EDGE.HIERARCHY]: (edge, editType) => {
      setEdges((prev) => {
        let edges = { ...prev };
        switch (editType) {
          case "deleteElement":
            delete edges[edge.id];
            // Remove edges from its source and target's edge list
            // Hierarchical edges can only exist from entity to entity
            let source = elementGetters[types.ENTITY](edge.parent);
            let target = elementGetters[types.ENTITY](edge.child);

            // If statements in case of race conditions
            if (source.edges !== undefined) {
              delete source.edges[edge.id];
            }
            if (target.edges !== undefined) {
              delete target.edges[edge.id];
            }

            // Need to remove edge from the parent's generalisation's edge list,
            // if this is a generalisation
            if (edge.hasOwnProperty("generalisation")) {
              // Check before trying to access generalisation, because there
              // could be a race condition where the generalisation is deleted
              // before the edges can get to it.
              if (edge.generalisation in source.generalisations) {
                delete source.generalisations[edge.generalisation].edges[
                  edge.id
                ];
                // Maybe refactor to avoid possible train wreck?
              }
            }

            break;
          default:
            edges[edge.id] = edge;
        }
        return edges;
      });
    },
  };

	const nodeFunctionsOpposite = {
		updateElement: "updateElement",
		addElement: "deleteElement",
		deleteElement: "addElement",
	};
	const deleteElement = (type, element, isHistory) => {
		setElement(type, element, "deleteElement", isHistory);
	};
	const addElement = (type, element, isHistory) => {
		setElement(type, element, "addElement", isHistory);
	};
	const updateElement = (type, element, isHistory) => {
		setElement(type, element, "updateElement", isHistory);
	};
	const setElement = (type, element, editType, isHistory) => {
		if (!isHistory) {
			const inverse = nodeFunctionsOpposite[editType];
			addToUndo(inverse, type, element);
			setRedoStack([]);
		}
		elementSetters[type](element, editType);
	};

	const addToUndo = (action, type, elem) =>
		addToHistory(action, type, elem, true);
	const addToRedo = (action, type, elem) =>
		addToHistory(action, type, elem, false);
	// Utility for adding to undo and redo
	const addToHistory = (action, type, elem, isUndo) => {
		// Toggle between undo and redo
		let state = isUndo ? undoStack : redoStack;
		let setter = isUndo ? setUndoStack : setRedoStack;

		let elemOld = elementGetters[type](elem.id, elem.parent);

		// Build func object (Note that element should be passed in as a copy)
		let func = {
			action,
			type,
			id: elem.id,
			// Gets a copy of the old element state if existing
			// otherwise it is newly created and we pass in ...elem
			// (note that elem passed in is of new state, so we can't use ...elem directly)
			element:
				elemOld === null || Object.keys(elemOld).length === 0
					? { ...elem }
					: { ...elemOld },
		};

		// Update state within limit
		let stateClone = [...state, func];
		if (stateClone.length > STACK_LIMIT) {
			stateClone.shift();
		}
		setter(stateClone);
	};

	const undo = () => execHistory(true);
	const redo = () => execHistory(false);
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
		console.log("TopELEM");
		console.log(top["element"]);
		// Add to undo/redo stack current state
		addFunc(
			nodeFunctionsOpposite[top["action"]],
			top["type"],
			top["element"]
		);

		// Run and update state
		// TODO: confirm that element should never be null or empty
		let element = top["element"];
		// let element =
		//   top["element"] && Object.keys(top["element"]).length > 0
		//     ? top["element"]
		//     : { ...nodeStates[top["type"]][top["id"]] };
		elementFunctions[top["action"]](top["type"], element, true);
		setter(stateClone);
		setContext({ action: actions.NORMAL });
	};

	// Translates entire model state from backend JSON into client components.
	const importStateFromObject = (state) => {
		let entitiesToAdd = {};
		let edgesToAdd = [];

		state.entities.forEach((e) => {
			// Set type
			e.type = types.ENTITY;

			// Add json for edges
			e.edges = {};

			// Turn attributes into json
			let attributesMap = {};
			e.attributes.forEach((a) => {
				a.parent = {
					id: e.id,
					type: types.ENTITY,
				};
				a.type = types.ATTRIBUTE;
				attributesMap[a.id] = a;
			});
			e.attributes = attributesMap;

			// rename subsets to generalisations
			e.generalisations = e.subsets;
			delete e.subsets;

			entitiesToAdd[e.id] = e;
		});

		state.relationships.forEach((r) => {
			// Set type
			r.type = types.RELATIONSHIP;

			// Add json for edges
			r.edges = {};
			for (let key of Object.keys(r["lHConstraints"])) {
				let edge = {};
				edge["start"] = key;
				edge["end"] = r.id;
				edge["id"] = key + r.id;
				edge["cardinality"] = r["lHConstraints"][key];
				edge["type"] = types.EDGE.RELATIONSHIP;
				r.edges[edge["id"]] = {type: types.EDGE.RELATIONSHIP};
				entitiesToAdd[key].edges[edge["id"]] = {type: types.EDGE.RELATIONSHIP};
				// TODO: Can source be other types?
				edge["source_type"] = types.ENTITY;
				edge["target_type"] = types.RELATIONSHIP;
				edgesToAdd.push(edge);
			}

			// Turn attributes into json
			let attributesMap = {};
			r.attributes.forEach((a) => {
				a.parent = {
					id: r.id,
					type: types.RELATIONSHIP,
				};
				a.type = types.ATTRIBUTE;
				attributesMap[a.id] = a;
			});
			r.attributes = attributesMap;

			delete r["lHConstraints"];

			addElement(types.RELATIONSHIP, r);
		});

		for (let e of Object.values(entitiesToAdd)) {
			addElement(types.ENTITY, e);
		}
		for (let e of edgesToAdd) {
			addElement(types.EDGE.RELATIONSHIP, e);
		}
	};

	// Translates entire model state into a JSON object for backend.
	const exportStateToObject = () => {
		let state = {
			entities: [],
			relationships: [],
			disjoints: [],
		};

		let entitiesClone = { ...entities };
		let relationshipsClone = { ...relationships };
		let edgesClone = { ...edges };

		// Entities.
		Object.values(entitiesClone).forEach((entity) => {
			let entityState = {
				id: entity.id,
				text: entity.text,
				pos: entity.pos,
				isWeak: false,
				attributes: [],
				subsets: [], // TODO
			};

			Object.values(entity.attributes).forEach(({parent, type, ...attr}) => {
				entityState.attributes.push(attr);
			});

			state.entities.push(entityState);
		});

		// Relationships and linking with entities.
		Object.values(relationshipsClone).forEach((relationship) => {
			let relationshipState = {
				id: relationship.id,
				text: relationship.text,
				pos: relationship.pos,
				attributes: [],
				lHConstraints: {},
			};

			Object.values(relationship.attributes).forEach(({parent, type, ...attr}) => {
				relationshipState.attributes.push(attr);
			});

			let links = Object.values(edgesClone).filter(
				(edge) =>
					edge.start === relationship.id ||
					edge.end === relationship.id
			);
			for (let i in links) {
				let link = links[i];
				let entityID =
					link.start === relationship.id ? link.end : link.start;
				relationshipState.lHConstraints[entityID] = link.cardinality;
			}

			state.relationships.push(relationshipState);
		});

		return state;
	};

	const elementFunctions = {
		getElement: getElement,
		addElement: addElement,
		updateElement: updateElement,
		deleteElement: deleteElement,
		undo: undo,
		setEditableId: setEditableId,
	};

	const generalFunctions = {
		setPanDisabled: setPanDisabled,
		setContext: setContext,
		context: context,
    setContextMenu: setContextMenu,
	};

	const leftToolBarActions = {
		addEdgeToRelationship: () => {
			setContext({
				action: actions.RELATIONSHIP_ADD.SELECT_TARGET,
				sources: {},
				target: null,
			});
		},
		exportStateToObject,
		importStateFromObject,
    translate: (schema) => {
      setContext({
        action: actions.TRANSLATE,
				tables: schema.translatedtables.tables,
      });
    },
		undo: undo,
		redo: redo,
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
		minScale: 0.25,
		limitToBounds: false,
	};

	const nodeConfig = {
		parentRef: parentRef,
		scale: scale, // TODO
	};

	// TODO
	const showPendingChanges = () => {};
	const showRightToolbar = () => {
		switch (context.action) {
      case actions.TRANSLATE:
        return <DisplayTranslation relationalSchema={context.tables} />
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
								{...elementFunctions}
								{...generalFunctions}
							/>
						);
					case types.RELATIONSHIP:
						return (
							<SelectRelationship
								relationship={relationships[context.selected.id]}
								{...elementFunctions}
								{...generalFunctions}
							/>
						);
					case types.GENERALISATION:
						return (
							<SelectGeneralisation
								generalisation={elementGetters[types.GENERALISATION](
									context.selected.id,
									context.selected.parent
								)}
								{...elementFunctions}
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
						{...elementFunctions}
						{...rightToolBarActions}
						{...generalFunctions}
					/>
				);
			default:
				// TODO
				return <Normal />;
		}
	};

	const showAttributeEdges = (nodes) => {
		return Object.values(nodes).map((node) => {
			return Object.values(node.attributes).map((attribute) => {
				return (
					<AttributeEdge
						parent={attribute.parent.id}
						child={attribute.id}
					/>
				);
			});
		});
	};
	const showEdges = () => {
		console.log(edges);
		return (
			<>
				{/* Normal relationship and hierarchy edges */}
				{Object.values(edges).map((edge) => (
					<Edge edge={edge} />
				))}
				{/* Generalisation edges */}
				{Object.values(entities).map((entity) => {
					return Object.values(entity.generalisations).map(
						(generalisation) => (
							<HierarchyEdge
								parent={entity.id}
								child={generalisation.id}
							/>
						)
					);
				})}
				{/* Attribute edges */}
				{showAttributeEdges(entities)}
				{showAttributeEdges(relationships)}
			</>
		);
	};

	return (
		<Xwrapper>
			<div className="editor" ref={parentRef}>
				{render ? (
					<>
						<Toolbar
							{...elementFunctions}
							{...leftToolBarActions}
						/>
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
											entity={entity}
											general={{
												...nodeConfig,
												...elementFunctions,
												...generalFunctions,
											}}
										/>
									))}
									{Object.values(relationships).map(
										(relationship) => (
											<TestRelationship
                      key={relationship.id}
                      relationship={relationship}
                      general={{
                        ...nodeConfig,
                        ...elementFunctions,
                        ...generalFunctions,
                      }}
                    />
										)
									)}
								</div>
							</TransformComponent>
						</TransformWrapper>
						{showEdges()}
						{showPendingChanges()}
						{showRightToolbar()}
            <ContextMenu contextMenu={contextMenu} />
					</>
				) : null}
			</div>
		</Xwrapper>
	);
}
