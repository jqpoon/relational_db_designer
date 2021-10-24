import { OK } from 'http-status-codes';
import { Router } from "express";
import BaseDisjoint from "src/models/baseDisjoint";
import BaseEntity from "src/models/baseEntity";
import BaseRelationship from "src/models/baseRelationship";
import Disjoint from "src/models/disjoint";
import Entity from "src/models/entity";
import Relationship from "src/models/relationship";
import SchemaController from "../controllers/schemaController";

const router = Router();

router.get('/example', async function(req, res, next) {

    var modelAsJson = JSON.parse(req.body);

    var entities: Entity[] = JSON.parse(modelAsJson.entities);
    var relationships: Relationship[] = JSON.parse(modelAsJson.relationships);

    SchemaController.getInstance().addAllEntities(entities)

    // var disjointsAsJson = JSON.parse(modelAsJson.disjoints);

    // for (var entityAsString in entitiesAsJson) {
    //     var entity = new BaseEntity();
    //     entity.buildFirstPassFromJson(JSON.parse(entityAsString));
    //     entities.push(entity);
    // }
    //
    // for (var relationshipAsString in relationshipsAsJson) {
    //     var relationship = new BaseRelationship();
    //     relationship.buildFirstPassFromJson(JSON.parse(relationshipAsString));
    //     relationships.push(relationship);
    // }
    //
    // for (var disjointAsString in disjointsAsJson) {
    //     var disjoint = new BaseDisjoint();
    //     disjoint.buildFirstPassFromJson(JSON.parse(disjointAsString));
    //     disjoints.push(disjoint);
    // }
    //
    // SchemaController.getInstance().addAllEntities()

    return res.status(OK).json({SUCCESS: true});
})

// // Get Schema from Database
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
