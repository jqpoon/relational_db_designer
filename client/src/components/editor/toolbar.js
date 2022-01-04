import Draggable from "react-draggable";
import { Tooltip } from '@mui/material';
import axios from "axios";
import {useRef} from "react";
import {types} from "./types";
import {getId} from "./idGenerator";
import "./stylesheets/toolbar.css";
import UploadTool from "./utilities/uploadTool";

export default function Toolbar({
                                  addEdgeToRelationship,
                                  addElement,
                                  importStateFromObject,
                                  exportStateToObject,
                                  uploadStateFromObject,
                                  downloadStateAsObject,
                                  translate,
                                  undo,
                                  redo,
                                }) {
  const entityToolRef = useRef(null);
  const relationshipToolRef = useRef(null);

  const addEntity = (x, y) => {
    const newEntity = {
      id: getId(types.ENTITY),
      pos: {
        x: x,
        y: y,
      },
      text: "Enter Text",
      type: types.ENTITY,
      isWeak: [],
      edges: {},
      attributes: {},
      generalisations: {},
    };
    console.log("x:" + x);
    console.log("y:" + y);
    addElement(types.ENTITY, newEntity);
  };

  const addRelationship = (x, y) => {
    const newRelationship = {
      id: getId(types.RELATIONSHIP),
      pos: {
        x: x,
        y: y,
      },
      text: "",
      type: types.RELATIONSHIP,
      edges: {},
      attributes: {},
    };
    addElement(types.RELATIONSHIP, newRelationship);
  };

  return (
    <div className="toolbar">

      <Draggable
        ref={entityToolRef}
        onStop={(e, data) => {
          addEntity(data.x - 125, data.y);
          entityToolRef.current.state.x = 0;
          entityToolRef.current.state.y = 0;
        }}
      >
        <Tooltip title="Drag to create new entity">
        <div className="create-tool"><span class="grippy"></span> Entity</div>
        </Tooltip>
      </Draggable>

      <Draggable
        ref={relationshipToolRef}
        onStop={(e, data) => {
          addRelationship(data.x - 125, data.y);
          relationshipToolRef.current.state.x = 0;
          relationshipToolRef.current.state.y = 0;
        }}
      >
         <Tooltip title="Drag to create new relationship">
        <div className="create-tool"><span class="grippy"></span>Relationship</div>
        </Tooltip>
      </Draggable>
      <div className="footer"></div>
        <div className="tool" onClick={undo}>
          Undo
        </div>
        <div className="tool" onClick={redo}>
          Redo
        </div>
        <div
          className="tool"
          onClick={() => {
            axios
              .get("/schema/all")
              .then(function (response) {
                importStateFromObject(response.data);
              })
              .catch(function (error) {
                console.log(error);
              });
          }}
        >
          Load
        </div>
        <div
          className="tool"
          onClick={() => {
            axios
              .post("/schema/all", exportStateToObject())
              .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.log(error);
              });
          }}
        >
          Save
        </div>
        <div className="tool" onClick={() => {
          axios
            .post('/translation/translate', exportStateToObject())
            .then(function (response) {
              translate(response.data);
            })
            .catch(function (error) {
              console.log(error);
            })
        }}
        >
          Translate
        </div>
        <div className="tool">Validate</div>
        <UploadTool text="Import JSON file" handleFile={uploadStateFromObject} />
        <div className="tool" onClick={downloadStateAsObject}>
          Export JSON file
        </div>

    </div>
  );
}
