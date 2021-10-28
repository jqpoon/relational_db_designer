import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import "./stylesheets/entity.css";

export default function Entity({
	index,
	text,
	updateText,
	pos,
	updatePos,
	focus,
	setFocus,
	scale,
	setPanDisabled,
	parentRef,
}) {
	const entityRef = useRef(null);
	const [value, setValue] = useState(text);
	// To set bounds of draggable
	const [dimensions, setDimensions] = useState({});

	// Run on mount
	useEffect(() => {
		const entityCurr = entityRef.current;
		setDimensions({
			width: entityCurr.clientWidth,
			height: entityCurr.clientHeight,
		});
		const handler = (e) => {
			e.preventDefault();
			setFocus(index);
		};
		// Right click
		entityCurr?.addEventListener("contextmenu", handler);
		return () => {
			entityCurr?.removeEventListener("contextmenu", handler);
		};
	}, []);

	// Highlight if selected
	const border =
		focus === index
			? {
					border: "2px solid orange",
			  }
			: null;

	return (
		<Draggable
			nodeRef={entityRef}
			defaultPosition={pos}
			onMouseDown={() => setPanDisabled(true)}
			onStop={(e, data) => {
				updatePos(data, index);
				setPanDisabled(false);
			}}
			scale={scale}
			bounds={{
				left: 5,
				top: 5,
				right: parentRef.current.clientWidth - dimensions.width - 5,
				bottom: parentRef.current.clientHeight - dimensions.height - 5,
			}}
		>
			<div className="entity" style={border} ref={entityRef}>
				{focus === index ? (
					<div className="entity-input">
						<input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									updateText(value, index);
								}
							}}
						/>
					</div>
				) : (
					value
				)}
			</div>
		</Draggable>
	);
}
