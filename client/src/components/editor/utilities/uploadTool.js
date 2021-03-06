import React, { useRef } from "react";
import { ClickAction } from "../toolbar/leftToolbar";

export default function UploadTool({ display, handleFile }) {
	// Create a reference to the hidden file input element
	const hiddenFileInput = useRef(null);

	// Programmatically click the hidden file input element when the Button component is clicked
	const handleClick = (e) => {
		hiddenFileInput.current.click();
	};

	// Call a function to handle the user-selected file
	const handleChange = (e) => {
		const fileUploaded = e.target.files[0];
		handleFile(fileUploaded);
	};

	return (
		<>
			<ClickAction {...display} action={handleClick} />
			<input
				type="file"
				ref={hiddenFileInput}
				onChange={handleChange}
				style={{ display: "none" }}
			/>
		</>
	);
}
