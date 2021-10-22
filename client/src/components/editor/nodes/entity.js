import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import "./stylesheets/entity.css";

export default function Entity({
	index,
	pos,
	text,
	editable,
	updatePos,
	setFocus,
	updateText,
}) {
	const entityRef = useRef(null);
	const [value, setValue] = useState(text);

	// Event listener for context menu
	useEffect(() => {
		const entityCurr = entityRef.current;
		const handler = (e) => {
			e.preventDefault();
			setFocus(index);
		};
		entityCurr.addEventListener("contextmenu", handler);
		return () => {
			entityCurr.removeEventListener("contextmenu", handler);
		};
	}, []);

	// If editable, it's a pop up
	const style = editable
		? {
				position: "absolute",
				top: 0,
				left: document.documentElement.clientWidth * 0.1,
				transform: `translate(${pos.x}px, ${pos.y}px)`,
		  }
		: null;

	let entity = (
		<div className="entity" style={style} ref={entityRef}>
			{editable ? (
				<div className="entity-input">
					<input
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<button onClick={(e) => updateText(value, index)}>
						Save
					</button>
				</div>
			) : (
				text
			)}
		</div>
	);

	if (!editable) {
		entity = (
			<Draggable
				nodeRef={entityRef}
				defaultPosition={pos}
				onStop={(e, data) => {
					updatePos(data, index);
				}}
			>
				{entity}
			</Draggable>
		);
	}

	return entity;
}
