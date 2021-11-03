import { actions, cardinality, types } from "../types";
import "./toolbar-right.css";
import CardinalityChoices from "./utilities/cardinality";

function Divider() {
  return <hr className="divider" />;
}

export default function SelectEntity({
  entity,
  addNode,
  getNode,
  updateNode,
  context,
  setContext,
}) {
  const updateAction = (action) => {
    setContext((ctx) => {
      let newCtx = { ...ctx };
      newCtx.action = action;
      newCtx.target = null;
      return newCtx;
    });
  };
  const addRelationship = () => updateAction(actions.SELECT.ADD_RELATIONSHIP);
  const addSuperset = () => updateAction(actions.SELECT.ADD_SUPERSET);
  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Entity</div>
      {/* Name Section */}
      <div className="section">
        <div className="section-header">Text: {entity.text}</div>
        <div className="section-content">(TODO: make editable)</div>
      </div>
      {/* Attributes Section */}
      <div className="section">
        <div className="section-header">Attributes</div>
        <div className="section-content">TODO</div>
      </div>
      {/* Relationships Section */}
      <div className="section">
        <div className="section-header">Relationships</div>
        {entity.edges.length === 0 ? null : <Divider />}
        <div>
          {entity.edges.map((id) => {
            const edge = getNode(types.EDGE.RELATIONSHIP, id);
            return (
              <div>
                <div className="selected-element">
                  <div>
                    <div>Rel: {getNode(types.RELATIONSHIP, edge.end).text}</div>
                    <div>Cardinality: {cardinality[edge.cardinality]}</div>
                  </div>
                </div>
                <Divider />
              </div>
            );
          })}
        </div>
        {context.action === actions.SELECT.ADD_RELATIONSHIP ? (
          context.target === null ? (
            <div>Choose a target relationship</div>
          ) : (
            <div>
              <div>
                Rel: {getNode(context.target.type, context.target.id).text}
              </div>
              <CardinalityChoices
                value={context.target.cardinality}
                onChange={(e) => {
                  setContext((prev) => {
                    let ctx = { ...prev };
                    ctx.target.cardinality = e.target.value;
                    return ctx;
                  });
                }}
              />
              <div
                onClick={() => {
                  const sourceID = context.selected.id;
                  const targetID = context.target.id;
                  let edge = {
                    start: sourceID,
                    end: targetID,
                    cardinality: context.target.cardinality,
                    id: "Edge" + sourceID + targetID,
                    type: types.EDGE.RELATIONSHIP,
                  };
                  addNode(types.EDGE.RELATIONSHIP, edge);
                  let node = getNode(types.ENTITY, sourceID);
                  node.edges.push(edge.id);
                  updateNode(types.ENTITY, node);
                  setContext((prev) => {
                    let ctx = { ...prev };
                    ctx.action = actions.SELECT.NORMAL;
                    delete ctx.target;
                    return ctx;
                  });
                }}
              >
                Add
              </div>
            </div>
          )
        ) : (
          <div className="section-tool" onClick={addRelationship}>
            + Add Relationship
          </div>
        )}
      </div>
      {/* Superset sections */}
      <div className="section">
        <div className="section-header">Superset(s)</div>
        <div>
          {entity.parents.length === 0 ? null : <Divider />}
          {entity.parents.map((id) => {
            const edge = getNode(types.EDGE.HIERARCHY, id);
            return (
              <div>
                <div className="selected-element">
                  <div>
                    <div>Ent: {getNode(types.ENTITY, edge.end).text}</div>
                  </div>
                </div>
                <Divider />
              </div>
            );
          })}
        </div>
        {context.action === actions.SELECT.ADD_SUPERSET ? (
          context.target === null ? (
            <div>Choose a target superset</div>
          ) : (
            <div>
              <div>
                Ent: {getNode(context.target.type, context.target.id).text}
              </div>
              <div
                onClick={() => {
                  const sourceID = context.selected.id;
                  const targetID = context.target.id;
                  let edge = {
                    start: sourceID,
                    end: targetID,
                    id: "Edge" + sourceID + targetID,
                    type: types.EDGE.HIERARCHY,
                  };
                  addNode(types.EDGE.HIERARCHY, edge);
                  let child = getNode(types.ENTITY, sourceID);
                  child.parents.push(edge.id);
                  let parent = getNode(types.ENTITY, targetID);
                  parent.children.push(edge.id);
                  updateNode(types.ENTITY, child);
                  updateNode(types.ENTITY, parent);
                  setContext((prev) => {
                    let ctx = { ...prev };
                    ctx.action = actions.SELECT.NORMAL;
                    delete ctx.target;
                    return ctx;
                  });
                }}
              >
                Add
              </div>
            </div>
          )
        ) : (
          <div className="section-tool" onClick={addSuperset}>
            + Add Superset
          </div>
        )}
      </div>
      {/* Subset sections */}
      <div className="section">
        <div className="section-header">Subset(s)</div>
        <div className="section-content">
          {entity.children.length === 0 ? null : <Divider />}
          {entity.children.map((id) => {
            const edge = getNode(types.EDGE.HIERARCHY, id);
            return (
              <div>
                <div className="selected-element">
                  <div>
                    <div>Ent: {getNode(types.ENTITY, edge.start).text}</div>
                  </div>
                </div>
                <Divider />
              </div>
            );
          })}
        </div>
        <div className="section-tool">+ Add Subset</div>
      </div>
    </div>
  );
}
