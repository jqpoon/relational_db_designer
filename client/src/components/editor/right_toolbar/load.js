import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { confirmAlert } from 'react-confirm-alert';

export default function Load({user, importStateFromObject, backToNormal}) {
	
	const [erids, setErids] = useState([]);

	useEffect(() => {
		axios.get(`/api/collab?Uid=${user}`)
			.then((res) => {
				setErids(res.data);
			});
	}, [])

	const loadERD = async (erid) => {
		try {
			const res = await axios.get(`/api/erd?Uid=${user}&ERid=${erid}`);
			const data = await res.data;
			importStateFromObject({...data, erid});
			backToNormal();
			alert(`ERD successfully loaded`);
		} catch (error) {
			alert(error.response.data);
		}
	}

	const submit = (name, erid) => {
		confirmAlert({
      title: "Confirmation",
      message: `${name} will be loaded`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => loadERD(erid)
        },
        {
          label: 'No',
        }
      ]
    });
	}

	const eridBlock = ({name, erid}) => {
		return (
			<div className="erid-block" onClick={() => submit(name, erid)}>
				{name}
			</div>
		)
	}

	return (
		<div className="toolbar-right">
			<h3 className="toolbar-header">Load ERD</h3>
			{erids.length === 0 ? "Nothing to load!" : erids.map((x) => eridBlock(x))}
		</div>
	)
}
