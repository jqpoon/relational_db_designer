import { actions, cardinality, types } from "../../types";
import { getId } from "../../idGenerator";
import CardinalityChoices from "./cardinality";
import { MdCheck, MdClear } from "react-icons/md";
import { createRelationshipEdge } from "../../elements/relationshipEdges/relationshipEdge";
import { createHierarchyEdge } from "../../elements/hierarchyEdges/hierarchyEdge";

// Generic function for adding a single edge
function AddingEdge({
  action, // should be in actions.SELECT
  selected,
  target,
  setContext,
  getElement,
  addElement,
  createEdge,
  validate,
}) {
  const reset = () => {
    setContext((prev) => {
      let ctx = { ...prev };
      ctx.action = actions.SELECT.NORMAL;
      delete ctx.target;
      return ctx;
    });
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
      break;
    default:
      console.assert(false);
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
  const validate = (target) => {
    if (!(target.cardinality in cardinality)) {
      alert("Cardinality must be selected.");
      return false;
    }
    return true;
  };
  return <AddingEdge {...props} createEdge={createRelationshipEdge} validate={validate} />;
}

// Adding relationship to entity node
export function AddingRelationship(props) {
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
  return (
    <AddingEdge
      {...props}
      createEdge={createRelationshipEdge}
      validate={validate}
    />
  );
}

export function AddingSuperset(props) {
  return (
    <AddingEdge
      {...props}
      createEdge={(child, parent) => createHierarchyEdge(child, parent)}
    />
  );
}

export function AddingSubset(props) {
  return (
    <AddingEdge
      {...props}
      createEdge={(parent, child) =>
        createHierarchyEdge(child, parent, props.generalisation)
      }
    />
  );
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
  return (
    <AddingEdge
      {...props}
      createEdge={(generalisation, child) =>
        createHierarchyEdge(child, generalisation.parent, generalisation)
      }
    />
  );
}
