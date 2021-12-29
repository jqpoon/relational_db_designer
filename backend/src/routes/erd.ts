import {Router} from "express";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

// N.B. user ID as a query for authentication is NOT secure

/*
	/erd?ERid&Uid
	- Get ERD
	- We need to know which ERD (ERid) to get and if the user (Uid) has access
*/
router.get("/", function (req, res) {
	res.sendStatus(200);
});

/*
	/erd?Uid
	- Create ERD
	- We need to know which user (Uid) created it
*/
router.post("/", function (req, res) {
	if (req.query.Uid === undefined || req.body.data === undefined) {
		return res.sendStatus(400);
	}
	const uid: string = req.query.Uid as string;
	const data: string = JSON.stringify(req.body.data as string);
	FirebaseController.getInstance().createERD(uid, data)
		.then(() => {
			res.status(200).send(`ERD created for ${uid}`);
		})
		.catch((error) => {
			res.status(501).send(error);
		});
});

/*
	/erd?ERid&Uid
	- Update ERD
	- We need to know which ERD (ERid) to update and if the user (Uid) has access
*/
router.put('/', function (req, res) {
	res.sendStatus(200);
});

/*
	/erd?ERid&Uid
		- Deletes an ERD
		- ERD (ERid) can only be deleted by the owner (Uid)
		- All Firestore collections need to be updated
*/
router.delete('/', function (req, res) {
	res.sendStatus(200);
});

export default router
