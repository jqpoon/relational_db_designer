import Entity from "../models/entity";
import Relationship from "../models/relationship";
import EntityTranslator from "./entityTranslator";
import ForeignKeyTranslator from "./foreignKeyTranslator";
import TranslatedSchema, { AttributesSchema } from "./models/translatedSchema";
import RelationshipTranslator from "./relationshipTranslator";

class FullTranslator {

    entities: Map<Number, Entity>;
    relationships: Map<Number, Relationship>;

    constructor(entities: Map<Number, Entity>, relationships: Map<Number, Relationship>) {
        this.entities = entities;
        this.relationships = relationships
    }
    
    translateFromDiagramToSchema(): TranslatedSchema {
        var translatedSchema: TranslatedSchema = {
            entities: new Map<string, Array<AttributesSchema>>(), 
            relationships: new Map<string, Array<AttributesSchema>>(), 
            foreignKey: new Map<string, Array<string>>()
        }

        this.entities.forEach((entity: Entity) => { 
            const eTranslator:EntityTranslator = new EntityTranslator(entity);
            eTranslator.translateFromDiagramToSchema(translatedSchema);
        });

        this.relationships.forEach((relationship: Relationship) => { 
            const rsTranslator:RelationshipTranslator = new RelationshipTranslator(relationship);
            rsTranslator.translateFromDiagramToSchema(translatedSchema);
        });

        const fkTranslator:ForeignKeyTranslator = new ForeignKeyTranslator(this.entities, this.relationships);
        fkTranslator.translateFromDiagramToSchema(translatedSchema);

        return translatedSchema;
    }
}

export default FullTranslator