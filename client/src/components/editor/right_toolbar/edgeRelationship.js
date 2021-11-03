import "./toolbar-right.css";
import { types, actions } from "../types";
import CardinalityChoices from "./utilities/cardinality";

function Divider() {
  return <hr className="divider" />;
}

export default function EdgeToRelationship({
  context,
  cancel,
  setContext,
  addNode,
  getNode,
  updateNode,
  getId,
}) {
  const addEdge = () => {
    const newEdges = [];
    for (const [s, c] of Object.entries(context.sources)) {
      if (c.cardinality === "") {
        alert("Required cardinality field missing.");
        return;
      }
      // id was not updating
      // const id = getId();
      const id = "Edge-" + s + "-" + context.target.id;
      newEdges.push({
        start: s,
        end: context.target.id,
        id: id,
        cardinality: c.cardinality,
        type: types.EDGE.RELATIONSHIP,
      });
    }
    for (const edge of newEdges) {
      // TODO: implement addNodes([List of nodes])
      addNode(types.EDGE.RELATIONSHIP, edge);
      // update source
      // TODO: source can also be of relationship type
      let node = getNode(types.ENTITY, edge.start);
      node.edges.push(edge.id);
      updateNode(types.ENTITY, node);
      // TODO: update target
    }
    setContext({ action: actions.NORMAL });
  };
  const switchSelect = (selectType) => {
    let newContext = { ...context };
    newContext.action = selectType;
    setContext(newContext);
  };
  const removeSelectedNode = (id, action) => {
    let newContext = { ...context };
    switch (action) {
      case actions.RELATIONSHIP_ADD.SELECT_SOURCES:
        delete context.sources[id];
        break;
      case actions.RELATIONSHIP_ADD.SELECT_TARGET:
        context.target = null;
        break;
      default:
    }
    setContext(newContext);
    console.log("removed-selected:");
    console.log(newContext);
  };
  const setCardinality = (id, cardinality) => {
    let newContext = { ...context };
    context.sources[id].cardinality = cardinality;
    setContext(newContext);
  };
  return (
    <div className="toolbar-right">
      <div className="toolbar-header">Adding new relationship</div>

      <div
        className={
          "section" +
          (context.action === actions.RELATIONSHIP_ADD.SELECT_TARGET
            ? "-selected"
            : "")
        }
        onClick={() => switchSelect(actions.RELATIONSHIP_ADD.SELECT_TARGET)}
      >
        <div className="section-header">
          Select a relationship node as target:
        </div>
        {context.target === null ? null : (
          <div>
            <Divider />
            <div className="selected-element">
              <div>{context.target.id}</div>
              {context.target.type === types.RELATIONSHIP ? null : (
                <div>! Please choose a target of relationship type.</div>
              )}
              <div
                className="button"
                onClick={() =>
                  removeSelectedNode(
                    context.target.id,
                    actions.RELATIONSHIP_ADD.SELECT_TARGET
                  )
                }
              >
                Remove
              </div>
            </div>
            <Divider />
          </div>
        )}
      </div>
      <div
        className={
          "section" +
          (context.action === actions.RELATIONSHIP_ADD.SELECT_SOURCES
            ? "-selected"
            : "")
        }
        onClick={() => switchSelect(actions.RELATIONSHIP_ADD.SELECT_SOURCES)}
      >
        <div className="section-header">Select a node as source:</div>
        {Object.keys(context.sources).length === 0 ? null : (
          <div>
            <Divider />
            {Object.entries(context.sources).map(([s, c]) => {
              return (
                <div>
                  <div className="selected-element">
                    <div>ID: {s}</div>
                    <div>Label: {getNode(c.type, s).text}</div>
                    <div>
                      <CardinalityChoices
                        value={c.cardinality}
                        onChange={(e) => setCardinality(s, e.target.value)}
                      />
                    </div>
                    <div
                      className="button"
                      onClick={() =>
                        removeSelectedNode(
                          s,
                          actions.RELATIONSHIP_ADD.SELECT_SOURCES
                        )
                      }
                    >
                      Remove
                    </div>
                  </div>
                  <Divider />
                </div>
              );
            })}
          </div>
        )}
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
