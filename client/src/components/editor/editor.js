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
import { deleteEntity, updateEntity } from "./elementUtilities/entities";
import {
  deleteRelationship,
  updateRelationship,
} from "./elementUtilities/relationships";
import {
  deleteGeneralisation,
  updateGeneralisation,
} from "./elementUtilities/generalisations";
import {
  deleteRelationshipEdge,
  updateRelationshipEdge,
} from "./elementUtilities/relationshipEdges";
import {
  deleteHierarchyEdge,
  updateHierarchyEdge,
} from "./elementUtilities/hierarchyEdges";
import {
  deleteAttribute,
  updateAttribute,
} from "./elementUtilities/attributes";
import { addToUndo, undo } from "./historyUtilities/undo";
import { deletes, updates } from "./elementUtilities/delete";

export default function Editor() {
  // Canvas states: passed to children for metadata (eg width and height of main container)
  const parentRef = useRef(null);
  const [render, setRender] = useState(false);
  const [scale, setScale] = useState(1);
  const [panDisabled, setPanDisabled] = useState(false);

  // List of components that will be rendered
  const [entities, setEntities] = useState(initialEntities);
  const [relationships, setRelationships] = useState(initialRelationships);
  const [edges, setEdges] = useState(initialEdges);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [context, setContext] = useState({ action: actions.NORMAL });

  const [, setRerender] = useState(false);
  const forceRerender = () => setRerender((rerender) => !rerender);

  const [contextMenu, setContextMenu] = useState(null);

  const elementAndSetters = {
    entities: entities,
    setEntities: setEntities,
    relationships: relationships,
    setRelationships: setRelationships,
    edges: edges,
    setEdges: setEdges,
  };
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
      return { ...parentNode?.generalisations[id] };
    },
    [types.EDGE.RELATIONSHIP]: getEdge,
    [types.EDGE.HIERARCHY]: getEdge,
  };
  const getElement = (type, id, parent) => {
    return elementGetters[type](id, parent);
  };

  const elementSetters = {
    [types.ENTITY]: (entity, editType) => {
      switch (editType) {
        case "deleteElement":
          return deleteEntity(entity, elementAndSetters);
        default:
          return updateEntity(entity, elementAndSetters);
      }
    },
    [types.RELATIONSHIP]: (relationship, editType) => {
      switch (editType) {
        case "deleteElement":
          return deleteRelationship(relationship, elementAndSetters);
        default:
          return updateRelationship(relationship, elementAndSetters);
      }
    },
    [types.ATTRIBUTE]: (attribute, editType) => {
      switch (editType) {
        case "deleteElement":
          return deleteAttribute(attribute, elementAndSetters);
        default:
          return updateAttribute(attribute, elementAndSetters);
      }
    },
    [types.GENERALISATION]: (generalisation, editType) => {
      switch (editType) {
        case "deleteElement":
          return deleteGeneralisation(generalisation, elementAndSetters);
        default:
          return updateGeneralisation(generalisation, elementAndSetters);
      }
    },
    [types.EDGE.RELATIONSHIP]: (edge, editType) => {
      switch (editType) {
        case "deleteElement":
          return deleteRelationshipEdge(edge, elementAndSetters);
        default:
          return updateRelationshipEdge(edge, elementAndSetters);
      }
    },
    [types.EDGE.HIERARCHY]: (edge, editType) => {
      switch (editType) {
        case "deleteElement":
          return deleteHierarchyEdge(edge, elementAndSetters);
        default:
          return updateHierarchyEdge(edge, elementAndSetters);
      }
    },
  };

  const deleteElement = (type, element) => {
    const data = deletes[type](element, elementAndSetters);
    addToUndo("deleteElement", data, historyAndSetters);
  };
  const addElement = (type, element, isHistory) => {
    const data = updates[type](element, elementAndSetters);
    addToUndo("addElement", data, historyAndSetters);
  };
  const updateElement = (type, element, isHistory) => {
    const data = updates[type](element, elementAndSetters);
    addToUndo("updateElement", data, historyAndSetters);
  };

  const redo = () => {};

  /** IMPORT FROM / EXPORT TO BACKEND */
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
        r.edges[edge["id"]] = { type: types.EDGE.RELATIONSHIP };
        entitiesToAdd[key].edges[edge["id"]] = {
          type: types.EDGE.RELATIONSHIP,
        };
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

      Object.values(entity.attributes).forEach(({ parent, type, ...attr }) => {
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

      Object.values(relationship.attributes).forEach(
        ({ parent, type, ...attr }) => {
          relationshipState.attributes.push(attr);
        }
      );

      let links = Object.values(edgesClone).filter(
        (edge) => edge.start === relationship.id || edge.end === relationship.id
      );
      for (let i in links) {
        let link = links[i];
        let entityID = link.start === relationship.id ? link.end : link.start;
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
    undo: () => {
      undo(historyAndSetters, elementAndSetters);
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
    exportStateToObject,
    importStateFromObject,
    translate: (schema) => {
      setContext({
        action: actions.TRANSLATE,
        tables: schema.translatedtables.tables,
      });
    },
    undo: () => undo(historyAndSetters, elementAndSetters),
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
          <AttributeEdge parent={attribute.parent.id} child={attribute.id} />
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
          return Object.values(entity.generalisations).map((generalisation) => (
            <HierarchyEdge parent={entity.id} child={generalisation.id} />
          ));
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
