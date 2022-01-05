import Draggable from "react-draggable";
import { Tooltip } from "@mui/material";
import { types } from "../types";

import "./toolbar-left.css";
import { useRef } from "react";
import { creates } from "../elementUtilities/elementFunctions";
import UploadTool from "../utilities/uploadTool";
import { submitHandler } from "../alerts/alert";

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
      <Tooltip title={`Drag to create new ${nodeType}`} placement="right">
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
    <Tooltip title={tooltip ? tooltip : ""} placement="right">
      <div className="section click-action" onClick={action}>
        {title}
      </div>
    </Tooltip>
  );
}

const showUid = (user) => {
  alert(
    `Your User ID is '${user}'. It can be used to directly interact with the API. Please keep it safe and do not share it with others.`
  );
};

const showERid = (name, erid) => {
  alert(`The ID of '${name}' is ${erid}`);
};

export default function LeftToolbar({ info, functions }) {
  return (
    <div className="toolbar-left">
      <div className="group">
        <Tooltip title="Edit name of diagram" placement="right">
          <input
            className="section"
            value={info.name}
            onChange={(e) => functions.setName(e.target.value)}
          />
        </Tooltip>
      </div>
      <div className="group">
        <div className="group-header">File:</div>
        <div className="group-content">
          <ClickAction
            title="Load"
            action={functions.loadERD}
            tooltip="Load an diagram from storage"
          />
          <ClickAction
            title="Save"
            action={() =>
              submitHandler(functions.saveERDToBackEnd, "ERD will be saved")
            }
            tooltip="Save diagram to storage"
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
          <ClickAction
            title="Translate"
            action={functions.translateERtoRelational}
            tooltip="Translate ERD to relational schema"
          />

          {info.erid ? (
            <>
              <ClickAction
                title="Share"
                action={functions.shareERD}
                tooltip="Share access to diagram"
              />
              <ClickAction
                title="Duplicate"
                action={() =>
                  submitHandler(
                    functions.duplicateERD,
                    "Diagram will be duplicated"
                  )
                }
                tooltip="Duplicate ERD"
              />
              <ClickAction
                title="Delete"
                action={() =>
                  submitHandler(
                    functions.deleteERD,
                    "ERD will be deleted from cloud storage. This cannot be undone."
                  )
                }
                tooltip="Delete diagram from storage"
              />
            </>
          ) : null}
        </div>
      </div>
      <div className="group">
        <div className="group-header">Edit:</div>
        <div className="group-content">
          <DragToCreate nodeType={types.ENTITY} {...functions} />
          <DragToCreate nodeType={types.RELATIONSHIP} {...functions} />
        </div>
        <ClickAction title="Undo" action={functions.undo} tooltip="Undo" />
        <ClickAction title="Redo" action={functions.redo} tooltip="Redo" />
        <ClickAction
          title="Clear"
          action={functions.resetState}
          tooltip="Clear canvas. This cannot be undone."
        />
      </div>
      <div className="group">
        <div className="group-header">About:</div>
        <div className="group-content">
          <ClickAction
            title="User ID"
            action={() => showUid(info.user)}
            tooltip="Show your user ID"
          />
          <ClickAction
            title="ERD ID"
            action={() => showERid(info.name, info.erid)}
            tooltip="Show ID of diagram"
          />
          <ClickAction title="Log out" action={functions.logout} tooltip="Log out" />
        </div>
      </div>
    </div>
  );
}
