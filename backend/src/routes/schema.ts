import { Router } from "express";
import BaseDisjoint from "src/models/baseDisjoint";
import BaseEntity from "src/models/baseEntity";
import BaseRelationship from "src/models/baseRelationship";
import Disjoint from "src/models/disjoint";
import Entity from "src/models/entity";
import Relationship from "src/models/relationship";
import SchemaController from "../controllers/schemaController";

const router = Router();

// Get Schema from Database
router.get("/", function (req, res, next) {
    SchemaController.getInstance().testing(
        {
            name: "Testing Entity One",
        },
        {
            name: "Testing Entity Two",
        },
        {
            name: "Testing Attribute",
        },
        {
            name: "Testing Relationship",
        }
    );

    var modelAsJson = JSON.parse(req.body);

    var entities: Entity[] = [];
    var relationships: Relationship[] = [];
    var disjoints: Disjoint[] = [];

    var entitiesAsJson = JSON.parse(modelAsJson.entities);
    var relationshipsAsJson = JSON.parse(modelAsJson.relationships);
    var disjointsAsJson = JSON.parse(modelAsJson.disjoints);

    for (var entityAsString in entitiesAsJson) {
        var entity = new BaseEntity();
        entity.buildFirstPassFromJson(JSON.parse(entityAsString));
        entities.push(entity);
    }

    for (var relationshipAsString in relationshipsAsJson) {
        var relationship = new BaseRelationship();
        relationship.buildFirstPassFromJson(JSON.parse(relationshipAsString));
        relationships.push(relationship);
    }

    for (var disjointAsString in disjointsAsJson) {
        var disjoint = new BaseDisjoint();
        disjoint.buildFirstPassFromJson(JSON.parse(disjointAsString));
        disjoints.push(disjoint);
    }

    // TODO: Call decodeObjectReferences(SchemaController.getInstance()) on all objects.
});

export default router;
