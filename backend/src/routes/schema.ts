import { Router } from 'express';
import { OK } from 'http-status-codes';
import SchemaController from "../controllers/schemaController";

const router = Router();

router.get('/add_testing', async function(req, res, next) {
    SchemaController.getInstance().testing({
        id: 1,
        name: 'Testing Entity One',
    }, {
        id: 2,
        name: 'Testing Entity Two',
    }, {
        name: 'Testing Attribute',
    }, {
        name: 'Testing Relationship',
        entities: [1, 2]
    })

    return res.status(OK).json({SUCCESS: true});
})

// Get Schema from Database
router.get('/entities', async function(req, res, next) {
    // TODO Julian request translation
    // console.log(req)

    // if ...
    // else ...

    const entities = SchemaController.getInstance().getAllEntities()

    entities.then(function (result) {
        console.log(result)
        return res.status(OK).send(result);
    })
});

// Get Schema from Database
router.get('/relationship', async function(req, res, next) {
    const relationships = SchemaController.getInstance().getAllRelationships()

    relationships.then(function (result) {
        return res.status(OK).json({result});
    })
});

export default router;
