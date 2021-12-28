import {OK} from "http-status-codes";
import {Router} from "express";
import FirebaseController from "src/controllers/firebaseController";

const router = Router();

router.post('/signup', async function (req, res, next) {
    var modelAsJson = req.body;

    var email: string = modelAsJson.email ?? undefined;
    var password: string = modelAsJson.password ?? undefined;

    var success: boolean = FirebaseController.getInstance().signUp(email, password);

    return res.status(OK).json({SUCCESS: success});
})


router.post('/login', async function (req, res, next) {
    var modelAsJson = req.body;

    var email: string = modelAsJson.email ?? undefined;
    var password: string = modelAsJson.password ?? undefined;

    var success: boolean = FirebaseController.getInstance().login(email, password);

    return res.status(OK).json({SUCCESS: success});
})

export default router
