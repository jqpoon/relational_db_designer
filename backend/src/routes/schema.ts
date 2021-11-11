import {OK} from "http-status-codes";
import {Router} from "express";
import Disjoint from "src/models/disjoint";
import Entity from "src/models/entity";
import Relationship, {LHConstraint} from "src/models/relationship";
import SchemaController from "../controllers/schemaController";

const router = Router();

router.get("/example", async function (req, res, next) {
    // var modelAsJson = JSON.parse(req.body);

    // var entities: Entity[] = JSON.parse(modelAsJson.entities);
    // var relationships: Relationship[] = JSON.parse(modelAsJson.relationships);
    // var disjoints: Disjoint[] = JSON.parse(modelAsJson.disjoints);

    var mockEntity = [
        {
            identifier: 1,
            positionX: 1,
            positionY: 2,
            shapeWidth: 4,
            shapeHeight: 4,
            name: 'Mock Entity 1',
            isWeak: true,
            attributes: [
                {
                    identifier: 1,
                    positionX: 2,
                    positionY: 4,
                    shapeWidth: 4,
                    shapeHeight: 4,
                    name: 'Mock Attribute 1',
                    isPrimaryKey: false,
                    isOptional: false,
                }
            ]
        },
        {
            identifier: 2,
            positionX: 1,
            positionY: 2,
            shapeWidth: 4,
            shapeHeight: 4,
            name: 'Mock Entity 2',
            isWeak: true,
            attributes: [
                {
                    identifier: 2,
                    positionX: 2,
                    positionY: 4,
                    shapeWidth: 4,
                    shapeHeight: 4,
                    name: 'Mock Attribute 2',
                    isPrimaryKey: false,
                    isOptional: false,
                }
            ]
        }
    ]

    var mockRelationship = [{
        identifier: 1,
        positionX: 1,
        positionY: 2,
        shapeWidth: 4,
        shapeHeight: 4,
        name: 'Mock Relationship',
        attributes: [
            {
                identifier: 3,
                positionX: 2,
                positionY: 4,
                shapeWidth: 4,
                shapeHeight: 4,
                name: 'Mock Attribute Relationship',
                isPrimaryKey: false,
                isOptional: false,
            }
        ],
        lHConstraints: new Map([
                [1, LHConstraint.ONE_TO_MANY],
                [2, LHConstraint.ONE_TO_MANY],
            ],
        ),
    }]

    SchemaController.getInstance().addAllEntities(mockEntity);
    SchemaController.getInstance().addAllRelationships(mockRelationship);

    return res.status(OK).json({SUCCESS: true});
});

router.get('/entities', async function (req, res, next) {

    const entities = SchemaController.getInstance().getAllEntities()

    entities.then(function (result: Map<Number, Entity>) {
        return res.status(OK).send(result);
    })
});

router.get('/relationship', async function(req, res, next) {
    const relationships = SchemaController.getInstance().getAllRelationships()

    relationships.then(function (result) {
        return res.status(OK).json({result});
    })
});

export default router;
