import { Router } from 'express';
import SchemaController from "../controllers/schemaController";

const router = Router();

// Get Schema from Database
router.get('/', function(req, res, next) {
    // TODO Julian request translation
    // console.log(req)

    // if ...
    // else ...

    // SchemaController.getInstance().createEntity({
    //     name: 'Testing',
    // })
    console.log('nyello')
});

export default router;
