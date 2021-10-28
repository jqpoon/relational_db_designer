import { useRef, useState } from "react";
import Draggable from "react-draggable";
import Xarrow, { useXarrow } from 'react-xarrows';
import "./stylesheets/attribute.css"

export default function Attribute({
	index, // Index of attribute in attribute list
	pos, // x, y position of attribute
	entityRef, // Reference to entity this attribute should be joined to
	text, // Attribute name
	updatePos, // Callback function to update position of attribute
	updateText // Callback function to update attribute name
}) {

	const [attributeName, setAttributeName] = useState(text);
	const attributeEndRef = useRef(null);
	const attributeStartRef = useRef(null);
	const updateXarrow = useXarrow();

	/* Hacky way of extracting the x, y coordinates from entityRef!
	   Relies on entity node using `translate({x}px, {y}px)` to define
	   its position.
	*/
	// TODO: put into function
	var attributeCurrent = attributeStartRef.current
	if (attributeCurrent != null) {
		const regex = /([0-9]+)px, ?([0-9]+)px/;
		const found = attributeStartRef.current.style.transform.match(regex);
		if (found == null) {
			console.error("Entity not using translate({x}px, {y}px) to define position anymore! Check attribute.js.")
		} else {
			var entityX = found[1];
			var entityY = found[2];
		}
	}

	/* Automatically adjusts text location based on where the arrow is. */
	let leftStyle = { transform: "translate(-110%, -6.5px)", display: "inline-block" };
	let rightStyle = { transform: "translate(20px, -6.5px)", display: "inline-block" };

	var chosenStyle = rightStyle;

	if (entityX > pos.x) {
		chosenStyle = leftStyle;
	}

	let attributeEnd = (
		<Draggable
			onDrag={updateXarrow}
			onStop={updateXarrow}
			onStop={(e, data) => {
				updatePos(data, index);
			}}
			>
			<div ref={attributeEndRef} className="attribute-end" >
				<div style={chosenStyle}>
					end
				</div>
			</div>
		</Draggable>
	);

	let attributeStart = (
		<Draggable
			onDrag={updateXarrow}
			onStop={updateXarrow}>
			<div ref={attributeStartRef} className="attribute-start">
				<div style={chosenStyle}>
					startsssssssssssssss
				</div>
			</div>
		</Draggable>
	);

	let attribute = (
			<div>
				{attributeStart}
				{attributeEnd}
				<Xarrow 
					start={attributeStartRef}
					end={attributeEndRef}
					path="straight"
            	/>
			</div>
		);

	return attribute;
}
