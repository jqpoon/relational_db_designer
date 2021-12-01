import Attribute from "../models/attribute";
import Relationship from "../models/relationship";
import TranslatedSchema, {AttributesSchema} from "./models/translatedSchema";
import Translator from "./translator";

class RelationshipTranslator implements Translator {

    relationship: Relationship;

    constructor(relationship: Relationship) {
        this.relationship = relationship;
    }

    translateFromDiagramToSchema(translatedSchema: TranslatedSchema): TranslatedSchema {
        if (this.relationship.attributes !== undefined) {
            const relationshipAttributeSchema: Array<AttributesSchema> =
                this.relationship.attributes!.map((a: Attribute) => {
                return {
                    name: a.name,
                    isPrimaryKey: a.isPrimaryKey,
                    isOptional: a.isOptional
                }
            })

            translatedSchema.relationships.set(this.relationship.name, relationshipAttributeSchema)
        }

        return translatedSchema;
    }

}

export default RelationshipTranslator