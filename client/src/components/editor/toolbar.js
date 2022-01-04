import Draggable from "react-draggable";
import axios from "axios";
import {useRef, useState} from "react";
import {types} from "./types";
import {getId} from "./idGenerator";
import { confirmAlert } from 'react-confirm-alert';
import "./stylesheets/toolbar.css";
import UploadTool from "./utilities/uploadTool";

export default function Toolbar({
                                  addEdgeToRelationship,
                                  addElement,
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

	const saveSubmit = (cb) => {
		confirmAlert({
      title: "Confirmation",
      message: "ERD will be saved",
      buttons: [
        {
          label: 'Yes',
          onClick: () => cb()
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
						erid ? saveSubmit(updateERD) : saveSubmit(createERD)
					}}>
	          Save
	        </div>
					<div className="clickable tool" onClick={share}>
	          Share
	        </div>
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
					<div className="clickable tool" onClick={() => setUser(null)}>
						Log out
					</div>
	      </div>
	    </div>
		</>
  );
}
