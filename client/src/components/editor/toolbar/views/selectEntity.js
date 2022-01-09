import { IconButton, Tooltip } from "@mui/material";
import { MdClear } from "react-icons/md";
import "../toolbar.css";
import { actions, types } from "../../types";
import { Attributes } from "../components/attributes";
import { Name } from "../components/name";
import { Relationships } from "../components/relationships";
import { GeneralisationAndSubsets } from "../components/subsets";
import { Supersets } from "../components/supersets";

export function SelectEntity({ entity, functions, ctx }) {
  const saveChanges = (change) => functions.saveChanges(entity, change);

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
      <hr className="divider"/>
      {/* Name */}
      <div className="toolbar-section">
        <h4 className="toolbar-section-header">Name</h4>
        <Name name={entity.text} saveChanges={saveChanges} />
      </div>
      <hr className="divider"/>
      {/* Attributes */}
      <div className="toolbar-section">
        <Attributes
          parent={{ parentId: entity.id, parentType: entity.type }}
          attributes={Object.values(entity.attributes)}
          functions={functions}
        />
      </div>
      <hr className="divider"/>
      {/* Relationships */}
      <div className="toolbar-section">
        <Relationships
          ctx={ctx}
          selected={entity}
          relationships={relationships}
          functions={functions}
        />
      </div>
      <hr className="divider"/>
      {/* Supersets */}
      <div className="toolbar-section">
        <Supersets parents={parents} ctx={ctx} functions={functions} />
      </div>
      <hr className="divider"/>
      {/* Subsets */}
      <div className="toolbar-section">
        <GeneralisationAndSubsets
          parent={entity}
          generalisations={Object.values(entity.generalisations)}
          directChildren={children}
          ctx={ctx}
          functions={functions}
        />
      </div>
      <hr className="divider"/>

    </div>
  );
}
