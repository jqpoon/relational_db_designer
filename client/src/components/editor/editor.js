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
import EdgeToRelationship from "./right_toolbar/edgeRelationship";
import SelectGeneralisation from "./right_toolbar/selectGeneralisation";
import { ContextMenu } from "./contextMenus/contextMenu";
import DisplayTranslation from "./right_toolbar/translationDisplay";
import { addToUndo, undo } from "./historyUtilities/undo";
import { deletes, gets, updates } from "./elementUtilities/elementFunctions";

export default function Editor() {
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

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [context, setContext] = useState({ action: actions.NORMAL });

  const [, setRerender] = useState(false);
  const forceRerender = () => setRerender((rerender) => !rerender);

  const [contextMenu, setContextMenu] = useState(null);

  const elementsAndSetter = { elements: elements, setElements: setElements };

  const historyAndSetters = {
    undoStack: undoStack,
    setUndoStack: setUndoStack,
    redoStack: redoStack,
    setRedoStack: setRedoStack,
  };

  const resetClick = (e) => {
    if (e.target.classList.contains("canvas")) {
      setContext({ action: actions.NORMAL });
    }
  };

  useEffect(() => {
    setRender(true);
    document?.addEventListener("click", resetClick);
  }, []);

  // Returns a copy of the element
  const getElement = (type, id, parent) => {
    return gets[type](elements, id, parent);
  };

  const deleteElement = (type, element) => {
    const data = deletes[type](elementsAndSetter, element);
    addToUndo("deleteElement", data, historyAndSetters);
  };
  const addElement = (type, element) => {
    const data = updates[type](elementsAndSetter, element);
    addToUndo("addElement", data, historyAndSetters);
  };
  const updateElement = (type, element) => {
    const data = updates[type](elementsAndSetter, element);
    addToUndo("updateElement", data, historyAndSetters);
  };

  const redo = () => {
    /** TODO */
  };

  const elementFunctions = {
    getElement: getElement,
    addElement: addElement,
    updateElement: updateElement,
    deleteElement: deleteElement,
    undo: () => {
      undo(historyAndSetters, elementsAndSetter);
    },
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
    exportStateToObject: () => {},
    importStateFromObject: () => {},
    translate: (schema) => {
      setContext({
        action: actions.TRANSLATE,
        tables: schema.translatedtables.tables,
      });
    },
    undo: () => undo(historyAndSetters, elementsAndSetter),
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
                relationship={getElement(types.RELATIONSHIP, context.selected.id)}
                {...elementFunctions}
                {...generalFunctions}
              />
            );
          case types.GENERALISATION:
            return (
              <SelectGeneralisation
                generalisation={getElement(types.ENTITY, context.selected.id, context.selected.parent)}
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
