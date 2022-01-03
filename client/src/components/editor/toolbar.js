import Draggable from "react-draggable";
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
																	user,
																	setUser,
																	erid,
																	setErid,
																	incrementCounter
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
    // console.log("id in addEntity" + newEntity.id);
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

	const createERD = async () => {
		try {
			const res = await axios.post(`/api/erd?Uid=${user}`, exportStateToObject());
			const erid = await res.data; 
			setErid(erid);
			incrementCounter();
			alert("ERD successfully created");
		} catch (error) {
			alert(error.response.data);
		}
	}

	const updateERD = async () => {
		try {
			console.log(exportStateToObject());
			const res = await axios.put(`/api/erd?Uid=${user}&ERid=${erid}`, exportStateToObject());
			const data = await res.data; 
			incrementCounter();
			alert(data);
		} catch (error) {
			alert(error.response.data);
		}
	}

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
        <div className="create-tool"><span class="grippy"></span> Entity</div>
      </Draggable>
      <Draggable
        ref={relationshipToolRef}
        onStop={(e, data) => {
          addRelationship(data.x - 125, data.y);
          relationshipToolRef.current.state.x = 0;
          relationshipToolRef.current.state.y = 0;
        }}
      >
        <div className="create-tool"><span class="grippy"></span>Relationship</div>
      </Draggable>
      <div className="footer">
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
          onClick={erid ? updateERD : createERD}
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
				<div className="tool" onClick={() => setUser(null)}>
					Log out
				</div>
      </div>
    </div>
  );
}
