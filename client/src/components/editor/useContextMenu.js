import { useEffect, useState, useCallback } from "react";

export default function useContextMenu() {
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);

	const handleContextMenu = useCallback(
		(event) => {
			if (
				event.target.classList.contains("canvas") ||
				event.target.classList.contains("toolbar")
			)
				return;
			event.preventDefault();
			setAnchorPoint({ x: event.clientX, y: event.clientY });
			setShow(true);
		},
		[setShow, setAnchorPoint]
	);

	const handleClick = useCallback(
		() => (show ? setShow(false) : null),
		[show]
	);

	useEffect(() => {
		document.addEventListener("click", handleClick);
		document.addEventListener("contextmenu", handleContextMenu);
		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("contextmenu", handleContextMenu);
		};
	});
	return { anchorPoint, show };
}
