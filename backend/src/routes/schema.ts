import {OK} from "http-status-codes";
import {Router} from "express";
import Entity from "src/models/entity";
import Relationship, {LHConstraint} from "src/models/relationship";
import SchemaController from "../controllers/schemaController";
import Generalisation from "src/models/generalisation";

const router = Router();

router.post('/all', async function (req, res, next) {
    // TODO add error catching
    var modelAsJson = req.body;

    var entities: Entity[] = modelAsJson.entities;
    var relationships: Relationship[] = modelAsJson.relationships;
    var generalisations: Generalisation[] = modelAsJson.generalisations;

    relationships.map((relationship: Relationship) => {
        const lHConstraintsConvertion: Map<string, LHConstraint> = new Map()
        Object.entries(relationship.lHConstraints).map((values) => {
            lHConstraintsConvertion.set(values[0], values[1])
        })

        relationship.lHConstraints = lHConstraintsConvertion
    })

    await SchemaController.getInstance().addAllEntities(entities);
    await SchemaController.getInstance().addAllRelationships(relationships);
    await SchemaController.getInstance().addAllGeneralisations(generalisations);

    return res.status(OK).json({SUCCESS: true});
})

router.get('/all', async function (req, res, next) {

    const entities = SchemaController.getInstance().getAllEntities()

    entities.then(function (entityMap: Map<string, Entity>) {
        const entities = Array.from(entityMap.values())

        const relationships = SchemaController.getInstance().getAllRelationships()

        relationships.then(function (relationshipMap: Map<string, Relationship>) {
            const relationships = Array.from(relationshipMap.values())
            const relationshipResponse: any[] = []
            relationships.map((relationship) => {
                const lHConstraintsConvertion: Map<string, String> = new Map()
                Array.from(relationship.lHConstraints.keys()).map((id) => {
                    lHConstraintsConvertion.set(id, LHConstraint[relationship.lHConstraints.get(id)!])
                })

                relationshipResponse.push({
                    ...relationship,
                    lHConstraints: Object.fromEntries(lHConstraintsConvertion),
                })
            })

            const generalisations = SchemaController.getInstance().getAllGeneralisations()

            generalisations.then(function (generalisationResponse: Generalisation[]) {
                return res.status(OK).json({
                    entities: entities,
                    relationships: relationshipResponse,
                    generalisations: generalisationResponse
                });
            })
        })
    })
});

router.get('/entities', async function (req, res, next) {

    const entities = SchemaController.getInstance().getAllEntities()

    entities.then(function (entityMap: Map<string, Entity>) {
        const entities = Array.from(entityMap.values())
        return res.status(OK).json({
            entities: entities
        });
    })
});

router.get('/relationship', async function (req, res, next) {
    const relationships = SchemaController.getInstance().getAllRelationships()

    relationships.then(function (relationshipMap: Map<string, Relationship>) {
        const relationships = Array.from(relationshipMap.values())
        const relationshipResponse: any[] = []
        relationships.map((relationship) => {
            const lHConstraintsConvertion: Map<string, String> = new Map()
            Array.from(relationship.lHConstraints.keys()).map((id) => {
                lHConstraintsConvertion.set(id, LHConstraint[relationship.lHConstraints.get(id)!])
            })

            relationshipResponse.push({
                ...relationship,
                lHConstraints: Object.fromEntries(lHConstraintsConvertion),
            })
        })
        return res.status(OK).json({
            relationships: relationshipResponse
        });
    })
});

router.get('/generalisation', async function (req, res, next) {
    const generalisations = SchemaController.getInstance().getAllGeneralisations()

    generalisations.then(function (generalisationResponse: Generalisation[]) {
        return res.status(OK).json({
            generalisations: generalisationResponse
        });
    })
});

export default router;
