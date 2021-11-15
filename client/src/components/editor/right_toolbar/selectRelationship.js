import { actions } from "../types";
import "./toolbar-right.css";
import { RelationshipAdding } from "./utilities/addEdge";
import { DisplayRelationships } from "./utilities/listDisplay";

// TODO: refactor with SelectEntity?
// React fragments vs divs ?
export default function SelectRelationship({
  relationship,
  getElement,
  addElement,
  updateElement,
  context,
  setContext,
}) {
  const addConnection = () => {
    setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = actions.SELECT.ADD_RELATIONSHIP;
      newCtx.target = null;
      return newCtx;
    });
  };

  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Relationship</div>
      <div>Label: {relationship.id}</div>

      {/* Name Section */}
      <div className="section">
        <div className="section-header">Name: {relationship.text}</div>
      </div>

      {/* Connections? Section */}
      <div className="section">
        <div className="section-header">Connections</div>
        <DisplayRelationships
          relationships={Object.keys(relationship.edges)}
          getElement={getElement}
          isSource={false}
        />
        {context.action === actions.SELECT.ADD_RELATIONSHIP ? (
          <RelationshipAdding
            {...context}
            setContext={setContext}
            getElement={getElement}
            addElement={addElement}
            updateElement={updateElement}
          />
        ) : (
          <div className="section-tool" onClick={addConnection}>
            + Add Connection
          </div>
        )}
      </div>
    </div>
  );
}
