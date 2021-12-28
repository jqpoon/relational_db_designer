import {Router} from "express";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

// N.B. user ID as a query for authentication is NOT secure

/*
	/erd?ERid&Uid
	- Get ERD
	- We need to know which ERD (ERid) to get and if the user (Uid) has access
*/
router.get("/erd", function (req, res) {
	res.sendStatus(200);
});

/*
	/erd?Uid
	- Create ERD
	- We need to know which user (Uid) created it
*/
router.post("/erd", function (req, res) {
	res.sendStatus(200);
});

/*
	/erd?ERid&Uid
	- Update ERD
	- We need to know which ERD (ERid) to update and if the user (Uid) has access
*/
router.put('/erd', function (req, res) {
	res.sendStatus(200);
});

/*
	/erd?ERid&Uid
		- Deletes an ERD
		- ERD (ERid) can only be deleted by the owner (Uid)
		- All Firestore collections need to be updated
*/
router.delete('/erd', function (req, res) {
	res.sendStatus(200);
});

export default router
