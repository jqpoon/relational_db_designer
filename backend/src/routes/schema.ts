import {OK} from "http-status-codes";
import {Router} from "express";
import Disjoint from "src/models/disjoint";
import Entity from "src/models/entity";
import Relationship, {LHConstraint} from "src/models/relationship";
import SchemaController from "../controllers/schemaController";

const router = Router();

router.get("/example", async function (req, res, next) {
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

    return res.status(OK).json({SUCCESS: true});
});

router.post('/all', async function (req, res, next) {
    // TODO add error catching
    var modelAsJson = req.body;

    var entities: Entity[] = modelAsJson.entities;
    var relationships: Relationship[] = modelAsJson.relationships;

    relationships.map((relationship: Relationship) => {
        const lHConstraintsConvertion: Map<number, LHConstraint> = new Map()
        Object.entries(relationship.lHConstraints).map((values) => {
            lHConstraintsConvertion.set(+values[0], values[1])
        })

        relationship.lHConstraints = lHConstraintsConvertion
    })

    await SchemaController.getInstance().addAllEntities(entities);
    await SchemaController.getInstance().addAllRelationships(relationships);
    // var disjoints: Disjoint[] = JSON.parse(modelAsJson.disjoints);

    return res.status(OK).json({SUCCESS: true});
})

router.get('/entities', async function (req, res, next) {

    const entities = SchemaController.getInstance().getAllEntities()

    entities.then(function (entityMap: Map<Number, Entity>) {
        const entities = Array.from(entityMap.values())
        return res.status(OK).json({
            entities: entities
        });
    })
});

router.get('/relationship', async function (req, res, next) {
    const relationships = SchemaController.getInstance().getAllRelationships()

    relationships.then(function (relationshipMap: Map<Number, Relationship>) {
        const relationships = Array.from(relationshipMap.values())
        return res.status(OK).json({
            relationships: relationships
        });
    })
});

export default router;
