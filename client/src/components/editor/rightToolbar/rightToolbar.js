import { actions, types } from "../types";
import "../toolbar.css";
import { Load } from "./views/load";
import { Name } from "./components/name";
import { Attributes } from "./components/attributes";
import { IconButton, Tooltip } from "@mui/material";
import { MdClear } from "react-icons/md";
import { Relationships } from "./components/relationships";
import { Supersets } from "./components/supersets";
import { Subsets } from "./components/subsets";

function EntitySelected({ entity, functions, ctx }) {
  const saveChanges = (change) => functions.saveChanges(entity, change);
  if (!entity) {
    functions.setContext({ action: actions.NORMAL }); // todo: replace with back to normal
    return null;
  }

  // Split edges into relevant groups
  let relationships = [];
  let parents = [];
  let children = [];
  Object.entries(entity.edges).forEach(([id, { type }]) => {
    switch (type) {
      case types.EDGE.RELATIONSHIP:
        relationships.push(id);
        break;
      case types.EDGE.HIERARCHY:
        // TODO: add null check?
        const isParent = functions.getElement(type, id).parent === entity.id;
        const group = isParent ? children : parents;
        group.push(id);
        break;
      default:
        console.log(`Error: Invalid edge type "${type}"`);
    }
  });

  return (
    <div className="toolbar-right" style={{ padding: "5px 5px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Tooltip title="Delete this entity" placement="left">
          <IconButton
            onClick={() => {
              functions.deleteElement(types.ENTITY, entity);
              functions.setContext({ actions: actions.NORMAL });
            }}
          >
            <MdClear />
          </IconButton>
        </Tooltip>
        <h3 className="toolbar-header">Entity</h3>
      </div>
      {/* TODO: delete entity */}
      {/* Name */}
      <div className="toolbar-section">
        <h4 className="toolbar-section-header">Name</h4>
        <Name name={entity.text} saveChanges={saveChanges} />
      </div>
      {/* Attributes */}
      <div className="toolbar-section">
        <Attributes
          parent={{ parentId: entity.id, parentType: entity.type }}
          attributes={Object.values(entity.attributes)}
          functions={functions}
        />
      </div>
      {/* Relationships */}
      <div className="toolbar-section">
        <Relationships
          ctx={ctx}
          selected={entity}
          relationships={relationships}
          functions={functions}
        />
      </div>
      {/* Supersets */}
      <div className="toolbar-section">
        <Supersets parents={parents} ctx={ctx} functions={functions} />
      </div>
      {/* Subsets */}
      <div className="toolbar-section">
        <Subsets
          parent={entity}
          generalisations={Object.values(entity.generalisations)}
          directChildren={children}
          ctx={ctx}
          functions={functions}
        />
      </div>
    </div>
  );
}

export function RightToolbar({ context, user, functions }) {
  switch (context.action) {
    case actions.SELECT.NORMAL:
    case actions.SELECT.ADD_RELATIONSHIP:
    case actions.SELECT.ADD_SUPERSET:
    case actions.SELECT.ADD_SUBSET:
      const node = functions.getElement(
        context.selected.type,
        context.selected.id,
        context.selected.parent
      );
      switch (context.selected.type) {
        case types.ENTITY:
          return (
            <EntitySelected entity={node} functions={functions} ctx={context} />
          );
        default:
          return null;
      }
    case actions.LOAD:
      return <Load user={user} {...functions} />;
    default:
      return null;
  }
}
