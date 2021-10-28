import { useState } from "react";
import Draggable from "react-draggable";
import Entity from "./nodes/entity";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";
import "./right_toolbar/toolbar-right.css";
import { DummyEdge, DummyEntity, DummyRelationship } from "./nodes/dummy_nodes";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
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
  const [dEntities, setDEntities] = useState(sampleDEntities);
  const [dRelationships, setDRelationships] = useState(sampleDRelationships);
  const [edges, setEdges] = useState(sampleEdges);
  const [action, setAction] = useState(actions.NORMAL);
  const [context, setContext] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({ edges: [] });

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

  return (
    <>
      <Xwrapper>
        <Toolbar addRelationship={enterAddRelationship} />
        <div className="canvas">
          {dEntities.map((ent) => (
            <DummyEntity {...ent} modifyContext={modifyContext} />
          ))}
          {dRelationships.map((rel) => (
            <DummyRelationship {...rel} modifyContext={modifyContext} />
          ))}
          {edges.map((edge, idx) => (
            <DummyEdge edge={edge} idx={idx} modifyContext={modifyContext} />
          ))}
          {showPendingChanges()}
        </div>
        {showRightToolbar()}
      </Xwrapper>
    </>
  );
}

export default Editor;
