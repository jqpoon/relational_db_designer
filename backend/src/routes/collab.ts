import {Router} from "express";
import ErrorBuilder from "src/controllers/errorBuilder";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

/*
	- POST /duplicate?ERid&Uid
		- Create a duplicate of an ERD (ERid) for a user (Uid)
*/

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
		return res.sendStatus(400);
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
	/collab?Uid&ERid&permission
	- Update user (Uid) access (permission) to ERD (ERid)
*/
router.put('/', function (req, res) {
	res.sendStatus(200);
});

/*
	/collab/create-duplicate?ERid&Uid
	- Create a duplicate of an ERD (ERid) for a user (Uid)
*/
router.post("/create-duplicate", function (req, res) {
	res.sendStatus(200);
});

export default router;
