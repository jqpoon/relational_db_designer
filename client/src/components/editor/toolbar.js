import Draggable from "react-draggable";
import axios from "axios";
import { useRef } from "react";
import { types } from "./types";
import { getId } from "./idGenerator";
import "./stylesheets/toolbar.css";

export default function Toolbar({
	addEdgeToRelationship,
	addElement,
	exportStateToObject,
	importStateFromObject,
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
      attributes: {},
      edges: {},
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
				<div className="create-tool">
					<span class="grippy"></span> Entity{" "}
				</div>
			</Draggable>
			<Draggable
				ref={relationshipToolRef}
				onStop={(e, data) => {
					addRelationship(data.x - 125, data.y);
					relationshipToolRef.current.state.x = 0;
					relationshipToolRef.current.state.y = 0;
				}}
			>
				<div className="create-tool">
					<span class="grippy"></span>Relationship
				</div>
			</Draggable>
			<div className="tool" onClick={addEdgeToRelationship}>
				Connect to Relationship
			</div>
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
				<div className="tool">Translate</div>
				<div className="tool">Validate</div>
			</div>
		</div>
	);
}
