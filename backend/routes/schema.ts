import express from 'express';
import SchemaController from "../controllers/schemaController";

export const router = express.Router();

// Get Schema from Database
router.get('/', function(req, res, next) {
    // TODO Julian request translation
    console.log(req)

    // if ...
    // else ...

    SchemaController.getInstance().createEntity({
        name: 'Testing',
    })
});

export default router;
