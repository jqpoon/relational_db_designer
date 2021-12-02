import { actions, types } from "../types";
import "./toolbar-right.css";
import { RelationshipAdding } from "./utilities/addEdge";
import { AddAttribute, Attributes } from "./utilities/attribute";
import { Name } from "./utilities/name";
import { Relationships } from "./utilities/relationship";

export default function SelectRelationship({
  relationship,
  getElement,
  addElement,
  updateElement,
  deleteElement,
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

  const utilities = {
    getElement: getElement,
    addElement: addElement,
    updateElement: updateElement,
  };

  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Relationship</div>
      <div className="section">
        <div
          className="section-header"
          onClick={() => {
            deleteElement(types.RELATIONSHIP, relationship);
            setContext({ action: actions.NORMAL });
          }}
        >
          Delete
        </div>
      </div>

      {/* Name Section */}
      <div className="section">
        <div className="section-header">Name:</div>
        <Name {...relationship} {...utilities} />
      </div>

      {/* Attributes Section */}
      <div className="section">
        <div className="section-header">Attributes</div>
        <Attributes
          attributes={Object.values(relationship.attributes)}
          updateElement={updateElement}
          deleteElement={deleteElement}
        />
        <AddAttribute
          parentType={types.RELATIONSHIP}
          parentId={relationship.id}
          {...utilities}
        />
      </div>

      {/* Connections Section */}
      <div className="section">
        <div className="section-header">Connections</div>
        <Relationships
          relationships={Object.keys(relationship.edges)}
          getElement={getElement}
          updateElement={updateElement}
          deleteElement={deleteElement}
          selected={relationship.id}
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
