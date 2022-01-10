import { MdClear } from "react-icons/md";
import { IconButton, Tooltip } from "@mui/material";

export function DeleteButton({ elem, deleteElem }) {
	return (
		<Tooltip title="Remove" placement="left">
			<div onClick={() => deleteElem(elem.type, elem)} style={{ cursor: "pointer" }}>
				<IconButton>
					<MdClear
						size={20}
						onClick={() => deleteElem(elem.type, elem)}
						style={{ cursor: "pointer" }}
					/>
				</IconButton>
			</div>
		</Tooltip>
	);
}
