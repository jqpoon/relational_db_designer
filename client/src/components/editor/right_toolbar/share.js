import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { confirmAlert } from 'react-confirm-alert';

export default function Share({user, erid, backToNormal}) {
	
	const [users, setUsers] = useState([]);

	const [email, setEmail] = useState("");
	const [permission, setPermission] = useState("READ");

	const getSharedList = () => {
		axios.get(`/api/collab?ERid=${erid}`)
			.then((res) => {
				setUsers(res.data);
			});
	}

	useEffect(() => {
		getSharedList();
	}, []);

	const ping = async (email, permission) => {
		try {
			await axios.put(`/api/collab?owner=${user}&email=${email}&ERid=${erid}&permission=${permission}`);
			getSharedList();
			alert("Permission updated");
		} catch (error) {
			alert(error.response.data);
		}
	}

	const getMessageFromPermission = (email, permission) => {
		if (permission === "REMOVE") {
			return `Permission for ${email} will be removed`;
		}
		return `${email} will be given ${permission} permission`;
	}

	const givePermission = (email, permission) => {
		confirmAlert({
      title: "Confirmation",
      message: getMessageFromPermission(email, permission),
      buttons: [
        {
          label: 'Yes',
          onClick: () => ping(email.trim(), permission)
        },
        {
          label: 'No',
        }
      ]
    });
	}

	const handleSubmit = (e, email, permission) => {
		e.preventDefault();
		givePermission(email, permission);
	}

	const userBlock = ({email, permission}) => {
		return (
			<div className="user-block">
				<p>{email} - {permission}</p>
				{permission !== "OWNER" 
					? <button onClick={() => givePermission(email, "REMOVE")}>Remove</button> 
					: null}
			</div>
		)
	}

	return (
		<div className="toolbar-right">
			<h3 className="toolbar-header">Share ERD</h3>
			<form className="share-form-wrapper" onSubmit={(e) => handleSubmit(e, email, permission)}>
				<div className="share-form">
					<input className="share-email" placeholder="email" onChange={(e) => setEmail(e.target.value)}/>
					<select className="share-permission" onChange={(e) => setPermission(e.target.value)}>
  					<option value="READ">Read</option>
						<option value="READ-WRITE">Read-write</option>
					</select>
				</div>
				<div className="share-btn-wrapper">
					<button>Update</button>
				</div>
			</form>
			{users.map((x) => userBlock(x))}
		</div>
	)
}
