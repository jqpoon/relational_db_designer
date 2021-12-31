import {Router} from "express";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

router.post('/signup', function (req, res) {
    const email: string = req.body.email ?? undefined;
    const password: string = req.body.password ?? undefined;

    FirebaseController.getInstance().signUp(email, password)
				.then((message: string) =>{
						res.status(200).send(message);
				})
				.catch((error) => {
						res.status(400).send(error);
				});
})


router.post('/login', function (req, res) {
    const email: string = req.body.email ?? undefined;
    const password: string = req.body.password ?? undefined;

    FirebaseController.getInstance().login(email, password)
				.then((message: string) =>{
						res.status(200).send(message);
				})
				.catch((error) => {
						res.status(403).send(error);
				});
})

export default router
