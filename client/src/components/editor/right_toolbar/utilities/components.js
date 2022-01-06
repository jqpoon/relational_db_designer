import { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import "./components.css";

export function EditableText({ value, updateValue }) {
  const onChange = (e) => {
    updateValue(e.target.value);
  }; // TODO

  return (
    <form style={{ padding: "10px" }} onSubmit={(e) => e.preventDefault()}>
      <label>
        Name:
        <input type="text" value={value} onChange={onChange} />
      </label>
    </form>
  );
}

export function EditOnIcon({ value, updateValue }) {
  const [editMode, setEditMode] = useState(false);
  if (editMode) {
    return (
      <div
        style={{
          width: "100%",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ padding: "5px" }}>
          <input
            autoFocus
            onBlur={() => setEditMode(false)}
            type="text"
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                setEditMode(false);
              }
            }}
          />
        </div>
        {/* <div
          style={{ cursor: "pointer", padding: "5px" }}
          onClick={() => setEditMode(false)}
        >
          <MdCheck />
        </div> */}
      </div>
    );
  } else {
    return (
      <div
        style={{
          width: "100%",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ padding: "5px" }}>{value}</div>
        <div
          style={{ cursor: "pointer", padding: "5px" }}
          onClick={() => setEditMode(true)}
        >
          <MdModeEdit />
        </div>
      </div>
    );
  }
}
