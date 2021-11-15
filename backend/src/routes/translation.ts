import {OK} from "http-status-codes";
import {Router} from "express";
import Entity from "src/models/entity";
import Relationship, {LHConstraint} from "src/models/relationship";
import FullTranslator from "src/translators/fullTranslator";
import TranslatedSchema from "src/translators/models/translatedSchema";
import { saveAll } from "./schema";

const router = Router();

const parseEntities = (entities: Entity[]): Map<number, Entity> => {
    var entityMap = new Map<number, Entity>();
    for (var entity of entities) {
        entityMap.set(entity.identifier, entity);
    }
    return entityMap;
};

const parseRelationships = (relationships: Relationship[]): Map<number, Relationship> => {
    var rsMap = new Map<number, Relationship>();
    for (var rs of relationships) {
        rsMap.set(rs.identifier, rs);
    }
    return rsMap;
};

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
                    isPrimaryKey: true,
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
                    isPrimaryKey: true,
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
    // Translate
    const translator: FullTranslator = new FullTranslator(
        parseEntities(mockEntity), parseRelationships(mockRelationship));
    const translatedSchema: TranslatedSchema = translator.translateFromDiagramToSchema();
    console.log(translatedSchema)
    // Return translation
    return res.status(OK).json({SUCCESS: true, translation: {
        entities: Object.fromEntries(translatedSchema.entities),
        relationships: Object.fromEntries(translatedSchema.relationships),
        foreignKeys: Object.fromEntries(translatedSchema.foreignKey)
    }});
});

router.post('/translate', async function (req, res, next) {
    // TODO add error catching

    // Parse req body for entities and relationships
    var modelAsJson = req.body;
    var entities: Entity[] = modelAsJson.entities;
    var relationships: Relationship[] = modelAsJson.relationships;

    // // Save to database
    // saveAll(entities, relationships);

    // Translate
    const translator: FullTranslator = new FullTranslator(
        parseEntities(entities), parseRelationships(relationships));
    const translatedSchema: TranslatedSchema = translator.translateFromDiagramToSchema();

    // Return translation
    return res.status(OK).json({SUCCESS: true, translation: {
        entities: Object.fromEntries(translatedSchema.entities),
        relationships: Object.fromEntries(translatedSchema.relationships),
        foreignKeys: Object.fromEntries(translatedSchema.foreignKey)
    }});
})

export default router;
