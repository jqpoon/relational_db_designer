import {Router} from "express";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

/*
	- POST /duplicate?ERid&Uid
		- Create a duplicate of an ERD (ERid) for a user (Uid)
*/

/*
	/erd-list?Uid
	- Gets the list of ERD that a user (Uid) has access to
	/erd-list?ERid
	- Gets the list of users that can access the ERD (ERid)
*/
router.get("/erd-list", function (req, res) {
	res.sendStatus(200);
});

/*
	/erd-list?Uid&ERid&permission
	- Update user (Uid) access (permission) to ERD (ERid)
*/
router.put('/erd-list', function (req, res) {
	res.sendStatus(200);
});

/*
	/create-duplicate?ERid&Uid
	- Create a duplicate of an ERD (ERid) for a user (Uid)
*/
router.post("/create-duplicate", function (req, res) {
	res.sendStatus(200);
});

export default router
