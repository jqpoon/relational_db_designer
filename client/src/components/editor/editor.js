/*
	TABLE OF CONTENTS

	1. Imports
	2. Canvas ID
	3. Editor component
		3.1 States
		3.2 Side effect hooks
		3.3 Utilities
		3.4 Configurations
		3.5 Render functions for edges
		3.6 JSX
*/

// 1. Imports
import { useState, useRef, useEffect } from "react";
import { Xwrapper } from "react-xarrows";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import html2canvas from "html2canvas";
import { actions } from "./types";
import { ContextMenu } from "./elements/contextMenu";
import { deletes, gets, updates } from "./elements/elementFunctions";
import { Relationship } from "./elements/relationships/relationship";
import { Entity } from "./elements/entities/entity";
import axios from "axios";
import { AttributeEdge } from "./elements/attributeEdges/attributeEdge";
import Edge from "./elements/general";
import { HierarchyEdge } from "./elements/hierarchyEdges/hierarchyEdge";
import LeftToolbar from "./toolbar/leftToolbar";
import { RightToolbar } from "./toolbar/rightToolbar";
import {
  deleteERDInBackEnd,
  duplicateERD,
  saveERDToBackEnd,
  translateERtoRelational,
} from "./utilities/backendUtils";
import { saveIdCounter, setIdCounter } from "./utilities/idGenerator";
import { addToUndo, redo, undo } from "./utilities/history";
import { Validator } from "./utilities/validator";
import "./editor.css";
import "react-confirm-alert/src/react-confirm-alert.css";

// For testing
// import { initialEntities, initialRelationships, initialEdges } from "./initial";

// 2. Canvas ID
const canvasExportableCompID = "canvasExportableComp";

// 3. Editor component
export default function Editor({ user, setUser, socket, setSocket }) {
	// **********
	// 3.1 States
	// **********

	// ERD Metadata
	const [name, setName] = useState("Untitled");
	// id of ERD
	const [erid, setErid] = useState(null);
	// version of schema retrieved from backend, used to check for update conflicts
	const [counter, setCounter] = useState(0);

	// List of components that will be rendered
	const [elements, setElements] = useState({});
	const elementsAndSetter = {
		elements: elements,
		setElements: (e) => {
		  setElements(e);

		  // emits event to server that ER diagram has been updated
          if (erid !== null) {
            socket.emit("update schema", {
              uid: user,
              erid: erid,
              body: {
                name: name,
                data: elementsRef.current,
                counter: counter,
                idCounter: saveIdCounter(),
              }
            })
          }
        },
	};

	// Canvas states:
	// passed to children for metadata (eg width and height of main container)
	const parentRef = useRef(null);
	// Toggle when ready to render
	const [render, setRender] = useState(false);
	// Disable panning (eg. when dragging nodes)
	const [panDisabled, setPanDisabled] = useState(false);
	// Record scale of zoom
	const [scale, setScale] = useState(1);
	// Trigger rerendering when dealing with pure CSS transitions
	const [, setRerender] = useState(false);
	const forceRerender = () => setRerender((r) => !r);

	// To support undo and redo
	const [history, setHistory] = useState({ store: [], position: -1 });
	const historyAndSetter = {
		history: history,
		setHistory: setHistory,
	};

	// Context of current action
	const [context, setContext] = useState({ action: actions.NORMAL });
	const backToNormal = () => setContext({ action: actions.NORMAL });

	// Toggle context menu on right click
	const [contextMenu, setContextMenu] = useState(null);

	// Elements ref to retrieve latest update for sockets
    const elementsRef = useRef(elements);
    elementsRef.current = elements;

	// *********************
	// 3.2 Side effect hooks
	// *********************

	useEffect(() => {
		setRender(true);
		// Store user on login
		localStorage.setItem("user", user);
		// Loads latest ER diagram on login / refreshing the page
		const state = JSON.parse(localStorage.getItem("state"));
		importStateFromObject(state);
	}, []);

	// Add / remove event listener for clicks on whitespace
	useEffect(() => {
		const canvas = document.getElementById(canvasExportableCompID);
		const backToNormalWrapper = (e) => {
			if (e.target.className === "canvas") backToNormal();
		};
		canvas?.addEventListener("click", backToNormalWrapper);
		return () => {
			canvas?.removeEventListener("click", backToNormalWrapper);
		};
	}, [render]);

	// Cache elements and ERD ID (if exists)
	useEffect(() => {
		const state = exportStateToObject();
		if (erid) state["erid"] = erid;
		localStorage.setItem("state", JSON.stringify(state));
	}, [elements, erid]);

	// Update user's socket rooms in the server
    useEffect(() => {
      if (erid !== null) {
        socket.emit("leave all");
        socket.emit("connect schema", {
          erid: erid,
        })
      }
    }, [erid])

	// *************
	// 3.3 Utilities
	// *************

	// Returns a copy of the element
	const getElement = (type, id, parent) => {
		return gets[type](elements, id, parent);
	};

	const addElement = (type, element) => {
		const arg = JSON.parse(JSON.stringify(element));
		const data = updates[type](elementsAndSetter, element);
		addToUndo("addElement", arg, data, historyAndSetter);
	};

	const updateElement = (type, element) => {
		const arg = JSON.parse(JSON.stringify(element));
		const data = updates[type](elementsAndSetter, element);
		addToUndo("updateElement", arg, data, historyAndSetter);
	};

	const deleteElement = (type, element) => {
		const arg = JSON.parse(JSON.stringify(element));
		const data = deletes[type](elementsAndSetter, element);
		addToUndo("deleteElement", arg, data, historyAndSetter);
		setContextMenu(null);
	};

	const elementFunctions = {
		getElement,
		addElement,
		updateElement,
		deleteElement,
		undo: () => {
			undo(historyAndSetter, elementsAndSetter);
		},
	};

	// Generic save function
	const saveChanges = ({ type, id, parent }, change) => {
		let newElem = getElement(type, id, parent);
		change(newElem);
		updateElement(type, newElem);
	};

	// Reset/set canvas depending on if obj is defined
	const resetState = (obj) => {
		setName(obj?.name || "Untitled");
		setErid(obj?.erid || null);
		setCounter(obj?.counter || 0);
		if (obj?.idCounter) setIdCounter(obj.idCounter);
		setElements(obj?.data || { entities: {}, relationships: {}, edges: {} });
		setHistory({ store: [], position: -1 });
	};

	// Translates entire model state from backend JSON into client components.
	const importStateFromObject = (obj) => resetState(obj);

	// Translates entire schema state into a single JSON object.
	const exportStateToObject = () => {
		let obj = {
			name,
			data: elements,
			idCounter: saveIdCounter(),
		};
		// Object has already been created, save counter to check against backend
		if (counter !== 0) obj["counter"] = counter;
		return obj;
	};

	// Download ERD as JSON
	const downloadStateAsObject = () => {
		const fileName = "schema.json";
		const blob = new Blob([JSON.stringify(exportStateToObject())], {
			type: "text/json",
		});
		const a = document.createElement("a");
		a.download = fileName;
		a.href = window.URL.createObjectURL(blob);
		const mouseEvent = new MouseEvent("click", {
			view: window,
			bubbles: true,
			cancelable: true,
		});
		a.dispatchEvent(mouseEvent);
		a.remove();
	};

	// Upload JSON to be rendered as ERD
	const uploadStateFromObject = (file) => {
		const fileReader = new FileReader();
		fileReader.readAsText(file, "UTF-8");
		fileReader.onload = (e) => {
			const state = JSON.parse(e.target.result);
			resetState();
			importStateFromObject(state);
		};
	};

	// Download ERD as PNG
	const createSchemaImage = () => {
		const canvasDiv = document.getElementById(canvasExportableCompID);
		html2canvas(canvasDiv, {
			allowTaint: true,
			foreignObjectRendering: true,
			logging: true,
			scrollX: -window.scrollX,
			scrollY: -window.scrollY,
		}).then((canvas) => {
			const newTab = window.open("about:blank", "schema");
			newTab.document.write("<img src='" + canvas.toDataURL("image/png") + "' alt=''/>");
		});
	};

	// ******************
	// 3.4 Configurations
	// ******************

	const erdInfo = {
		user,
		erid,
		name,
		scale,
	};

	const backendUtils = {
		...erdInfo,
		exportERD: exportStateToObject,
		importERD: importStateFromObject,
		resetERD: resetState,
		setErid,
		setContext,
		setCounter,
	};

	const canvasConfig = {
		panning: {
			disabled: panDisabled,
			excluded: ["input", "button"],
			velocityDisabled: true,
		},
		onZoomStop: (ref) => {
			setScale(ref.state.scale);
		},
		onZoom: (ref) => {
			setScale(ref.state.scale);
			forceRerender();
		},
		onPanning: forceRerender,
		alignmentAnimation: { animationTime: 0 },
		onAlignBound: forceRerender,
		doubleClick: { disabled: true },
		minScale: 0.4,
		limitToBounds: false,
	};

	const leftToolBarActions = {
		duplicateERD: async () => duplicateERD(backendUtils),
		loadERD: () => setContext({ action: actions.LOAD }),
		shareERD: () => setContext({ action: actions.SHARE }),
		saveERD: async () => {
			const validator = new Validator(exportStateToObject());
			validator.validateAndAlert();
			await saveERDToBackEnd(backendUtils);
		},
		translateERtoRelational: () => {
			const validator = new Validator(exportStateToObject());
			validator.validateAndAlert();
			if (validator.valid) translateERtoRelational(backendUtils);
		},
		importFromJSON: uploadStateFromObject,
		exportToJSON: downloadStateAsObject,
		exportToPNG: createSchemaImage,
		undo: () => undo(historyAndSetter, elementsAndSetter),
		redo: () => redo(historyAndSetter, elementsAndSetter),
		logout: () => {
			localStorage.removeItem("user");
			localStorage.removeItem("state");
			setUser(null);
			if (socket != null) {
			  socket.disconnect();
            }
			setSocket(null);
		},
		deleteERD: async () => deleteERDInBackEnd(backendUtils),
		resetState,
		setName,
	};

	const nodeConfig = {
		parentRef,
		ctx: {
			scale,
			context,
		},
		functions: {
			getElement,
			updateElement,
			addElement,
			deleteElement,
			setContext,
			setContextMenu,
			setPanDisabled,
			saveChanges,
		},
	};

	// ******************************
	// 3.5 Render functions for edges
	// ******************************

	const showAttributeEdges = (nodes) => {
		return Object.values(nodes).map((node) => {
			return Object.values(node.attributes).map((attribute) => {
				return (
					<AttributeEdge
						parent={attribute.parent.id}
						child={attribute.id}
						scale={scale}
					/>
				);
			});
		});
	};

	const showEdges = () => {
		return (
			<>
				{/* Normal relationship and hierarchy edges */}
				{Object.values(elements.edges).map((edge) => (
					<Edge edge={edge} scale={scale} />
				))}
				{/* Generalisation edges */}
				{Object.values(elements.entities).map((entity) => {
					return Object.values(entity.generalisations).map((generalisation) => (
						<HierarchyEdge parent={entity.id} child={generalisation.id} scale={scale} />
					));
				})}
				{/* Attribute edges */}
				{showAttributeEdges(elements.entities)}
				{showAttributeEdges(elements.relationships)}
			</>
		);
	};

    // *********************
    // 3.6 Socket listeners for component
    // *********************

    // Whenever an update to the current ER diagram, update data
    socket.on("schema updated", (res) => {
      if (res.socketID !== socket.id) {
        setElements(res.body.data);
      }
      setCounter(res.body.counter);
      setIdCounter(res.body.idCounter);
    });

    // When an update is required on the current user's ER diagram due to being out of sync
    socket.on("schema reloaded", (res) => {
      setElements(res.body.data);
      setCounter(res.body.counter);
      setIdCounter(res.body.idCounter);
    })

    // Triggered when server responds with error, push reload mechanism if out of sync
    socket.on("error", async (resp) => {
      if (resp.socketID === socket.id) {
        if (resp.error_code === 409) {
          socket.emit("reload schema", {
            uid: user,
            erid: erid,
          })
        }
      }
    });

	// *******
	// 3.7 JSX
	// *******

	return (
		<Xwrapper>
			<div className="editor" ref={parentRef}>
				{render ? (
					<>
						<div id={canvasExportableCompID}>
							<TransformWrapper {...canvasConfig}>
								<TransformComponent>
									<div className="canvas" onClick={() => setPanDisabled(false)}>
										{Object.values(elements.entities).map((entity) => (
											<Entity
												key={entity.id}
												entity={entity}
												{...nodeConfig}
											/>
										))}
										{Object.values(elements.relationships).map(
											(relationship) => (
												<Relationship
													key={relationship.id}
													relationship={relationship}
													{...nodeConfig}
												/>
											)
										)}
									</div>
								</TransformComponent>
							</TransformWrapper>
							{showEdges()}
						</div>
						<LeftToolbar
							info={erdInfo}
							functions={{ ...leftToolBarActions, ...elementFunctions }}
						/>
						<RightToolbar
							context={context}
							user={user}
							erid={erid}
							functions={{
								importERD: importStateFromObject,
								backToNormal,
								setContext,
								getElement,
								saveChanges,
								deleteElement,
								addElement,
							}}
						/>
						<ContextMenu
							contextMenu={contextMenu}
							setContextMenu={setContextMenu}
							backToNormal={backToNormal}
						/>
					</>
				) : null}
			</div>
		</Xwrapper>
	);
}
