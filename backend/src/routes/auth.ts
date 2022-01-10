/*
	TABLE OF CONTENTS

	1. Imports
	2. Auth router
		2.1 Sign up
		2.2 Login
*/

// **********
// 1. Imports
// **********

import { Router } from "express";
import FirebaseController from "../controllers/firebaseController";

// **************
// 2. Auth router
// **************

const router = Router();

// ***********
// 2.1 Sign up
// ***********

router.post("/signup", function (req, res) {
	const email: string = req.body.email ?? undefined;
	const password: string = req.body.password ?? undefined;

	FirebaseController.getInstance()
		.signUp(email, password)
		.then((message: string) => {
			res.status(200).send(message);
		})
		.catch((error) => {
			res.status(400).send(error);
		});
});

// *********
// 2.2 Login
// *********

router.post("/login", function (req, res) {
	const email: string = req.body.email ?? undefined;
	const password: string = req.body.password ?? undefined;

	FirebaseController.getInstance()
		.login(email, password)
		.then((message: string) => {
			res.status(200).send(message);
		})
		.catch((error) => {
			res.status(403).send(error);
		});
});

export default router;
