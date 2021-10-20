import { Router } from "express";
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

    modelAsJson.entities.map(function (entityAsJson: any) {
        // TODO: Create Entity objects and call buildFromJson(entityAsJson).
    });
    modelAsJson.relationships.map(function (relationshipAsJson: any) {
        // TODO: Create Relationship objects and call buildFromJson(relationshipAsJson).
    });
    modelAsJson.disjoints.map(function (disjointAsJson: any) {
        // TODO: Create Disjoint objects and call buildFromJson(disjointAsJson).
    });
});

export default router;
