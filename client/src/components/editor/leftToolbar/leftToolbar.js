import Draggable from "react-draggable";
import { IconButton, Tooltip } from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ClearIcon from '@mui/icons-material/Clear';
import CachedIcon from '@mui/icons-material/Cached';
import SaveIcon from '@mui/icons-material/Save';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import RuleIcon from '@mui/icons-material/Rule';
import { types } from "../types";
import "./toolbar-left.css";
import { useRef, useState } from "react";
import { creates } from "../elementUtilities/elementFunctions";
import UploadTool from "../utilities/uploadTool";
import { submitHandler } from "../alerts/alert";

const categories = {
  ABOUT: "about",
  EDIT: "edit",
  FILE: "file",
};


function DragToCreate({ nodeType, addElement, setScrollable, scale }) {
  const ref = useRef(null);
  const createAndAdd = (e, data) => {
    const left = document
      .querySelector(".toolbar-left")
      .getBoundingClientRect();
    const right = document
      .querySelector(".toolbar-right")
      .getBoundingClientRect();
    const canvas = document.querySelector(".canvas").getBoundingClientRect();
    if (e.pageX > left.right && e.pageX < right.left) {
      // Create element if dropped in canvas
      const pos = {
        x: (e.pageX - canvas.left) / scale,
        y: (e.pageY - canvas.top) / scale,
      };
      addElement(nodeType, creates[nodeType](pos));
    }
    // Reset dragged element to original position
    const node = ref.current.state;
    node.x = 0;
    node.y = 0;
    // Reenable scrolling of toolbar
    setScrollable(true);
  };
  return (
    <Draggable
      ref={ref}
      onDrag={() => setScrollable(false)}
      onStop={createAndAdd}
    >
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
  // if(title === "Undo"){
  //   return (<Tooltip title={tooltip ? tooltip : ""} placement="bottom">
  //            <div className="edit-buttons left" onClick={action}>
  //              <UndoIcon style={{ fontSize: 35 }} />
  //           </div>
  //           </Tooltip>);
  // } else if(title === "Redo"){
  //   return (<Tooltip title={tooltip ? tooltip : ""} placement="bottom">
  //             <div className="edit-buttons" onClick={action}>
  //               <RedoIcon style={{ fontSize: 35 }} />
  //             </div>
  //            </Tooltip>);
  // } else if(title === "Clear"){
  //   return (<Tooltip title={tooltip ? tooltip : ""} placement="bottom">
  //             <div className="edit-buttons" onClick={action}>
  //                <ClearIcon style={{ fontSize: 35 }} />
  //             </div>
  //           </Tooltip>);
  // } else if(title === "Save"){
  //   return (<Tooltip title={tooltip ? tooltip : ""}     placement="bottom">
  //             <div className="file-buttons" onClick={action}>
  //                <SaveIcon style={{ fontSize: 35 }}/>
  //             </div>
  //           </Tooltip>);
  // } else if(title === "Load"){
  //   return (<Tooltip title={tooltip ? tooltip : ""}     placement="bottom">
  //   <div className="file-buttons" onClick={action}>
  //      <CachedIcon style={{ fontSize: 35 }} />
  //   </div>
  // </Tooltip>);
  // } else if(title === "Share"){
  //   return (<Tooltip title={tooltip ? tooltip : ""}     placement="bottom">
  //   <div className="file-buttons" onClick={action}>
  //      <ShareIcon style={{ fontSize: 35 }}/>
  //   </div>
  // </Tooltip>);
  // } else if(title === "Duplicate"){
  //   return (<Tooltip title={tooltip ? tooltip : ""}     placement="bottom">
  //   <div className="file-buttons" onClick={action}>
  //      <ContentCopyIcon style={{ fontSize: 35 }}/>
  //   </div>
  // </Tooltip>);
  // } else if(title === "Delete"){
  //   return (<Tooltip title={tooltip ? tooltip : ""}     placement="bottom">
  //   <div className="file-buttons" onClick={action}>
  //      <DeleteForeverIcon style={{ fontSize: 35 }}/>
  //   </div>
  // </Tooltip>);
  // } else if(title === "Validate"){
  //   return (<Tooltip title={tooltip ? tooltip : ""}     placement="bottom">
  //   <div className="file-buttons" onClick={action}>
  //      <RuleIcon style={{ fontSize: 35 }}/>
  //   </div>
  // </Tooltip>);
  // }
  return  (
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

const showAbout = (info, functions) => {
  return (
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
          <ClickAction
            title="Log out"
            action={functions.logout}
            tooltip="Log out"
          />
        </div>
      </div>

  )
}

const showEdit = (info, functions, setScrollable) => {
  return (
    <div className="group">
        <div className="group-header">Edit:</div>
        <div className="group-content">
          <DragToCreate
            nodeType={types.ENTITY}
            {...info}
            {...functions}
            setScrollable={setScrollable}
          />
          <DragToCreate
            nodeType={types.RELATIONSHIP}
            {...info}
            {...functions}
            setScrollable={setScrollable}
          />
        </div>
        <ClickAction title="Undo" action={functions.undo} tooltip="Undo" />
        <ClickAction title="Redo" action={functions.redo} tooltip="Redo" />
        <ClickAction
          title="Clear"
          action={functions.resetState}
          tooltip="Clear canvas. This cannot be undone."
        />
    </div>
  )
}

const showFile = (info, functions) =>{
  return (
    <div className="group" >
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
          submitHandler(functions.saveERD, "ERD will be saved")
        }
        tooltip="Save diagram to storage"
      />
       <ClickAction
        title="Validate"
        action={functions.exportToJSON}
        tooltip="Validate ER diagram"
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
      <UploadTool
        display={{ title: "Import", tooltip: "Import diagram from JSON" }}
        handleFile={functions.importFromJSON}
      />
      <ClickAction
        title="Export to JSON"
        action={functions.exportToJSON}
        tooltip="Export diagram to JSON"
      />
       <ClickAction
        title="Export to PNG"
        action={functions.exportToJSON}
        tooltip="Export diagram to PNG"
      />

      <ClickAction
        title="Translate"
        action={functions.translateERtoRelational}
        tooltip="Translate ERD to relational schema"
      />
      </div>
    </div>
  )
}

export default function LeftToolbar({ info, functions }) {
  const [scrollable, setScrollable] = useState(true);
  const [category, setCategory] = useState(categories.ABOUT);
  return (
    <div
      className="toolbar-left"
      // style={{ overflow: scrollable ? "scroll" : "visible" }}
      style={{overflow: "visible"}}
    >
      <div className="group" >
        <Tooltip title="Edit name of diagram" placement="right">
          <input
            className="section"
            value={info.name}
            onChange={(e) => functions.setName(e.target.value)}
          />
        </Tooltip>
      </div>
      <div className="outer">
      <div className="inner"><button class="button-2" onClick={() => {setCategory(categories.ABOUT)}} >About</button></div>
      <div className="inner"><button class="button-2" onClick={() => {setCategory(categories.FILE)}} >File</button></div>
      <div className="inner"><button class="button-2" onClick={() => {setCategory(categories.EDIT)}}>Edit</button></div>
      </div>

      {category === categories.ABOUT ? showAbout(info, functions) : (category === categories.EDIT ? showEdit(info, functions, setScrollable) : showFile(info, functions))}


      </div>
  );
}
