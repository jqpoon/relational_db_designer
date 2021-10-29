import { useState, useRef, useEffect } from "react";
import { initialEntities, initialRelationships, initialEdges } from "./initial";
import { types } from "./types";
import Entity from "./nodes/entity";
import Relationship from "./nodes/relationship";
import Edge from "./edges/edge";
import { Xwrapper } from "react-xarrows";

export default function Editor() {
  // Passed to children for metadata (eg width and height of main container)
  const parentRef = useRef(null);
  const [render, setRender] = useState(false);
  // List of components that will be rendered
  const [entities, setEntities] = useState(initialEntities);
  const [relationships, setRelationships] = useState(initialRelationships);
  const [edges, setEdges] = useState(initialEdges);

  const nodeStates = {
    [types.ENTITY]: entities,
    [types.RELATIONSHIP]: relationships,
  };
  const nodeSetters = {
    [types.ENTITY]: setEntities,
    [types.RELATIONSHIP]: setRelationships,
  };
  // Generic update, add and delete functions for elements
  // Element should be the (whole) updated element
  const updateNode = (element) => {
    let newNodeState = { ...nodeStates[element.type] };
    newNodeState[element.id] = element;
    nodeSetters[element.type](newNodeState);
  };

  const getNode = (type, id) => {
    return nodeStates[type][id];
  };

  const nodeFunctions = {
    updateNode: updateNode,
    getNode: getNode,
  };

  const nodeConfigurations = {
    parentRef: parentRef,
  };

  useEffect(() => {
    setRender(true);
  }, []);

  return (
    <Xwrapper>
      <div ref={parentRef}>
        {render ? (
          <>
            {Object.values(entities).map((entity) => (
              <Entity {...entity} {...nodeFunctions} {...nodeConfigurations} />
            ))}
            {Object.values(relationships).map((relationship) => (
              <Relationship
                {...relationship}
                {...nodeFunctions}
                {...nodeConfigurations}
              />
            ))}
            {Object.values(edges).map((edge) => (
              <Edge edge={edge} />
            ))}
          </>
        ) : null}
      </div>
    </Xwrapper>
  );
}
