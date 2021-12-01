import {Router} from "express";
import Disjoint from "src/models/disjoint";
import Entity from "src/models/entity";
import Relationship, {LHConstraint} from "src/models/relationship";
import SchemaController from "../controllers/schemaController";

const router = Router();

export const saveAll = async (entities: Entity[], relationships: Relationship[]) => {

    relationships.map((relationship: Relationship) => {
        const lHConstraintsConvertion: Map<string, LHConstraint> = new Map()
        Object.entries(relationship.lHConstraints).map((values) => {
            lHConstraintsConvertion.set(values[0], values[1])
        })

        relationship.lHConstraints = lHConstraintsConvertion
    })

    await SchemaController.getInstance().addAllEntities(entities)
    await SchemaController.getInstance().addAllRelationships(relationships)
    // var disjoints: Disjoint[] = JSON.parse(modelAsJson.disjoints);
};

router.post('/all', async function (req, res) {
	// TODO add error catching
	var modelAsJson = req.body;

	var entities: Entity[] = modelAsJson.entities
	var relationships: Relationship[] = modelAsJson.relationships
	await saveAll(entities, relationships)
	return res.status(200).json({SUCCESS: true})
})

router.get('/all', async function (req, res, next) {

    const entities: Map<string, Entity> 
			= await SchemaController.getInstance().getAllEntities()
		const entitiesArray: Entity[] 
			= Array.from(entities.values())

		const relationships: Map<string, Relationship> 
			= await SchemaController.getInstance().getAllRelationships()
		const relationshipsArray: Relationship[] 
			= Array.from(relationships.values())
		
		const relationshipResponse: any[] = []
		relationshipsArray.forEach((r) => {
			relationshipResponse.push({
				...r,
				lHConstraints: Object.fromEntries(r.lHConstraints)
			})
		})

		return res.status(200).json({
			entities: entitiesArray,
			relationships: relationshipResponse
		});
});

export default router;
