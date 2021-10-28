import "./toolbar-right.css";

export default function SelectRelationship({ relationship }) {
  return (
    <div className="toolbar-right">
      <div>Me is relationship</div>
      <div>Label: {relationship.id}</div>
    </div>
  );
}