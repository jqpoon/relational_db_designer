import { actions, cardinality, types } from "../types";
import "./toolbar-right.css";
import CardinalityChoices from "./utilities/cardinality";
import Divider from "./utilities/divider";

// TODO: refactor with SelectEntity?
// React fragments vs divs ?
export default function SelectRelationship({
  relationship,
  addNode,
  getNode,
  updateNode,
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
  const getLabelFromType = (type) => {
    switch (type) {
      case types.RELATIONSHIP:
        return "Rel";
      case types.ENTITY:
        return "Ent";
      default:
        return "TODO";
    }
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
        {relationship.edges.length === 0 ? null : <Divider />}
        {relationship.edges.map((id) => {
          const edge = getNode(types.EDGE.RELATIONSHIP, id);

          return (
            <>
              <div className="selected-element">
                <div>
                  {getLabelFromType(edge.source_type)}:{" "}
                  {getNode(edge.source_type, edge.start).text}
                </div>
                <div>Cardinality: {cardinality[edge.cardinality]}</div>
              </div>
              <Divider />
            </>
          );
        })}
        {context.action === actions.SELECT.ADD_RELATIONSHIP ? (
          context.target === null ? (
            <>Choose a target to connect to</>
          ) : (
            <>
              {getLabelFromType(context.target.type)} :{" "}
              {getNode(context.target.type, context.target.id).text}
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
                  const relID = context.selected.id;
                  const targetID = context.target.id;
                  let edge = {
                    start: targetID,
                    end: relID,
                    cardinality: context.target.cardinality,
                    id: "Edge" + targetID + relID,
                    type: types.EDGE.RELATIONSHIP,
                    source_type: context.target.type,
                  };
                  addNode(types.EDGE.RELATIONSHIP, edge);
                  let target = getNode(context.target.type, targetID);
                  target.edges.push(edge.id);
                  updateNode(context.target.type, target);
                  let rel = getNode(context.selected.type, context.selected.id);
                  rel.edges.push(edge.id);
                  updateNode(context.selected.type, rel);
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
            </>
          )
        ) : (
          <div className="section-tool" onClick={addConnection}>
            + Add Connection
          </div>
        )}
      </div>
    </div>
  );
}
