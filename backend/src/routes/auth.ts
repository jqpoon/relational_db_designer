import {OK} from "http-status-codes";
import {Router} from "express";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

router.post('/signup', function (req, res) {
    const modelAsJson = req.body;

    const email: string = modelAsJson.email ?? undefined;
    const password: string = modelAsJson.password ?? undefined;

    FirebaseController.getInstance().signUp(email, password)
				.then((message: string) =>{
						res.status(200).send(message);
				})
				.catch((error) => {
						res.status(400).send(error);
				});
})


router.post('/login', function (req, res) {
    const modelAsJson = req.body;

    const email: string = modelAsJson.email ?? undefined;
    const password: string = modelAsJson.password ?? undefined;

    FirebaseController.getInstance().login(email, password)
				.then((message: string) =>{
						res.status(200).send(message);
				})
				.catch((error) => {
						res.status(400).send(error);
				});
})

export default router
