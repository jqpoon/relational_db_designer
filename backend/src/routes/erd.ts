import {Router} from "express";
import ErrorBuilder from "src/controllers/errorBuilder";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

// N.B. user ID as a query for authentication is NOT secure

/*
	/erd?ERid&Uid
	- Get ERD
	- We need to know which ERD (ERid) to get and if the user (Uid) has access
*/
router.get("/", function (req, res) {
	if (req.query.Uid === undefined || req.query.ERid === undefined) {
		return res.sendStatus(400);
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	FirebaseController.getInstance().getERD(uid, erid)
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
	const data: string = JSON.stringify(req.body as string);
	FirebaseController.getInstance().createERD(uid, data)
		.then(() => {
			res.status(200).send(`ERD created for ${uid}`);
		})
		.catch((error) => {
			if (error instanceof ErrorBuilder) {
				res.status(error.getCode()).send(error.getMsg());
			} else {
				res.status(501).send("An error occured. Please try again later");
			}
		});
});

/*
	/erd?ERid&Uid
	- Update ERD
	- We need to know which ERD (ERid) to update and if the user (Uid) has access
*/
router.put('/', function (req, res) {
	if (req.query.Uid === undefined || 
		req.query.ERid === undefined || 
		req.body.data === undefined) {
		return res.sendStatus(400);
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	const data: string = JSON.stringify(req.body.data as string);

	FirebaseController.getInstance().updateERD(uid, erid, data)
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

/*
	/erd?ERid&Uid
		- Deletes an ERD
		- ERD (ERid) can only be deleted by the owner (Uid)
		- All Firestore collections need to be updated
*/
router.delete('/', function (req, res) {
	if (req.query.Uid === undefined || req.query.ERid === undefined) {
		return res.sendStatus(400);
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	FirebaseController.getInstance().deleteERD(uid, erid)
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
