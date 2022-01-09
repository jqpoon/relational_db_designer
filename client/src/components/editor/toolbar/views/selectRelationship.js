import { IconButton, Tooltip } from "@mui/material";
import { MdClear } from "react-icons/md";
import "../toolbar.css";
import { actions, types } from "../../types";
import { Attributes } from "../components/attributes";
import { Name } from "../components/name";
import { Relationships } from "../components/relationships";

export default function SelectRelationship({ ctx, relationship, functions }) {
  const saveChanges = (change) => functions.saveChanges(relationship, change);

  return (
    <div className="toolbar-right" style={{ padding: "5px 5px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Tooltip title="Delete this relationship" placement="left">
          <IconButton
            onClick={() => {
              functions.deleteElement(types.RELATIONSHIP, relationship);
              functions.setContext({ actions: actions.NORMAL });
            }}
          >
            <MdClear />
          </IconButton>
        </Tooltip>
        <h3 className="toolbar-header">Relationship</h3>
      </div>
      <hr className="divider"/>


      {/* Name */}
      <div className="toolbar-section">
        <h4 className="toolbar-section-header">Name</h4>
        <Name name={relationship.text} saveChanges={saveChanges} />
      </div>
      <hr className="divider"/>


      {/* Attributes */}
      <div className="toolbar-section">
        <Attributes
          parent={{ parentId: relationship.id, parentType: relationship.type }}
          attributes={Object.values(relationship.attributes)}
          functions={functions}
        />
      </div>
      <hr className="divider"/>
      
      {/* Relationships */}
      <div className="toolbar-section">
        <Relationships
          ctx={ctx}
          selected={relationship}
          relationships={Object.keys(relationship.edges)}
          functions={functions}
        />
      </div>
      <hr className="divider"/>

    </div>
  );
}
