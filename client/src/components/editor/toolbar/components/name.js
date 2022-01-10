export function Name({ name, saveChanges }) {
	return (
		<input
			type="text"
			className={`action`}
			value={name}
			placeholder="Enter name"
			onChange={(e) =>
				saveChanges((elem) => {
					elem.text = e.target.value;
				})
			}
		/>
	);
}
