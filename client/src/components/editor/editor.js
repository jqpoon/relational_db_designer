import { useState, useRef, useEffect } from "react";
import { initialEntities, initialRelationships, initialEdges } from "./initial";
import { actions, types } from "./types";
import Edge from "./edges/edge";
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
  const [counter, setCounter] = useState(1);
  const [render, setRender] = useState(false);
  const [scale, setScale] = useState(1);
  const [panDisabled, setPanDisabled] = useState(false);
  const [editableId, setEditableId] = useState(0);

  // List of components that will be rendered
  const [entities, setEntities] = useState(initialEntities);
  const [relationships, setRelationships] = useState(initialRelationships);
  const [edges, setEdges] = useState(initialEdges);
  const [stack, setStack] = useState([]);

  const [context, setContext] = useState({ action: actions.NORMAL });

  const [, setRerender] = useState(false);
  const forceRerender = () => setRerender((rerender) => !rerender);

  useEffect(() => {
    setRender(true);
  }, []);

  const getEdge = (id) => ({ ...edges[id] });

  // Returns a copy of the element
  const elementGetters = {
    [types.ENTITY]: (id) => ({ ...entities[id] }),
    [types.RELATIONSHIP]: (id) => ({ ...relationships[id] }),
    [types.ATTRIBUTE]: (id, parentType, parentId) => {
      console.assert(parentType in [types.ENTITY, types.RELATIONSHIP]);
      const parent = elementGetters[parentType](parentId);
      return { ...parent.attributes[id] };
    },
    [types.GENERALISATION]: (id, parentType, parentId) => {
      console.assert(parentType === types.ENTITY);
      const parent = elementGetters[parentType](parentId);
      return { ...parent.generalisations[id] };
    },
    [types.EDGE.RELATIONSHIP]: getEdge,
    [types.EDGE.HIERARCHY]: getEdge,
    [types.EDGE.GENERALISATION]: getEdge,
  };
  const getElement = (type, id, parentType, parentId) => {
    return elementGetters[type](id, parentType, parentId);
  };

  const edgeSetter = (edge) => {
    setEdges((prev) => {
      let edges = { ...prev };
      edges[edge.id] = edge;
      return edges;
    });
  };
  // TODO:: refactor similar functions (ent, rel)
  const elementSetters = {
    [types.ENTITY]: (entity) =>
      setEntities((prev) => {
        let entities = { ...prev };
        entities[entity.id] = entity;
        return entities;
      }),
    [types.RELATIONSHIP]: (relationship) =>
      setRelationships((prev) => {
        let relationships = { ...prev };
        relationships[relationship.id] = relationship;
        return relationships;
      }),
    [types.ATTRIBUTE]: (attribute) => {
      let parent = elementGetters[attribute.parentType](attribute.parentId);
      parent.attributes[attribute.id] = attribute;
      elementSetters[attribute.parentType](parent);
    },
    [types.GENERALISATION]: (generalisation) => {
      // Parent type must be of ENTITY type
      let parent = elementGetters[types.ENTITY](generalisation.parentId);
      parent.generalisations[generalisation.id] = generalisation;
      elementSetters[types.ENTITY](parent);
    },
    [types.EDGE.RELATIONSHIP]: edgeSetter,
    [types.EDGE.HIERARCHY]: edgeSetter,
    [types.EDGE.GENERALISATION]: edgeSetter,
  };

  const addElement = (type, element, isUndo) => {
    setElement(type, element, true, isUndo);
  };
  const updateElement = (type, element, isUndo) => {
    setElement(type, element, false, isUndo);
  };
  const setElement = (type, element, add, isUndo) => {
    if (!isUndo) {
      const inverse = add ? "deleteNode" : "updateNode";
      const inverseObj = add
        ? { ...element }
        : elementGetters[type](
            element.id,
            element.parentType,
            element.parentId
          );
      addToUndo(inverse, type, inverseObj);
    }
    elementSetters[type](element);
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
    elementFunctions[top["action"]](top["type"], top["element"], true);
    setStack(stackClone);
  };

  const elementFunctions = {
    getElement: getElement,
    addElement: addElement,
    updateElement: updateElement,
    getId: getId,
    undo: undo,
    setEditableId: setEditableId,
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
                  {Object.values(relationships).map((relationship) => (
                    <TestRelationship
                      key={relationship.id}
                      {...relationship}
                      {...nodeConfig}
                      {...elementFunctions}
                      {...generalFunctions}
                    />
                  ))}
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
