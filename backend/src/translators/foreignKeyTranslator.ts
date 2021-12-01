import Entity from "../models/entity";
import Relationship, { LHConstraint } from "../models/relationship";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

class ForeignKeyTranslator implements Translator {

    entities: Map<string, Entity>;
    relationships: Map<string, Relationship>;

    constructor(entities: Map<string, Entity>, relationships: Map<string, Relationship>) {
        this.entities = entities;
        this.relationships = relationships
    }

    getPrimaryKey(entity: Entity): string {
        for (var attribute of entity.attributes ?? []) {
            if (attribute.isPrimaryKey) {
                return attribute.text;
            }
        }
        throw new Error("no primary key found!");
    }

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
        this.relationships.forEach((relationship: Relationship) => {
            var oneMany:boolean = false;
            var oneManySource:string = "-1";
            console.log(relationship.lHConstraints)
            relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                if (lhConstraint == LHConstraint.ONE_TO_ONE) {
                    oneMany = true;
                    oneManySource = entityID;
                }
            });

            if (oneMany) {
                const sourceEntity: Entity = this.entities.get(oneManySource)!
                var table: Table = translatedTable.tables.get(sourceEntity.text)!
                const key: string = this.getPrimaryKey(sourceEntity)
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                    if (lhConstraint != LHConstraint.ONE_TO_ONE) {
                        const foreignTable = this.entities.get(entityID)!.text
                        const foreignKey: ForeignKey = {
                            keyName: sourceEntity.text + " " + foreignTable,
                            foreignTable: foreignTable,
                            columns: [key]
                        }
                        table.foreignKeys.push(foreignKey);
                    }
                });
            } else {
                var table: Table = translatedTable.tables.get(relationship.text)!
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                    const key: string = this.getPrimaryKey(this.entities.get(entityID)!);
                    const foreignTable = this.entities.get(entityID)!.text
                    const foreignKey: ForeignKey = {
                        keyName: relationship.text + " " + foreignTable,
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
