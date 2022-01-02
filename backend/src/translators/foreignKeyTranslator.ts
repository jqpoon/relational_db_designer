import Entity from "../models/entity";
import Attribute from "../models/attribute"
import Relationship, { LHConstraint } from "../models/relationship";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

export const getPrimaryKey = (entity: Entity): Attribute => {

    for (var attribute of entity.attributes ?? []) {
        if (attribute.isPrimaryKey) {
            return attribute;
        }
    }
    throw new Error("no primary key found!");
};

class ForeignKeyTranslator implements Translator {

    entities: Map<string, Entity>;
    relationships: Map<string, Relationship>;

    constructor(entities: Map<string, Entity>, relationships: Map<string, Relationship>) {
        this.entities = entities;
        this.relationships = relationships
    }

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
        this.relationships.forEach((relationship: Relationship) => {
            var oneMany:boolean = false;
            var oneManySource:string = "-1";
            relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                if (lhConstraint === LHConstraint.ONE_TO_ONE) {
                    oneMany = true;
                    oneManySource = entityID;
                }
            })

            if (oneMany) {
                const sourceEntity: Entity = this.entities.get(oneManySource)!
                var table: Table = translatedTable.tables.get(sourceEntity.text)!
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                    if (lhConstraint != LHConstraint.ONE_TO_ONE) {
                        const foreignTable = this.entities.get(entityID)!.text
                        const key: string = getPrimaryKey(this.entities.get(entityID)!).text
                        const foreignKey: ForeignKey = {
                            keyName: sourceEntity.text + " " + foreignTable,
                            foreignTable: foreignTable,
                            columns: [key]
                        }
                        table.foreignKeys.push(foreignKey);
                    }
                });
                translatedTable.tables.set(sourceEntity.text, table);
            } else {
                var table: Table = translatedTable.tables.get(relationship.text)!
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                    const key: string = getPrimaryKey(this.entities.get(entityID)!).text;
                    const foreignTable = this.entities.get(entityID)!.text;
                    const foreignKey: ForeignKey = {
                        keyName: relationship.text + " " + foreignTable,
                        foreignTable: foreignTable,
                        columns: [key]
                    }
                    table.foreignKeys.push(foreignKey);
                });
                translatedTable.tables.set(relationship.text, table);
            }
        });

        this.entities.forEach((entity: Entity) => {
            if (entity.subsets !== undefined) {
                var table: Table = translatedTable.tables.get(entity.text)!
                const key: string = getPrimaryKey(entity).text;
                entity.subsets.map((s: Entity) => {
                    const foreignTable = s.text;
                    const foreignKey: ForeignKey = {
                        keyName: entity.text + " " + foreignTable,
                        foreignTable: foreignTable,
                        columns: [key]
                    }
                    table.foreignKeys.push(foreignKey);
                });
                translatedTable.tables.set(entity.text, table);
            }
        });
        return translatedTable
    }
}

export default ForeignKeyTranslator
