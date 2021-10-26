import "./stylesheets/toolbar.css";

export default function Toolbar({ addEntity, addRelationship }) {
	return (
		<div className="toolbar">
			<p className="tool" onClick={addEntity}>
				Entity
			</p>
			<p className="tool" onClick={addRelationship}>
				Relationship
			</p>
		</div>
	);
}
