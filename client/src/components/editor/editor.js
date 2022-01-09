import { useState, useRef, useEffect } from "react";
import { initialEntities, initialRelationships, initialEdges } from "./initial";
import { actions, types } from "./types";
import { Xwrapper } from "react-xarrows";
import "./editor.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import html2canvas from "html2canvas";
import { ContextMenu } from "./elements/contextMenu";
import { addToUndo, redo, undo } from "./utilities/history";
import { deletes, gets, updates } from "./elements/elementFunctions";
import { saveIdCounter, setIdCounter } from "./utilities/idGenerator";
import LeftToolbar from "./toolbar/leftToolbar";
import {
  deleteERDInBackEnd,
  duplicateERD,
  saveERDToBackEnd,
  translateERtoRelational,
} from "./utilities/backendUtils";
import { Relationship } from "./elements/relationships/relationship";
import { Entity } from "./elements/entities/entity";
import { AttributeEdge } from "./elements/attributeEdges/attributeEdge";
import Edge from "./elements/general";
import { HierarchyEdge } from "./elements/hierarchyEdges/hierarchyEdge";
import { RightToolbar } from "./toolbar/rightToolbar";
import {Validator} from "./utilities/validator";

export default function Editor({ user, setUser }) {
  /** ERD Metadata
   * name - name of ERD
   * erid - id of ERD
   * counter - version of schema retrieved from backend, used to check for update conflicts
   */
  const [name, setName] = useState("Untitled");
  const [erid, setErid] = useState(null);
  const [counter, setCounter] = useState(0);

  // Canvas states: passed to children for metadata (eg width and height of main container)
  const parentRef = useRef(null);
  const [render, setRender] = useState(false);

  // List of components that will be rendered
  const [elements, setElements] = useState({
    entities: initialEntities,
    relationships: initialRelationships,
    edges: initialEdges,
  });

  const elementsAndSetter = { elements: elements, setElements: setElements };

  const [history, setHistory] = useState({ store: [], position: -1 });
  const historyAndSetter = {
    history: history,
    setHistory: setHistory,
  };

  const [context, setContext] = useState({ action: actions.NORMAL });

  const [contextMenu, setContextMenu] = useState(null);

  // Canvas states:
  // Disable panning eg. when dragging nodes
  const [panDisabled, setPanDisabled] = useState(false);
  // Record
  const [scale, setScale] = useState(1);
  // Trigger rerendering onZoom/Pan etc for edges to update properly
  const [, setRerender] = useState(false);
  const forceRerender = () => setRerender((r) => !r);

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

  const backToNormal = () => setContext({ action: actions.NORMAL });

  const canvasExportableCompID = "canvasExportableComp";

  useEffect(() => {
    setRender(true);
    localStorage.setItem("user", user);
    // Loads latest ER diagram on login / refreshing the page
    const state = JSON.parse(localStorage.getItem("state"));
    importStateFromObject(state);
  }, []);

	useEffect(() => {
		const canvas = document.getElementById(canvasExportableCompID);
		const backToNormalWrapper = (e) => {
			if (e.target.className === "canvas") backToNormal();
		};
		canvas?.addEventListener("click", backToNormalWrapper);
		return () => {
			canvas?.removeEventListener("click", backToNormalWrapper);
		}
	}, [render])

	useEffect(() => {
		// Loads current state into local storage whenever ER diagram changes
		const state = exportStateToObject();
		if (erid) state["erid"] = erid;
		localStorage.setItem("state", JSON.stringify(state));
	}, [elements, erid]);
	
  // Resets the state of the whiteboard and deletes the current schema if obj == null.
  // else imports state from obj
  const resetState = (obj) => {
    setName(obj?.name || "Untitled");
    setErid(obj?.erid || null);
    setCounter(obj?.counter || 0);
    if (obj?.idCounter) setIdCounter(obj.idCounter);
    setElements(obj?.data || { entities: {}, relationships: {}, edges: {} });
    setHistory({ store: [], position: -1 });
  };

  // Returns a copy of the element
  const getElement = (type, id, parent) => {
    return gets[type](elements, id, parent);
  };

  const deleteElement = (type, element) => {
    const arg = JSON.parse(JSON.stringify(element));
    const data = deletes[type](elementsAndSetter, element);
    addToUndo("deleteElement", arg, data, historyAndSetter);
    setContextMenu(null);
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

  const elementFunctions = {
    getElement: getElement,
    addElement: addElement,
    updateElement: updateElement,
    deleteElement: deleteElement,
    undo: () => {
      undo(historyAndSetter, elementsAndSetter);
    },
  };

  const generalFunctions = {
    setContext: setContext,
    context: context,
    setContextMenu: setContextMenu,
    setPanDisabled: setPanDisabled,
  };

  // Translates entire model state from backend JSON into client components.
  const importStateFromObject = (obj) => {
    resetState(obj);
  };

  // Translates entire schema state into a single JSON object.
  const exportStateToObject = () => {
    let obj = { name: name, data: elements, idCounter: saveIdCounter() };
    if (counter !== 0) {
      // Object has already been created, save counter to check against backend
      obj["counter"] = counter;
    }
    return obj;
  };

  // Translates entire schema state into a JSON object that fits backend format.
  // TODO: Move this function to backend after working out Firebase stuff.
  const translateStateToBackend = () => {
    let state = {
      entities: [],
      relationships: [],
      generalisations: [],
    };

    let entitiesClone = { ...elements.entities };
    let relationshipsClone = { ...elements.relationships };
    let edgesClone = { ...elements.edges };

    // Entities.
    Object.values(entitiesClone).forEach((entity) => {
      let entityState = {
        id: entity.id,
        text: entity.text,
        pos: entity.pos,
        isWeak: entity.isWeak.length !== 0,
        attributes: [],
        subsets: [],
      };

      // Attributes associated with entity.
      Object.values(entity.attributes).forEach(({ parent, type, ...attr }) => {
        entityState.attributes.push(attr);
      });

      state.entities.push(entityState);
    });

    // Populate subsets array for each entity.
    state.entities.forEach((entityState) => {
      let entity = entitiesClone[entityState.id];
      for (const [edgeID, edgeData] of Object.entries(entity.edges)) {
        // Ensure is a subset edge.
        if (edgeData.type !== types.EDGE.HIERARCHY) continue;
        // Find corresponding child entity object and add to the subsets array.
        const childEntityState = state.entities.filter((e) => {
          return e.id === edgesClone[edgeID].child;
        })[0];
        entityState.subsets.push(childEntityState);
      }
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

      // Attributes associated with relationship.
      Object.values(relationship.attributes).forEach(
        ({ parent, type, ...attr }) => {
          relationshipState.attributes.push(attr);
        }
      );

      // Populate lHConstraints mapping.
      let links = Object.values(edgesClone).filter(
        (edge) => edge.start === relationship.id || edge.end === relationship.id
      );
      for (const i in links) {
        const link = links[i];
        const entityID = link.start === relationship.id ? link.end : link.start;
        relationshipState.lHConstraints[entityID] = link.cardinality;
      }

      state.relationships.push(relationshipState);
    });

    // Generalisations.
    Object.values(entitiesClone).forEach((entity) => {
      Object.values(entity.generalisations).forEach((gen) => {
        let genState = {
          id: gen.id,
          text: gen.text,
          pos: gen.pos,
          parent: state.entities.filter((e) => {
            return e.id === gen.parent.id;
          })[0],
          entities: Object.keys(gen.edges).map((edgeID) => {
            const edge = edgesClone[edgeID];
            // Find the corresponding child entity object by its ID.
            const childEntity = state.entities.filter((e) => {
              return e.id === edge.child;
            })[0];
            // Add the child to the list of subsets of the parent.
            state.entities
              .filter((e) => {
                return e.id === edge.parent;
              })[0]
              .subsets.push(childEntity);
            return childEntity;
          }),
        };
        state.generalisations.push(genState);
      });
    });

    return state;
  };

  const uploadStateFromObject = (file) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      const state = JSON.parse(e.target.result);
      resetState();
      importStateFromObject(state);
    };
  };

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

  const erdInfo = {
    user: user,
    erid: erid,
    name: name,
    scale: scale,
  };

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
      newTab.document.write(
        "<img src='" + canvas.toDataURL("image/png") + "' alt=''/>"
      );
    });
  };

  const backendUtils = {
    ...erdInfo,
    exportERD: exportStateToObject,
    importERD: importStateFromObject,
    resetERD: resetState,
    setErid: setErid,
    setContext: setContext,
    setCounter: setCounter,
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
    },
    deleteERD: async () => deleteERDInBackEnd(backendUtils),
    resetState: resetState,
    setName,
  };

  const saveChanges = ({ type, id, parent }, change) => {
    let newElem = getElement(type, id, parent);
    change(newElem);
    updateElement(type, newElem);
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
            <HierarchyEdge
              parent={entity.id}
              child={generalisation.id}
              scale={scale}
            />
          ));
        })}
        {/* Attribute edges */}
        {showAttributeEdges(elements.entities)}
        {showAttributeEdges(elements.relationships)}
      </>
    );
  };

  return (
    <Xwrapper>
      <div className="editor" ref={parentRef}>
        {render ? (
          <>
            <div id={canvasExportableCompID}>
              <TransformWrapper {...canvasConfig}>
                <TransformComponent>
                  <div
                    className="canvas" // TODO: previously "dnd"
                    onClick={() => setPanDisabled(false)}
                  >
                    {Object.values(elements.entities).map((entity) => (
                      <Entity key={entity.id} entity={entity} {...nodeConfig} />
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
