/*
	TABLE OF CONTENTS

	1. Imports
	2. CRUD for ERD
	3. Collaboration
	4. Translation
*/

// 1. Imports
import axios from "axios";
import { notificationHandler } from "./alert";
import { actions } from "../types";

// ***************
// 2. CRUD for ERD
// ***************

const createERD = async ({ user, exportERD, setErid, setCounter }) => {
	try {
		const res = await axios.post(`/api/erd?Uid=${user}`, exportERD());
		const erid = await res.data;
		setErid(erid);
		setCounter((c) => c + 1);
		notificationHandler("Success", `ERD (id: ${erid}) was successfully created and saved`);
	} catch (error) {
		notificationHandler("Error", error.response.data);
	}
};

export const loadERD = async ({ user, erid, importERD, backToNormal }) => {
	try {
		const res = await axios.get(`/api/erd?Uid=${user}&ERid=${erid}`);
		const data = await res.data;
		importERD({ ...data, erid });
		backToNormal();
		notificationHandler("Success", `ERD (id: ${erid}) was successfully loaded.`);
	} catch (error) {
		notificationHandler("Error", error.response.data);
	}
};

const updateERD = async ({ user, erid, exportERD, setCounter }) => {
	try {
		const res = await axios.put(`/api/erd?Uid=${user}&ERid=${erid}`, exportERD());
		const data = await res.data;
		setCounter((c) => c + 1);
		notificationHandler("Success", `ERD (id: ${erid}) was successfully saved. ${data}`);
	} catch (error) {
		notificationHandler("Error", error.response.data);
	}
};

export const deleteERDInBackEnd = async ({ user, erid, resetERD }) => {
	try {
		await axios.delete(`/api/erd?Uid=${user}&ERid=${erid}`);
		resetERD();
		notificationHandler("Success", `ERD (id: ${erid}) was successfully deleted.`);
	} catch (error) {
		notificationHandler("Error", error.response.data);
	}
};

export const saveERDToBackEnd = async (data) => {
	const save = data.erid ? updateERD : createERD;
	save(data);
};

// ****************
// 3. Collaboration
// ****************

export const getErids = (user, func) => {
	axios.get(`/api/collab?Uid=${user}`).then((res) => {
		func(res.data);
	});
};

export const getSharedList = (erid, func) => {
	axios.get(`/api/collab?ERid=${erid}`).then((res) => {
		func(res.data);
	});
};

export const grantPermission = async (user, erid, email, permission, refresh) => {
	try {
		await axios.put(
			`/api/collab?owner=${user}&email=${email}&ERid=${erid}&permission=${permission}`
		);
		refresh();
		notificationHandler("Success", "Permission updated");
	} catch (error) {
		notificationHandler("Error", error.response.data);
	}
};

export const duplicateERD = async ({ user, erid, exportERD, importERD }) => {
	try {
		const erd = exportERD();
		erd.name = "Copy of " + erd.name;
		const response = await axios.post(
			`/api/collab/create-duplicate?Uid=${user}&ERid=${erid}`,
			erd
		);
		const duplicateERid = await response.data;
		erd.erid = duplicateERid;
		erd.counter = 1; // Reset counter
		importERD(erd);
		notificationHandler(
			"Success",
			`ERD (id: ${erd.erid}) was successfully duplicated (old: ${erid}) and loaded.`
		);
	} catch (error) {
		notificationHandler("Error", error.response.data);
	}
};

// **************
// 4. Translation
// **************

export const translateERtoRelational = ({ exportERD, setContext }) => {
	axios
		.post("api/translation/translate", exportERD())
		.then(function (response) {
			setContext({
				action: actions.TRANSLATE,
				tables: response.data.translatedtables.tables,
			});
			notificationHandler("Success", `Relational schema has been generated on the right.`);
		})
		.catch(function (error) {
			notificationHandler("Error", error.response.data);
		});
};
