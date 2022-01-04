import {Router} from "express";
import ErrorBuilder from "../controllers/errorBuilder";
import FirebaseController from "../controllers/firebaseController";

const router = Router();

/*
	/collab?Uid
	- Gets the list of ERD that a user (Uid) has access to
	/collab?ERid
	- Gets the list of users that can access the ERD (ERid)
*/
router.get("/", function (req, res) {
	// We serve exactly one query
	if (req.query.Uid === undefined && req.query.ERid === undefined || 
		req.query.Uid !== undefined && req.query.ERid !== undefined) {
		return res.status(400).send("Either Uid or ERid has to be defined as query.");
	}
	const isUser: boolean = req.query.Uid !== undefined;
	const id: string = (isUser ? req.query.Uid : req.query.ERid) as string;
	FirebaseController.getInstance().getAccessList(id, isUser)
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
	/collab?owner&Uid&ERid&permission
	- Update user (Uid) access (permission) to ERD (ERid)
*/
router.put('/', function (req, res) {
	if (req.query.owner === undefined ||
		req.query.Uid === undefined || 
		req.query.ERid === undefined ||
		req.query.permission === undefined) {
		return res.status(400).send("Owner, Uid, ERid and permission have to be defined as queries.");
	}
	const owner: string = req.query.owner as string;
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	const permission: string = req.query.permission as string;
	FirebaseController.getInstance().updateAccess(owner, uid, erid, permission)
		.then(() => {
			res.status(200).send("Permission updated");
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
	/collab/email?owner&email&ERid&permission
	- Update user (email) access (permission) to ERD (ERid)
*/
router.put('/email', function (req, res) {
	if (req.query.owner === undefined ||
		req.query.email === undefined || 
		req.query.ERid === undefined ||
		req.query.permission === undefined) {
		return res.status(400).send("Owner, email, ERid and permission have to be defined as queries.");
	}
	const owner: string = req.query.owner as string;
	const email: string = req.query.email as string;
	const erid: string = req.query.ERid as string;
	const permission: string = req.query.permission as string;
	FirebaseController.getInstance().updateAccessWithEmail(owner, email, erid, permission)
		.then(() => {
			res.status(200).send("Permission updated");
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
	/collab/create-duplicate?ERid&Uid
	- Create a duplicate of an ERD (ERid) for a user (Uid)
*/
router.post("/create-duplicate", function (req, res) {
	if (req.query.Uid === undefined || req.query.ERid === undefined) {
		return res.status(400).send("Uid and ERid have to be defined as queries.");
	}
	const uid: string = req.query.Uid as string;
	const erid: string = req.query.ERid as string;
	FirebaseController.getInstance().createDuplicate(uid, erid)
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

export default router;
