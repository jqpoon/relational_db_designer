import { IconButton, Tooltip } from "@mui/material";
import { MdClear } from "react-icons/md";
import { actions, types } from "../../types";
import { Name } from "../components/name";
import { Subsets } from "../components/subsets";

export default function SelectGeneralisation({ generalisation, ctx, functions }) {
	const saveChanges = (change) => functions.saveChanges(generalisation, change);
	const parent = functions.getElement(types.ENTITY, generalisation.parent.id);

	return (
		<div className="toolbar-right" style={{ padding: "5px 5px" }}>
			<div style={{ display: "flex", alignItems: "center" }}>
				<Tooltip title="Delete this generalisation" placement="left">
					<IconButton
						onClick={() => {
							functions.deleteElement(types.GENERALISATION, generalisation);
							functions.setContext({ actions: actions.NORMAL });
						}}
					>
						<MdClear />
					</IconButton>
				</Tooltip>
				<h3 className="toolbar-header">Generalisation</h3>
			</div>
			<hr className="divider" />

			{/* Name */}
			<div className="toolbar-section">
				<h4 className="toolbar-section-header">Name</h4>
				<Name name={generalisation.text} saveChanges={saveChanges} />
			</div>
			<hr className="divider" />

			{/* Parent */}
			<div className="toolbar-section">
				<div className="toolbar-section-header">Parent</div>
				{parent.text}
			</div>
			<hr className="divider" />

			{/* Subsets */}
			<div className="toolbar-section">
				<div className="toolbar-section-header">Subsets</div>
				<Subsets
					children={Object.keys(generalisation.edges)}
					generalisation={generalisation}
					ctx={ctx}
					functions={functions}
				/>
			</div>
			<hr className="divider" />
		</div>
	);
}
