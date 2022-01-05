import Draggable from "react-draggable";
import { Tooltip } from "@mui/material";
import axios from "axios";
import {useRef} from "react";
import {types} from "./types";
import {getId} from "./idGenerator";
import { confirmAlert } from 'react-confirm-alert';
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
																	name,
																	setName,
																	erid,
																	setErid,
																	counter,
																	setCounter,
																	load,
																	share,
																	resetState,
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

	const submitHandler = (cb, message) => {
		confirmAlert({
      title: "Confirmation",
      message,
      buttons: [
        {
          label: 'Yes',
          onClick: cb
        },
        {
          label: 'No',
        }
      ]
    });
	}

	const createERD = async () => {
		try {
			const res = await axios.post(`/api/erd?Uid=${user}`, exportStateToObject());
			const erid = await res.data; 
			setErid(erid);
			setCounter(counter => counter + 1);
			alert("ERD successfully created");
		} catch (error) {
			alert(error.response.data);
		}
	}

	const updateERD = async () => {
		try {
			const res = await axios.put(`/api/erd?Uid=${user}&ERid=${erid}`, exportStateToObject());
			const data = await res.data; 
			setCounter(counter => counter + 1);
			alert(data);
		} catch (error) {
			alert(error.response.data);
		}
	}

	const duplicate = async () => {
		try {
			const obj = exportStateToObject();
			obj["name"] = "Copy of " + obj["name"];
			const res = await axios.post(`/api/collab/create-duplicate?Uid=${user}&ERid=${erid}`, obj);
			const duplicatedErid = await res.data;
			obj["erid"] = duplicatedErid;
			importStateFromObject(obj);
			alert("ERD has been succesfully duplicated and loaded");
		} catch (error) {
			alert(error.response.data);
		}
	}

	const cloudDelete = async () => {
		try {
			const res = await axios.delete(`/api/erd?Uid=${user}&ERid=${erid}`);
			resetState();
			alert(res.data);
		} catch (error) {
			alert(error.response.data);
		}
	}

	const showUid = () => {
		alert(`Your User ID is '${user}'. It can be used to directly interact with the API. Please keep it safe and do not share it with others.`);
	}

	const showERid = () => {
		alert(`The ID of '${name}' is ${erid}`);
	}

  return (
		<>
	    <div className="toolbar">
				<div>
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
				</div>
	      <div className="footer">
					<input className="tool" value={name} onChange={(e) => setName(e.target.value)}/>
	        <div className="clickable tool" onClick={undo}>
	          Undo
	        </div>
	        <div className="clickable tool" onClick={redo}>
	          Redo
	        </div>
	        <div className="clickable tool" onClick={load}>
	          Load
	        </div>
	        <div className="clickable tool" onClick={() => {
						erid 
							? submitHandler(updateERD, "ERD will be saved")
							: submitHandler(createERD, "ERD will be saved")
					}}>
	          Save
	        </div>
					{erid ? 
						<div className="clickable tool" onClick={share}>
		          Share
		        </div>
					: null}
					{erid ? 
						<div className="clickable tool" onClick={
							() => submitHandler(duplicate, "ERD will be duplicated")
						}>
							Duplicate
						</div>
					: null}
					<div className="clickable tool" onClick={
						() => submitHandler(resetState, "Canvas will be cleared. This cannot be undone.")
					}>
						Clear
					</div>
					{erid ? 
						<div className="clickable tool" onClick={
							() => submitHandler(cloudDelete, "ERD will be deleted from cloud storage. This cannot be undone.")
						}>
							Delete
						</div>
					: null}
	        <div className="clickable tool" onClick={() => {
						axios
						.post('/api/translation/translate', exportStateToObject())
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
	        <div className="clickable tool">Validate</div>
	        <UploadTool text="Import JSON file" handleFile={uploadStateFromObject} />
	        <div className="clickable tool" onClick={downloadStateAsObject}>
	          Export JSON file
	        </div>
					<div className="clickable tool" onClick={showUid}>
	          Show User ID
	        </div>
					{erid ? 
						<div className="clickable tool" onClick={showERid}>
		          Show ERD ID
		        </div>
					: null}
					<div className="clickable tool" onClick={() => setUser(null)}>
						Log out
					</div>
	      </div>
	    </div>
		</>
  );
}
