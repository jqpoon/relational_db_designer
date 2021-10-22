import { useState } from "react";
import Entity from "./nodes/entity";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";

function Editor() {
	const [entities, setEntities] = useState([]);
	const [focus, setFocus] = useState(null);

	// Add entity
	const addEntity = () => {
		const newEntity = {
			pos: {
				x: 50,
				y: 250,
			},
			text: "",
		};
		setEntities([...entities, newEntity]);
	};

	// Update position of entity
	const updatePos = (data, index) => {
		let newEntities = [...entities];
		newEntities[index].pos = { x: data.x, y: data.y };
		setEntities(newEntities);
	};

	// Update text in entity
	const updateText = (text, index) => {
		let newEntities = [...entities];
		newEntities[index].text = text;
		setEntities(newEntities);
		setFocus(null);
	};

	// Blurs if some entity is in focus
	const blurStyle =
		focus !== null ? { filter: "blur(5px) brightness(75%)" } : null;

	return (
		<>
			<Toolbar addEntity={addEntity} />
			<div
				className="dnd"
				style={blurStyle}
				onClick={() => setFocus(null)}
			>
				{entities.map((e, index) => (
					<Entity
						key={index}
						index={index}
						{...e}
						updatePos={updatePos}
						setFocus={setFocus}
					/>
				))}
			</div>
			{focus !== null ? (
				<Entity
					index={focus}
					{...entities[focus]}
					editable
					updateText={updateText}
				/>
			) : null}
		</>
	);
}

export default Editor;
