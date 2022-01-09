import { useRef, useEffect } from "react";
import "./general.css"

export function ContextMenu({ contextMenu, setContextMenu, backToNormal }) {
	const ctxMenuRef = useRef(null);
	
	const handleClickOut = (e) => {
		if (ctxMenuRef.current && !ctxMenuRef.current.contains(e.target)) {
			backToNormal();
			setContextMenu(null);
		}
	}

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOut);
		return () => {
			document.removeEventListener("mousedown", handleClickOut);
		}
	}, []);
	
	if (contextMenu === null) return null;

  const ctxMenuStyle = {
    top: contextMenu.anchor.y,
    left: contextMenu.anchor.x,
  };

  const totalActions = Object.keys(contextMenu.actions).length;


  return (
    <ul style={ctxMenuStyle} className="ctx-menu">
      {Object.entries(contextMenu.actions).map(([name, action], i) => (
        <>
          <li onClick={action} className="ctx-menu-item">{name}</li>
          {i === totalActions - 1 ? null : <hr />}
        </>
      ))}
    </ul>
  );
}
