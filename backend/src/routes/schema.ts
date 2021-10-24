import { OK } from "http-status-codes";
import { Router } from "express";
import Disjoint from "src/models/disjoint";
import Entity from "src/models/entity";
import Relationship from "src/models/relationship";
import SchemaController from "../controllers/schemaController";

const router = Router();

router.get("/example", async function (req, res, next) {
    var modelAsJson = JSON.parse(req.body);

    var entities: Entity[] = JSON.parse(modelAsJson.entities);
    var relationships: Relationship[] = JSON.parse(modelAsJson.relationships);
    var disjoints: Disjoint[] = JSON.parse(modelAsJson.disjoints);

    SchemaController.getInstance().addAllEntities(entities);
    SchemaController.getInstance().addAllRelationships(relationships);

    return res.status(OK).json({ SUCCESS: true });
});

// router.get('/entities', async function(req, res, next) {
//
//     const entities = SchemaController.getInstance().getAllEntities()
//
//     entities.then(function (result) {
//         console.log(result)
//         return res.status(OK).send(result);
//     })
// });
//
// // Get Schema from Database
// router.get('/relationship', async function(req, res, next) {
//     const relationships = SchemaController.getInstance().getAllRelationships()
//
//     relationships.then(function (result) {
//         return res.status(OK).json({result});
//     })
// });

export default router;
