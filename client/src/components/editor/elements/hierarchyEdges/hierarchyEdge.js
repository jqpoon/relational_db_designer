import { types } from "../../types";
import Xarrow from "react-xarrows";

export const getHierarchyEdge = ({ edges }, id) => {
  return edges[id] ? { ...edges[id] } : null;
};

export const deleteHierarchyEdge = ({ elements, setElements }, edge) => {
  let data = { node: null, edges: [edge] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, edges } = newElements;
    // Delete references to edge in nodes
    delete entities[edge.child].edges[edge.id];
    if (edge.generalisation) {
      delete entities[edge.parent].generalisations[edge.generalisation].edges[
        edge.id
      ];
    } else {
      delete entities[edge.parent].edges[edge.id];
    }
    // Delete edge
    delete edges[edge.id];
    return newElements;
  });
  console.log(`deleteHierarchyEdge:`);
  console.log(data);
  return data;
};

export const updateHierarchyEdge = ({ elements, setElements }, edge) => {
  let oldEntry = elements.edges[edge.id];
  let data = { node: null, edges: [oldEntry ? oldEntry : edge] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, edges } = newElements;
    edges[edge.id] = edge;
    if (!oldEntry) {
      // Newly added edge, update source and target
      entities[edge.child].edges[edge.id] = { type: types.EDGE.HIERARCHY };
      if (edge.generalisation) {
        entities[edge.parent].generalisations[edge.generalisation].edges[
          edge.id
        ] = { type: types.EDGE.HIERARCHY };
      } else {
        entities[edge.parent].edges[edge.id] = {
          type: types.EDGE.HIERARCHY,
        };
      }
    }
    return newElements;
  });

  console.log(`updateHierarchyEdge`);
  console.log(data);
  return data;
};

export function HierarchyEdge({ parent, child, generalisation, scale }) {
  return (
    <Xarrow
      start={child.toString()}
      end={(generalisation ? generalisation : parent).toString()}
      showHead={!generalisation}
      curveness={0}
      endAnchor={generalisation ? "middle" : "auto"}
      startAnchor="middle"
      strokeWidth={4 * scale}
      zIndex={-1}
    />
  );
}
