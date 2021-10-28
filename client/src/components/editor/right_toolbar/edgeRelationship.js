import "./toolbar-right.css";
import { actions } from "..";

export default function EdgeToRelationship({
  action,
  context,
  cancel,
  setAction,
  changeCardinality,
  addEdge,
}) {
  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Adding new relationship</div>
      <div
        className={
          "section" +
          (action === actions.RELATIONSHIP_ADD_SOURCE ? "-selected" : "")
        }
        onClick={() => setAction(actions.RELATIONSHIP_ADD_SOURCE)}
      >
        <div className="section-header">Select a node as source:</div>
        {context.sources?.map((s) => {
          return <div className="selected-element">{s.id}</div>;
        })}
      </div>
      <div
        className={
          "section" +
          (action === actions.RELATIONSHIP_ADD_TARGET ? "-selected" : "")
        }
        onClick={() => setAction(actions.RELATIONSHIP_ADD_TARGET)}
      >
        <div className="section-header">
          Select a relationship node as target:
        </div>
        {context.targets?.map((t) => {
          return <div className="selected-element">{t.id}</div>;
        })}
      </div>
      <div
        className={
          "section" +
          (action === actions.RELATIONSHIP_ADD_CARDINALITY ? "-selected" : "")
        }
        onClick={() => setAction(actions.RELATIONSHIP_ADD_CARDINALITY)}
      >
        <div className="section-header">Enter cardinality constraint:</div>
        <div className="section-content">
          <input
            className="forms"
            type="text"
            value={context.cardinality}
            onChange={(e) => changeCardinality(e.target.value)}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="tool-button" onClick={addEdge}>
          Confirm
        </div>
        <div className="tool-button" onClick={cancel}>
          Cancel
        </div>
      </div>
    </div>
  );
}
