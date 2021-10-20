import { Router } from 'express';
import SchemaController from "../controllers/schemaController";

const router = Router();

// Get Schema from Database
router.get('/', function(req, res, next) {
    // TODO Julian request translation
    // console.log(req)

    // if ...
    // else ...

    // SchemaController.getInstance().testing({
    //     id: 1,
    //     name: 'Testing Entity One',
    // }, {
    //     id: 2,
    //     name: 'Testing Entity Two',
    // }, {
    //     name: 'Testing Attribute',
    // }, {
    //     name: 'Testing Relationship',
    // })

    const result = SchemaController.getInstance().getAllRelationships()

});

export default router;
