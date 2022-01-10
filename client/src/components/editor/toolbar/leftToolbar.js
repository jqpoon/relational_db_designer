/*
	TABLE OF CONTENTS

	1. Imports
	2. Name constants
	3. Drag-and-drop component
	4. Action component	
	5. Category display
	6. Left toolbar component
*/

// **********
// 1. Imports
// **********

import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { Tooltip } from "@mui/material";
import { types } from "../types";
import { creates } from "../elements/elementFunctions";
import UploadTool from "../utilities/uploadTool";
import { notificationHandler, submitHandler } from "../utilities/alert";
import "./toolbar.css";

// *****************
// 2. Name constants
// *****************

const categories = {
	ABOUT: "about",
	EDIT: "edit",
	FILE: "file",
};

// **************************
// 3. Drag-and-drop component
// **************************

function DragToCreate({ nodeType, addElement, scale }) {
	const ref = useRef(null);

	const createAndAdd = (e, data) => {
		const left = document.querySelector(".toolbar-left").getBoundingClientRect();
		const right = document.querySelector(".toolbar-right")?.getBoundingClientRect();
		const canvas = document.querySelector(".canvas").getBoundingClientRect();
		if (e.pageX > left.right && (!right || e.pageX < right.left)) {
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
	};

	return (
		<Draggable ref={ref} onStop={createAndAdd}>
			<Tooltip title={`Drag to create new ${nodeType}`} placement="right">
				<div className="action drag-to-create">
					<div style={{ textOverflow: "clip" }}>+</div>
					<div>{nodeType[0].toUpperCase() + nodeType.slice(1)}</div>
				</div>
			</Tooltip>
		</Draggable>
	);
}

// *******************
// 4. Action component
// *******************

export function ClickAction({ title, action, tooltip }) {
	return (
		<Tooltip title={tooltip ? tooltip : ""} placement="right">
			<div className="action click-action" onClick={action}>
				{title}
			</div>
		</Tooltip>
	);
}

// *******************
// 5. Category display
// *******************

const showUid = (user) => {
	notificationHandler(
		"Success",
		`Your User ID is '${user}'. It can be used to directly interact with the API. Please keep it safe and do not share it with others.`
	);
};

const showERid = (name, erid) => {
	notificationHandler("Success", `The ID of '${name}' is ${erid}`);
};

const showAbout = (info, functions) => {
	return (
		<div className="group">
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
	);
};

const showEdit = (info, functions) => {
	return (
		<div className="group">
			<div className="group-content">
				<DragToCreate nodeType={types.ENTITY} {...info} {...functions} />
				<DragToCreate nodeType={types.RELATIONSHIP} {...info} {...functions} />
			</div>
			<ClickAction title="Undo" action={functions.undo} tooltip="Undo" />
			<ClickAction title="Redo" action={functions.redo} tooltip="Redo" />
			<ClickAction
				title="Clear"
				action={functions.resetState}
				tooltip="Clear canvas. This cannot be undone."
			/>
		</div>
	);
};

const showFile = (info, functions) => {
	return (
		<div className="group">
			<div className="group-content">
				<ClickAction
					title="Load"
					action={functions.loadERD}
					tooltip="Load an diagram from storage"
				/>
				<ClickAction
					title="Save"
					action={() => submitHandler(functions.saveERD, "ERD will be saved")}
					tooltip="Save diagram to storage"
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
								submitHandler(functions.duplicateERD, "Diagram will be duplicated")
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
					action={functions.exportToPNG}
					tooltip="Export diagram to PNG"
				/>
				<ClickAction
					title="Translate"
					action={functions.translateERtoRelational}
					tooltip="Translate ERD to relational schema"
				/>
			</div>
		</div>
	);
};

// *************************
// 6. Left toolbar component
// *************************

export default function LeftToolbar({ info, functions }) {
	const [category, setCategory] = useState(categories.ABOUT);

	return (
		<div className="toolbar-left">
			<div>
				<div className="group">
					<label>
						ERD Name
						<Tooltip title="Edit name of diagram" placement="right">
							<input
								type="text"
								className="action"
								value={info.name}
								placeholder="Enter name"
								onChange={(e) => functions.setName(e.target.value)}
							/>
						</Tooltip>
					</label>
				</div>
				<div className="outer">
					<div className="inner">
						<button
							className={`${category === categories.ABOUT ? "active " : ""}button-2`}
							onClick={() => setCategory(categories.ABOUT)}
						>
							About
						</button>
					</div>
					<div className="inner">
						<button
							className={`${category === categories.FILE ? "active " : ""}button-2`}
							onClick={() => setCategory(categories.FILE)}
						>
							File
						</button>
					</div>
					<div className="inner">
						<button
							className={`${category === categories.EDIT ? "active " : ""}button-2`}
							onClick={() => setCategory(categories.EDIT)}
						>
							Edit
						</button>
					</div>
				</div>

				{category === categories.ABOUT
					? showAbout(info, functions)
					: category === categories.EDIT
					? showEdit(info, functions)
					: showFile(info, functions)}
			</div>

			<a
				className="bug-report"
				href="https://docs.google.com/forms/d/e/1FAIpQLSeCgKZ7te-xfGc7XBNCFRVLWlVe6ryma-fQUGvBHnOOiSK8rQ/viewform"
				rel="noreferrer"
				target="_blank"
			>
				Found a bug? Let us know.
			</a>
		</div>
	);
}
