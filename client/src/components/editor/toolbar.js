import "./stylesheets/toolbar.css";

export default function Toolbar({ addEntity }) {
	return (
		<div className="toolbar">
			<p className="tool" onClick={addEntity}>
				Entity
			</p>
		</div>
	);
}
