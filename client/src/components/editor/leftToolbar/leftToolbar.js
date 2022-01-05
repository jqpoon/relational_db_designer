import Draggable from "react-draggable";
import { Tooltip } from "@mui/material";
import { types } from "../types";

import "./toolbar-left.css";
import { useRef } from "react";
import { creates } from "../elementUtilities/elementFunctions";
import UploadTool from "../utilities/uploadTool";

function DragToCreate({ nodeType, addElement }) {
  const ref = useRef(null);
  const createAndAdd = (e, data) => {
    const canvas = document.querySelector(".canvas");
    const bounds = canvas.getBoundingClientRect();
    if (
      e.pageX > bounds.left &&
      e.pageX < bounds.right &&
      e.pageY > bounds.top &&
      e.pageY < bounds.bottom
    ) {
      // Create element if dropped in canvas
      const pos = { x: data.x - 125, y: data.y };
      addElement(nodeType, creates[nodeType](pos));
    }
    // Reset dragged element to original position
    const node = ref.current.state;
    node.x = 0;
    node.y = 0;
  };
  return (
    <Draggable ref={ref} onStop={createAndAdd}>
      <Tooltip title={`Drag to create new ${nodeType}`}>
        <div className="section drag-to-create">
          <div style={{ textOverflow: "clip" }}>+</div>
          <div>{nodeType[0].toUpperCase() + nodeType.slice(1)}</div>
        </div>
      </Tooltip>
    </Draggable>
  );
}

export function ClickAction({ title, action, tooltip }) {
  return (
    <Tooltip title={tooltip ? tooltip : ""}>
      <div className="section click-action" onClick={action}>
        {title}
      </div>
    </Tooltip>
  );
}

export default function LeftToolbar(functions) {
  return (
    <div className="toolbar-left">
      <div className="group">
        <DragToCreate nodeType={types.ENTITY} {...functions} />
        <DragToCreate nodeType={types.RELATIONSHIP} {...functions} />
      </div>
      <div className="group">
        <ClickAction
          title="Load"
          action={functions.loadSchemaFromBackEnd}
          tooltip="Load schema from storage"
        />
        <ClickAction
          title="Save"
          action={functions.saveSchemaToBackEnd}
          tooltip="Save schema to storage"
        />
        <ClickAction
          title="Translate"
          action={functions.translateERtoRelational}
          tooltip="Translate ER schema to relational schema"
        />
        <UploadTool
          display={{ title: "Import", tooltip: "Import diagram from JSON" }}
          handleFile={functions.importFromJSON}
        />
        <ClickAction
          title="Export"
          action={functions.exportToJSON}
          tooltip="Export diagram to JSON"
        />
        <ClickAction title="Undo" action={functions.undo} />
        <ClickAction title="Redo" action={functions.redo} />
        <ClickAction title="Log out" action={functions.logout} />
      </div>
    </div>
  );
}
