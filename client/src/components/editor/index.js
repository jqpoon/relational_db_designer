import { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Entity from "./nodes/entity";
import Toolbar from "./toolbar";
import "./stylesheets/editor.css";

const INITIAL_SCALE = 1.5;

function Editor() {
	// Passed to children for metadata (eg width and height of main container)
	const parentRef = useRef(null);
	// Nodes
	const [entities, setEntities] = useState([]);
	const [focus, setFocus] = useState(null);
	// Zoom and pan states
	const [panDisabled, setPanDisabled] = useState(false);
	const [scale, setScale] = useState(INITIAL_SCALE);

	// Add entity
	const addEntity = () => {
		const newEntity = {
			pos: {
				x: 75,
				y: 75,
			},
			text: "",
			focus: true,
		};
		setEntities([...entities, newEntity]);
	};
	// Set focus to entities each time
	useEffect(() => {
		// TODO: what happens when the action is delete?
		setFocus(entities.length - 1);
	}, [entities]);

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
		setPanDisabled(false);
	};

	const panProps = { disabled: panDisabled, excluded: ["input"] };

	return (
		<div className="editor">
			<Toolbar addEntity={addEntity} />
			<TransformWrapper
				panning={panProps}
				onZoomStop={(ref) => setScale(ref.state.scale)}
				doubleClick={{ disabled: true }}
				initialScale={INITIAL_SCALE}
			>
				<TransformComponent>
					<div
						className="dnd"
						onClick={() => {
							setFocus(null);
							setPanDisabled(false);
						}}
						ref={parentRef}
					>
						{entities.map((e, index) => (
							<Entity
								key={index}
								index={index}
								{...e}
								updatePos={updatePos}
								setPanDisabled={setPanDisabled}
								updateText={updateText}
								focus={focus}
								setFocus={setFocus}
								scale={scale}
								parentRef={parentRef}
							/>
						))}
					</div>
				</TransformComponent>
			</TransformWrapper>
		</div>
	);
}

export default Editor;
