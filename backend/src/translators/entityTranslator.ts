import Attribute from "src/models/attribute";
import Entity from "src/models/entity";
import TranslatedSchema, { AttributesSchema } from "./models/translatedSchema";
import Translator from "./translator";

class EntityTranslator implements Translator {

    entity: Entity;

    constructor(entity: Entity) {
        this.entity = entity;
    }

    translateFromDiagramToSchema(translatedSchema: TranslatedSchema): TranslatedSchema {
        var relationshipAttributeSchema: Array<AttributesSchema> = new Array();
        if (this.entity.attributes !== undefined) {
            relationshipAttributeSchema =
                this.entity.attributes!.map((a: Attribute) => {
                return {
                    name: a.name,
                    isPrimaryKey: a.isPrimaryKey,
                    isOptional: a.isOptional
                    }
                })
        }
        translatedSchema.entities.set(this.entity.name, relationshipAttributeSchema)
        return translatedSchema
    }
}
