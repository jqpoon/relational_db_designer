import Entity from "../models/entity";
import Relationship, { LHConstraint } from "../models/relationship";
import TranslatedSchema from "./models/translatedSchema";
import Translator from "./translator";

class ForeignKeyTranslator implements Translator {

    entities: Map<Number, Entity>;
    relationships: Map<Number, Relationship>;

    constructor(entities: Map<Number, Entity>, relationships: Map<Number, Relationship>) {
        this.entities = entities;
        this.relationships = relationships
    }

    getPrimaryKey(entity: Entity): string {
        for (var attribute of entity.attributes ?? []) {
            if (attribute.isPrimaryKey) {
                return attribute.name;
            }
        }
        throw new Error("no primary key found!");
    }

    translateFromDiagramToSchema(translatedSchema: TranslatedSchema): TranslatedSchema {
        this.relationships.forEach((relationship: Relationship) => {
            var oneMany:boolean = false;
            var oneManySource:Number = -1;
            console.log(relationship.lHConstraints)
            relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: Number) => {
                if (lhConstraint == LHConstraint.ONE_TO_ONE) {
                    oneMany = true;
                    oneManySource = entityID;
                }
            });

            if (oneMany) {
                const foreignKey: string = this.getPrimaryKey(this.entities.get(oneManySource)!)
                const foreignKeySchema: Array<string> = [this.entities.get(oneManySource)!.name, foreignKey]
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: Number) => {
                    if (lhConstraint != LHConstraint.ONE_TO_ONE) {
                        foreignKeySchema.push(this.entities.get(entityID)!.name);
                    }
                });
                translatedSchema.foreignKey.push(foreignKeySchema);
            } else {
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: Number) => {
                    console.log(entityID)
                    const foreignKey: string = this.getPrimaryKey(this.entities.get(entityID)!);
                    const foreignKeySchema: Array<string> = [relationship.name, foreignKey, this.entities.get(entityID)!.name]
                    translatedSchema.foreignKey.push(foreignKeySchema);
                });
            }
        });
        return translatedSchema
    }
}

export default ForeignKeyTranslator
