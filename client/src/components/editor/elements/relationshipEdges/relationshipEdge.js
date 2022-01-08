import Xarrow from "react-xarrows";
import { cardinality as cardinality_all, types } from "../../types";

export const getRelationshipEdge = ({ edges }, id) => {
  return edges[id] ? { ...edges[id] } : null;
};

export const deleteRelationshipEdge = ({ elements, setElements }, edge) => {
  let data = { node: null, edges: [edge] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, relationships, edges } = newElements;
    // Delete references to edge in nodes
    if (edge.source_type === types.ENTITY) {
      let source = entities[edge.start];
      source.isWeak = source.isWeak.filter((id) => id !== edge.id);
      delete source.edges[edge.id];
    } else if (edge.source_type === types.RELATIONSHIP) {
      delete relationships[edge.start].edges[edge.id];
    }
    delete relationships[edge.end].edges[edge.id];
    // Delete edge
    delete edges[edge.id];
    return newElements;
  });

  console.log(`deleteRelationshipEdge:`);
  console.log(data);
  return data;
};

export const updateRelationshipEdge = ({ elements, setElements }, edge) => {
  const oldEntry = elements.edges[edge.id];
  let data = { node: null, edges: [oldEntry ? oldEntry : edge] };
  data = JSON.parse(JSON.stringify(data));

  setElements((prev) => {
    let newElements = { ...prev };
    const { entities, relationships, edges } = newElements;
    edges[edge.id] = edge;
    if (!oldEntry) {
      // Newly added edge, update source and target
      if (edge.source_type === types.ENTITY) {
        entities[edge.start].edges[edge.id] = {
          type: types.EDGE.RELATIONSHIP,
        };
      } else if (edge.source_type === types.RELATIONSHIP) {
        relationships[edge.start].edges[edge.id] = {
          type: types.EDGE.RELATIONSHIP,
        };
      }
      console.assert(edge.target_type === types.RELATIONSHIP);
      relationships[edge.end].edges[edge.id] = {
        type: types.EDGE.RELATIONSHIP,
      };
    } else {
      if (edge.isKey !== oldEntry.isKey) {
        console.assert(edge.source_type === types.ENTITY);
        const parent = entities[edge.start];
        if (edge.isKey) {
          parent.isWeak.push(edge.id);
        } else {
          parent.isWeak = parent.isWeak.filter((id) => id !== edge.id);
        }
      }
    }
    return newElements;
  });

  console.log(`updateRelationshipEdge:`);
  console.log(data);
  return data;
};

export function RelationshipEdge({ start, end, cardinality, isKey, scale }) {
  const style = {
    backgroundColor: "white",
    padding: "2.5px",
    fontSize: `${14 * scale}px`,
  };
  if (isKey) {
    style["textDecoration"] = "underline";
  }
  return (
    <Xarrow
      start={start.toString()}
      end={end.toString()}
      labels={<div style={style}>{cardinality_all[cardinality]}</div>}
      showHead={false}
      curveness={0}
      endAnchor="middle"
      startAnchor="middle"
      strokeWidth={4 * scale}
      passProps={{
        onClick: () => {
          /*TODO */
        },
      }}
      zIndex={-1}
    />
  );
}
