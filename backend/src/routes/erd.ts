/*
	TABLE OF CONTENTS

	1. Imports
	2. ERD router for CRUD
		2.1 GET ERD
		2.2 POST ERD
		2.3 PUT ERD
		2.4 DELETE ERD
*/

// **********
// 1. Imports
// **********

import { Router } from "express";
import ErrorBuilder from "../controllers/errorBuilder";
import FirebaseController from "../controllers/firebaseController";

// **********************
// 2. ERD router for CRUD
// **********************

const router = Router();

// ***********
// 2.1 GET ERD
// ***********

/*
	/erd?ERid&Uid
	- Get ERD
	- We need to know which ERD (ERid) to get and if the user (Uid) has access
*/
router.get("/", function (req, res) {
	if (req.query.Uid === undefined || req.query.ERid === undefined) {
		return res.status(400).send("Uid and ERid have to be defined.");
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	FirebaseController.getInstance()
		.getERD(uid, erid)
		.then((data: string) => {
			res.status(200).send(data);
		})
		.catch((error) => {
			if (error instanceof ErrorBuilder) {
				res.status(error.getCode()).send(error.getMsg());
			} else {
				res.status(501).send("An error occured. Please try again later");
			}
		});
});

// ************
// 2.2 POST ERD
// ************

/*
	/erd?Uid
	- Create ERD
	- We need to know which user (Uid) created it
*/
router.post("/", function (req, res) {
	if (req.query.Uid === undefined || req.body.data === undefined || req.body.name === undefined) {
		return res
			.status(400)
			.send("Uid has to be defined as query. Request body has to contain ERD name and data.");
	}
	const uid: string = req.query.Uid as string;
	const data: string = JSON.stringify(req.body as string);
	FirebaseController.getInstance()
		.createERD(uid, data)
		.then((erid: string) => {
			res.status(200).send(erid);
		})
		.catch((error) => {
			if (error instanceof ErrorBuilder) {
				res.status(error.getCode()).send(error.getMsg());
			} else {
				res.status(501).send("An error occured. Please try again later");
			}
		});
});

// ***********
// 2.3 PUT ERD
// ***********

/*
	/erd?ERid&Uid
	- Update ERD
	- We need to know which ERD (ERid) to update and if the user (Uid) has access
*/
router.put("/", function (req, res) {
	if (
		req.query.Uid === undefined ||
		req.query.ERid === undefined ||
		req.body.data === undefined ||
		req.body.name === undefined ||
		req.body.counter === undefined
	) {
		return res.status(400).send(
			// eslint-disable-next-line max-len
			"Uid and ERid have to be defined as queries. ERD name, counter and data have to be defined in request body."
		);
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	const data: string = JSON.stringify(req.body as string);

	FirebaseController.getInstance()
		.updateERD(uid, erid, data)
		.then(() => {
			res.status(200).send("ERD successfully updated");
		})
		.catch((error) => {
			if (error instanceof ErrorBuilder) {
				res.status(error.getCode()).send(error.getMsg());
			} else {
				res.status(501).send("An error occured. Please try again later");
			}
		});
});

// **************
// 2.4 DELETE ERD
// **************

/*
	/erd?ERid&Uid
		- Deletes an ERD
		- ERD (ERid) can only be deleted by the owner (Uid)
		- All Firestore collections need to be updated
*/
router.delete("/", function (req, res) {
	if (req.query.Uid === undefined || req.query.ERid === undefined) {
		return res.status(400).send("Uid and ERid have to be defined as queries.");
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	FirebaseController.getInstance()
		.deleteERD(uid, erid)
		.then(() => {
			res.status(200).send("ERD successfully deleted");
		})
		.catch((error) => {
			if (error instanceof ErrorBuilder) {
				res.status(error.getCode()).send(error.getMsg());
			} else {
				res.status(501).send("An error occured. Please try again later");
			}
		});
});

export default router;
