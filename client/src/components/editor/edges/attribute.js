import { useRef, useState } from "react";
import Draggable from "react-draggable";
import Xarrow, { useXarrow } from 'react-xarrows';
import "./stylesheets/attribute.css"
import { types } from "../types";

export default function Attribute({
	id,
	text, // Attribute name
	relativePos, // Relative x, y position of attribute to parent node
	parentPos, // Position of parent node. If this field is null, then the parent's position will be obtained by going through list of entities/relationships
	start, // Id of the node this attribute should be joined to
	updateNode, // Generic update function for dict in editor.js
	getNode // Generic getter for dict in editor.js
}) {
	// TODO: maybe include scale in function arguments?

	// Name of attribute to be displayed
	const [name, setName] = useState(text);
	// Ref of lollipop end
	const attributeEndRef = useRef(null);

	// Calculate position of entity end
	const calculateEntityEndPos = () => {
		if (parentPos == null || parentPos.x == null || parentPos.y == null) {
			let parentNode = getNode(types.ENTITY, start); // assume only entities have attributes for now TODO: change to include other node types
			parentPos = { x: parentNode.pos.x, y: parentNode.pos.y };
		}
		return {x: parentPos.x + relativePos.x, 
				y: parentPos.y + relativePos.y};
	};

	let absolutePos = calculateEntityEndPos();
	console.log(absolutePos);

	// change style with transform(x, y) and re-render attribute
	var chosenStyle = { transform: `translate(${absolutePos.x}px, ${absolutePos.y}px)`,};

	/* Automatically adjusts text location based on where the arrow is. */
	let leftStyle = { transform: "translate(-110%, -6.5px)", display: "inline-block" };
	let rightStyle = { transform: "translate(20px, -6.5px)", display: "inline-block" };
	var textStyle = leftStyle;

	// if (absolutePos.x > parentPos.x) {
	// 	chosenStyle = leftStyle;
	// }

	let attributeEnd = (
		<div ref={attributeEndRef} 
			 className="attribute-end" 
			 style={chosenStyle}>
			<div style={textStyle}>
				{name}
			</div>
		</div>
	);

	let attribute = (
			<div>
				{attributeEnd}
				<Xarrow 
					start={start}
					end={attributeEndRef}
					path="straight"
					headSize="0"
					zIndex="-10"
            	/>
			</div>
		);

	return attribute;
}
