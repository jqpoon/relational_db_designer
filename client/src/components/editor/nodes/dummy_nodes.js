import Draggable from "react-draggable";
import "./stylesheets/dummy.css";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";

export function DummyEntity({ idx, pos, id, modifyContext }) {
  const updateXarrow = useXarrow();
  return (
    <Draggable
      defaultPosition={pos}
      onDrag={updateXarrow}
      onStop={updateXarrow}
    >
      <div
        id={id}
        className="dummy-entity"
        onClick={() => modifyContext(idx, "ent")}
      >
        {id}
      </div>
    </Draggable>
  );
}

export function DummyRelationship({ idx, pos, id, modifyContext }) {
  const updateXarrow = useXarrow();
  return (
    <Draggable
      defaultPosition={pos}
      onDrag={updateXarrow}
      onStop={updateXarrow}
    >
      <div
        id={id}
        className="dummy-relationship"
        onClick={() => modifyContext(idx, "rel")}
        onDragEnd={(e)=> {console.log('Drag ending'); e.stopPropagation()}}
      >
        {id}
      </div>
    </Draggable>
  );
}

export function DummyEdge({ edge, idx, modifyContext }) {
  const label = () => {
    return (
      <div className="edge-label">
        {"Edge from " + edge.start + " to " + edge.end}
      </div>
    );
  };
  return (
    <Xarrow
      {...edge}
      showHead={false}
      curveness={0}
      endAnchor="middle"
      startAnchor="middle"
      passProps={{ onClick: () => modifyContext(idx, "edge") }}
    />
  );
}
