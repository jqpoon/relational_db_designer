import "./toolbar-right.css";

export default function SelectEntity({ entity, edgeToRelationship }) {
  return (
    <div className="toolbar-right">
      <div>I am entity</div>
      <div>Label: {entity.id}</div>
      <div className="tool-button" onClick={() => edgeToRelationship(entity)}>
        Connect to Relationship
      </div>
    </div>
  );
}
