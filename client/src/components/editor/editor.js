import { useState, useRef, useEffect } from "react";
import { initialEntities, initialRelationships, initialEdges } from "./initial";
import { actions, types } from "./types";
import Edge, { AttributeEdge, HierarchyEdge } from "./edges/edge";
import { Xwrapper } from "react-xarrows";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";
import { TestEntity, TestRelationship } from "./nodes/node";

import SelectEntity from "./right_toolbar/selectEntity";
import SelectRelationship from "./right_toolbar/selectRelationship";
import Normal from "./right_toolbar/normal";
import SelectEdge from "./right_toolbar/selectEdge";
import SelectGeneralisation from "./right_toolbar/selectGeneralisation";
import { ContextMenu } from "./contextMenus/contextMenu";
import DisplayTranslation from "./right_toolbar/translationDisplay";
import { addToUndo, redo, undo } from "./historyUtilities/history";
import { deletes, gets, updates } from "./elementUtilities/elementFunctions";
import { saveCounter, setCounter } from "./idGenerator";

export default function Editor({ user, setUser }) {
  // Canvas states: passed to children for metadata (eg width and height of main container)
  const parentRef = useRef(null);
  const [render, setRender] = useState(false);
  const [scale, setScale] = useState(1);
  const [panDisabled, setPanDisabled] = useState(false);

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

  // Resets the state of the whiteboard and deletes the current schema.
  const resetState = () => {
    setElements({ entities: {}, relationships: {}, edges: {} });
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
  // Translates entire model state from backend JSON into client components.
  const importStateFromObject = (state) => {
    if (state.count) {
      setCounter(state.count);
      delete state.count;
    }
    setElements(state);
  };

  // Translates entire schema state into a single JSON object.
  const exportStateToObject = () => {
    return { ...elements, count: saveCounter() };
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
    setPanDisabled: setPanDisabled,
    setContext: setContext,
    context: context,
    setContextMenu: setContextMenu,
  };

  const leftToolBarActions = {
    importStateFromObject: importStateFromObject,
    exportStateToObject: exportStateToObject,
    uploadStateFromObject: uploadStateFromObject,
    downloadStateAsObject: downloadStateAsObject,
    translate: (schema) => {
      setContext({
        action: actions.TRANSLATE,
        tables: schema.translatedtables.tables,
      });
    },
    undo: () => undo(historyAndSetter, elementsAndSetter),
    redo: () => redo(historyAndSetter, elementsAndSetter),
    setUser: setUser,
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
    minScale: 0.3,
    limitToBounds: false,
  };

  const nodeConfig = {
    parentRef: parentRef,
    scale: scale, // TODO
  };

  const showRightToolbar = () => {
    switch (context.action) {
      case actions.TRANSLATE:
        return <DisplayTranslation relationalSchema={context.tables} />;
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
                entity={getElement(types.ENTITY, context.selected.id)}
                {...elementFunctions}
                {...generalFunctions}
              />
            );
          case types.RELATIONSHIP:
            return (
              <SelectRelationship
                relationship={getElement(
                  types.RELATIONSHIP,
                  context.selected.id
                )}
                {...elementFunctions}
                {...generalFunctions}
              />
            );
          case types.GENERALISATION:
            return (
              <SelectGeneralisation
                generalisation={getElement(
                  types.GENERALISATION,
                  context.selected.id,
                  context.selected.parent
                )}
                {...elementFunctions}
                {...generalFunctions}
              />
            );
          case types.EDGE.RELATIONSHIP:
          case types.EDGE.HIERARCHY:
            return <SelectEdge edge={elements.edges[context.selected.id]} />;
          default:
            return <Normal />; // TODO: type not found page
        }
      default:
        // TODO
        return <Normal />;
    }
  };

  const showAttributeEdges = (nodes) => {
    return Object.values(nodes).map((node) => {
      return Object.values(node.attributes).map((attribute) => {
        return (
          <AttributeEdge parent={attribute.parent.id} child={attribute.id} />
        );
      });
    });
  };
  const showEdges = () => {
    return (
      <>
        {/* Normal relationship and hierarchy edges */}
        {Object.values(elements.edges).map((edge) => (
          <Edge edge={edge} />
        ))}
        {/* Generalisation edges */}
        {Object.values(elements.entities).map((entity) => {
          return Object.values(entity.generalisations).map((generalisation) => (
            <HierarchyEdge parent={entity.id} child={generalisation.id} />
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
            <Toolbar {...elementFunctions} {...leftToolBarActions} />
            <TransformWrapper {...canvasConfig}>
              <TransformComponent>
                <div
                  className="canvas" // TODO: previously "dnd"
                  // ref={parentRef}
                  onClick={() => setPanDisabled(false)}
                >
                  {Object.values(elements.entities).map((entity) => (
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
                  {Object.values(elements.relationships).map((relationship) => (
                    <TestRelationship
                      key={relationship.id}
                      relationship={relationship}
                      general={{
                        ...nodeConfig,
                        ...elementFunctions,
                        ...generalFunctions,
                      }}
                    />
                  ))}
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
