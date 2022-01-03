import { actions, cardinality, types } from "../../types";
import { getId } from "../../idGenerator";
import CardinalityChoices from "./cardinality";
import { MdCheck, MdClear } from "react-icons/md";

// Generic function for adding a single edge
function AddingEdge({
  action, // should be in actions.SELECT
  selected,
  target,
  setContext,
  getElement,
  addElement,
  updateElement,
  createEdge,
  validate,
}) {
  const reset = () => {
    setContext((prev) => {
      let ctx = { ...prev };
      ctx.action = actions.SELECT.NORMAL;
      delete ctx.target; // TODO: check behahviour if ctx.target doesn't exist
      return ctx;
    });
  };

  const updateNodeWithEdge = (nodeID, nodeType, edge, parent) => {
    console.log(`updatenodewithedge(${nodeID}, ${nodeType})`);
    console.log(edge);
    console.log(parent);
    let node = getElement(nodeType, nodeID, parent);
    node.edges[edge.id] = { type: edge.type };
    updateElement(nodeType, node);
  };
  const addEdge = () => {
    if (!validate || validate(target)) {
      const edge = createEdge(selected, target);
      addElement(edge.type, edge);
      reset();
    }
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <div>No target selected</div>
        <div onClick={reset}>
          <MdClear />
        </div>
      </div>
    );
  }

  let warning = null;
  switch (action) {
    case actions.SELECT.ADD_RELATIONSHIP:
      if (
        selected.type === types.ENTITY &&
        target.type !== types.RELATIONSHIP
      ) {
        warning = <div>! Target selected must be of 'Relationship' type</div>;
      }
      break;
    case actions.SELECT.ADD_SUBSET:
    case actions.SELECT.ADD_SUPERSET:
      console.assert(selected.type === types.ENTITY);
      if (
        target.type !== types.ENTITY &&
        target.type !== types.GENERALISATION
      ) {
        warning = (
          <div>
            ! Target selected as superset/subset must be of
            'Entity'/'Generalisation' type
          </div>
        );
      }
  }

  if (warning !== null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        {warning}
        <div>
          <MdClear />
        </div>
      </div>
    );
  }

  const node = getElement(target.type, target.id, target.parent);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px",
        position: "relative",
      }}
    >
      <div>
        {node.text}
        <br />
        {action === actions.SELECT.ADD_RELATIONSHIP ? (
          <CardinalityChoices
            value={target.cardinality}
            onChange={updateCardinality}
          />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: "0",
          right: "0",
        }}
      >
        <div onClick={addEdge}>
          <MdCheck />
        </div>
        <div onClick={reset}>
          <MdClear />
        </div>
      </div>
    </div>
  );
}

// Adding relationship to relationship node
export function RelationshipAdding(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: getId(types.EDGE.RELATIONSHIP, target.id, selected.id),
      type: types.EDGE.RELATIONSHIP,
      source_type: target.type,
      target_type: selected.type,
      start: target.id,
      end: selected.id,
      isKey: false,
      cardinality: target.cardinality,
    };
    return newEdge;
  };
  const validate = (target) => {
    if (!(target.cardinality in cardinality)) {
      alert("Cardinality must be selected.");
      return false;
    }
    return true;
  };
  return <AddingEdge {...props} createEdge={createEdge} validate={validate} />;
}

// Adding relationship to entity node
export function AddingRelationship(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: getId(types.EDGE.RELATIONSHIP, selected.id, target.id),
      type: types.EDGE.RELATIONSHIP,
      source_type: selected.type,
      target_type: target.type,
      start: selected.id,
      end: target.id,
      isKey: false,
      cardinality: target.cardinality,
    };
    return newEdge;
  };
  const validate = (target) => {
    if (target.type !== types.RELATIONSHIP) {
      alert("Target selected must be of 'Relationship' type.");
      return false;
    }
    if (!(target.cardinality in cardinality)) {
      alert("Cardinality must be selected.");
      return false;
    }
    return true;
  };
  return <AddingEdge {...props} createEdge={createEdge} validate={validate} />;
}

export function AddingSuperset(props) {
  const createEdge = (selected, target) => {
    let newEdge = {
      id: getId(types.EDGE.HIERARCHY, target.id, selected.id),
      type: types.EDGE.HIERARCHY,
      child: selected.id,
    };
    if (target.type === types.GENERALISATION) {
      newEdge.parent = target.parent.id;
      newEdge.generalisation = target.id;
    } else {
      newEdge.parent = target.id;
    }
    return newEdge;
  };
  return <AddingEdge {...props} createEdge={createEdge} />;
}

export function AddingSubset(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: getId(types.EDGE.HIERARCHY, target.id, selected.id),
      type: types.EDGE.HIERARCHY,
      child: target.id,
      parent: selected.id,
      generalisation: props.generalisation,
    };
    return newEdge;
  };

  return <AddingEdge {...props} createEdge={createEdge} />;
}

export function AddingSubsetViaGeneralisation(props) {
  const createEdge = (selected, target) => {
    const newEdge = {
      id: getId(types.EDGE.HIERARCHY, target.id, selected.id),
      parent: selected.parent.id,
      child: target.id,
      generalisation: selected.id,
      type: types.EDGE.HIERARCHY,
    };
    return newEdge;
  };
  return <AddingEdge {...props} createEdge={createEdge} />;
}
