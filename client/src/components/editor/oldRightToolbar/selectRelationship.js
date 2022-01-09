import { actions, types } from "../types";
import "./toolbar-right.css";
import { RelationshipAdding } from "../rightToolbar/components/addEdge";
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
  if (!relationship) {
    setContext({ action: actions.NORMAL });
    return null;
  }
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
    context, 
    setContext,
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
          selected={{ id: relationship.id, type: types.RELATIONSHIP }}
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
