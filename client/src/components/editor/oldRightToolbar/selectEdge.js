import "./toolbar-right.css";

export default function SelectEdge({ edge }) {
  return (
    <div className="toolbar-right">
      <div>I am edge</div>
      <div>Label: {edge.labels.middle}</div>
      <div className="tool-button">
        Delete Edge
      </div>
    </div>
  );
}
