import { actions, types } from "../../types";
import { generateID, typeToString } from "./general";
import CardinalityChoices from "./cardinality";

function AddingEdge({
  action,
  selected,
  target,
  setContext,
  getNode,
  addNode,
  updateNode,
  createEdge,
}) {
  const reset = () => {
    setContext((prev) => {
      let ctx = { ...prev };
      ctx.action = actions.SELECT.NORMAL;
      delete ctx.target; // TODO: check behahviour if ctx.target doesn't exist
      return ctx;
    });
  };

  const updateNodeWithEdge = (nodeID, nodeType, edge) => {
    let node = getNode(nodeType, nodeID);
    node.edges[edge.id] = { type: edge.type };
    updateNode(nodeType, node);
  };
  const addEdge = () => {
    const edge = createEdge(selected, target);
    addNode(edge.type, edge);
    updateNodeWithEdge(edge.start, edge.source_type, edge);
    updateNodeWithEdge(edge.end, edge.target_type, edge);
    reset();
  };
  const updateCardinality = (e) => {
    setContext((prev) => {
      let ctx = { ...prev };
      ctx.target.cardinality = e.target.value;
      return ctx;
    });
  };
  if (target === null) {
    return (
      <>
        <div>No target selected</div>
        <div onClick={reset}>Cancel</div>
      </>
    );
  }
  const node = getNode(target.type, target.id);
  const nodeType = typeToString(target.type); // TODO
  return (
    <>
      <div>
        {nodeType}: {node.text}
      </div>
      {action === actions.SELECT.ADD_RELATIONSHIP ? (
        <CardinalityChoices
          value={target.cardinality}
          onChange={updateCardinality}
        />
      ) : null}
      <div onClick={addEdge}>Confirm</div>
      <div onClick={reset}>Cancel</div>
    </>
  );
}

// Adding relationship to relationship node
export function RelationshipAdding(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: generateID(target.id, selected.id),
      type: types.EDGE.RELATIONSHIP,
      source_type: target.type,
      target_type: selected.type,
      start: target.id,
      end: selected.id,
      cardinality: target.cardinality,
    };
    return newEdge;
  };

  return <AddingEdge {...props} createEdge={createEdge} />;
}

// Adding relationship to entity node
export function AddingRelationship(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: generateID(selected.id, target.id),
      type: types.EDGE.RELATIONSHIP,
      source_type: selected.type,
      target_type: target.type,
      start: selected.id,
      end: target.id,
      cardinality: target.cardinality,
    };
    return newEdge;
  };
  return <AddingEdge {...props} createEdge={createEdge} />;
}

export function AddingSuperset(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: generateID(selected.id, target.id),
      type: types.EDGE.HIERARCHY,
      source_type: selected.type,
      target_type: target.type,
      start: selected.id,
      end: target.id,
    };
    return newEdge;
  };
  return <AddingEdge {...props} createEdge={createEdge} />;
}

export function AddingSubset(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: generateID(target.id, selected.id),
      type: types.EDGE.HIERARCHY,
      source_type: target.type,
      target_type: selected.type,
      start: target.id,
      end: selected.id,
    };
    return newEdge;
  };

  return <AddingEdge {...props} createEdge={createEdge} />;
}
