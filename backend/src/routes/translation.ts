import {OK} from "http-status-codes";
import {Router} from "express";
import Entity from "src/models/entity";
import Relationship, {LHConstraint} from "src/models/relationship";
import FullTranslator from "src/translators/fullTranslator";
import TranslatedTable from "src/translators/models/translatedTable";
import { saveAll } from "./schema";

const router = Router();

const parseEntities = (entities: Entity[]): Map<string, Entity> => {
    var entityMap = new Map<string, Entity>();
    for (var entity of entities) {
        entityMap.set(entity.id, entity);
    }
    return entityMap;
};

const parseRelationships = (relationships: Relationship[]): Map<string, Relationship> => {
    var rsMap = new Map<string, Relationship>();
    for (var rs of relationships) {
        rsMap.set(rs.id, rs);
    }
    return rsMap;
};

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
    const translatedTable: TranslatedTable = translator.translateFromDiagramToSchema();

    // Return translation
    return res.status(OK).json({SUCCESS: true, translatedtables: {
        tables: Object.fromEntries(translatedTable.tables),
    }});
})

export default router;
