import Entity from "../models/entity";
import Relationship, { LHConstraint } from "../models/relationship";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
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

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
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
                const sourceEntity: Entity = this.entities.get(oneManySource)!
                var table: Table = translatedTable.tables.get(sourceEntity.name)!
                const key: string = this.getPrimaryKey(sourceEntity)
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: Number) => {
                    if (lhConstraint != LHConstraint.ONE_TO_ONE) {
                        const foreignTable = this.entities.get(entityID)!.name
                        const foreignKey: ForeignKey = {
                            keyName: sourceEntity.name + " " + foreignTable,
                            foreignTable: foreignTable,
                            columns: [key]
                        }
                        table.foreignKeys.push(foreignKey);
                    }
                });
            } else {
                var table: Table = translatedTable.tables.get(relationship.name)!
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: Number) => {
                    const key: string = this.getPrimaryKey(this.entities.get(entityID)!);
                    const foreignTable = this.entities.get(entityID)!.name
                    const foreignKey: ForeignKey = {
                        keyName: relationship.name + " " + foreignTable,
                        foreignTable: foreignTable,
                        columns: [key]
                    }
                    table.foreignKeys.push(foreignKey);
                });
            }
        });
        return translatedTable
    }
}

export default ForeignKeyTranslator
