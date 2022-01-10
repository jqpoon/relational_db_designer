/*
	TABLE OF CONTENTS

	1. Imports
	2. Share page component
		2.1 States and side effect hooks
		2.2 Submit handler
		2.3 JSX	
*/

// **********
// 1. Imports
// **********

import React, { useEffect, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import { getSharedList, grantPermission } from "../../utilities/backendUtils";

// ***********************
// 2. Share page component
// ***********************

export default function Share({ user, erid, backToNormal }) {
	// *******************************
	// 2.1 States and side effect hook
	// *******************************

	const [users, setUsers] = useState(null);
	const [email, setEmail] = useState("");
	const [permission, setPermission] = useState("READ");

	useEffect(() => {
		getSharedList(erid, setUsers);
	}, []);

	// ******************
	// 2.2 Submit handler
	// ******************

	const getMessageFromPermission = (email, permission) => {
		if (permission === "REMOVE") {
			return `Permission for ${email} will be removed`;
		}
		return `${email} will be given ${permission} permission`;
	};

	const givePermission = (email, permission) => {
		confirmAlert({
			title: "Confirmation",
			message: getMessageFromPermission(email, permission),
			buttons: [
				{
					label: "Yes",
					onClick: () =>
						grantPermission(user, erid, email.trim(), permission, () =>
							getSharedList(erid, setUsers)
						),
				},
				{
					label: "No",
				},
			],
		});
	};

	const handleSubmit = (e, email, permission) => {
		e.preventDefault();
		if (email === "") return;
		givePermission(email, permission);
		setEmail("");
	};

	// *******
	// 2.3 JSX
	// *******

	const userBlock = ({ email, permission }) => {
		return (
			<div className="permission-block">
				<div className="user-block">
					<p>{email}</p>
					<p>{permission}</p>
				</div>
				{permission !== "OWNER" ? (
					<button
						className="remove-permission-btn"
						onClick={() => givePermission(email, "REMOVE")}
					>
						Remove
					</button>
				) : null}
			</div>
		);
	};

	return (
		<div className="toolbar-right">
			<h3 className="toolbar-header">Share ERD</h3>
			<form
				className="share-form-wrapper"
				onSubmit={(e) => handleSubmit(e, email, permission)}
			>
				<div className="share-form">
					<input
						className="share-email"
						placeholder="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<select
						className="share-permission"
						onChange={(e) => setPermission(e.target.value)}
					>
						<option value="READ">Read</option>
						<option value="READ-WRITE">Read-write</option>
					</select>
				</div>
				<div className="share-btn-wrapper">
					<button>Update</button>
				</div>
			</form>
			{users === null ? (
				<p className="load-text">Loading...</p>
			) : (
				users.map((x) => userBlock(x))
			)}
		</div>
	);
}
