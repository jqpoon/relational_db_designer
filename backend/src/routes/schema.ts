import { Router } from 'express';
import SchemaController from "../controllers/schemaController";

const router = Router();

// Get Schema from Database
router.get('/', function(req, res, next) {
    // TODO Julian request translation
    // console.log(req)

    // if ...
    // else ...

    SchemaController.getInstance().testing({
        name: 'Testing Entity',
    }, {
        name: 'Testing Attribute',
    })
    // console.log('hello')

});

export default router;
