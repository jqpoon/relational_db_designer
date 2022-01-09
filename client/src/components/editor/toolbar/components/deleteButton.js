import { Tooltip } from "@mui/material";
import { MdClear } from "react-icons/md";
export function DeleteButton({ elem, deleteElem }) {
  return (
    <Tooltip title="Delete" placement="left">
      <div>
        <MdClear
          onClick={() => deleteElem(elem.type, elem)}
          style={{ cursor: "pointer" }}
        />
      </div>
    </Tooltip>
  );
}
