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

    var graphID: number = modelAsJson.graphID ?? undefined;
    var entities: Entity[] = modelAsJson.entities ?? undefined;
    var relationships: Relationship[] = modelAsJson.relationships ?? undefined;
    var generalisations: Generalisation[] = modelAsJson.generalisations ?? undefined;

    if (relationships !== undefined) {
        relationships.map((relationship: Relationship) => {
            const lHConstraintsConvertion: Map<string, LHConstraint> = new Map()
            Object.entries(relationship.lHConstraints).map((values) => {
                lHConstraintsConvertion.set(values[0], values[1])
            })

            relationship.lHConstraints = lHConstraintsConvertion
        })
    }

    var currentNextID = await SchemaController.getInstance().getNextID(true);

    if (graphID === undefined) {
        graphID =  await SchemaController.getInstance().getNextID();
    } else {
        if (graphID <= currentNextID) {
            await SchemaController.getInstance().deleteOldGraph(graphID);
        } else {
            return res.status(400).json({SUCCESS: false, message: 'GraphID is greater than current max graphID, ' +
                    'cannot override old graph as no graph exists'});
        }
    }

    if (entities !== undefined) {
        await SchemaController.getInstance().addAllEntities(entities, graphID);
        if (relationships !== undefined) {
            // relationships depend on entities being created first
            await SchemaController.getInstance().addAllRelationships(relationships, graphID);
        }

        if (generalisations !== undefined) {
            // generalisations depend on entities being created first
            await SchemaController.getInstance().addAllGeneralisations(generalisations, graphID);
        }
    } else {
        if (relationships !== undefined || generalisations !== undefined) {
            return res.status(400).json({SUCCESS: false, message: 'Generalisation and relationships need entities first'});
        }
    }

    return res.status(OK).json({SUCCESS: true});
})

router.get('/all/:graphID', async function (req, res, next) {

    var graphID = +req.params['graphID']

    const entities = SchemaController.getInstance().getAllEntities(graphID)

    entities.then(function (entityMap: Map<string, Entity>) {
        const entities = Array.from(entityMap.values())

        if (entities.length === 0) {
            return res.status(400).json({SUCCESS: false, message: `GraphID ${graphID} does not exist`});
        }

        const relationships = SchemaController.getInstance().getAllRelationships(graphID)

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

            const generalisations = SchemaController.getInstance().getAllGeneralisations(graphID)

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

router.get('/entities/:graphID', async function (req, res, next) {

    var graphID = +req.params['graphID']

    const entities = SchemaController.getInstance().getAllEntities(graphID)

    entities.then(function (entityMap: Map<string, Entity>) {
        const entities = Array.from(entityMap.values())

        if (entities.length === 0) {
            return res.status(400).json({SUCCESS: false, message: `GraphID ${graphID} does not exist`});
        }

        return res.status(OK).json({
            entities: entities
        });
    })
});

router.get('/relationship/:graphID', async function (req, res, next) {

    var graphID = +req.params['graphID']

    const relationships = SchemaController.getInstance().getAllRelationships(graphID)

    relationships.then(function (relationshipMap: Map<string, Relationship>) {
        const relationships = Array.from(relationshipMap.values())

        if (relationships.length === 0) {
            return res.status(400).json({SUCCESS: false, message: `GraphID ${graphID} does not exist`});
        }

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

router.get('/generalisation/:graphID', async function (req, res, next) {

    var graphID = +req.params['graphID']

    const generalisations = SchemaController.getInstance().getAllGeneralisations(graphID)

    generalisations.then(function (generalisationResponse: Generalisation[]) {
        if (generalisationResponse.length === 0) {
            return res.status(400).json({SUCCESS: false, message: `GraphID ${graphID} does not exist`});
        }

        return res.status(OK).json({
            generalisations: generalisationResponse
        });
    })
});

export default router;
