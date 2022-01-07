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

export const getPrimaryKeyTranslated = (cols: Array<Column>): Column => {
    for (var col of cols) {
        if (col.isPrimaryKey) {
            return col;
        }
    }
    throw new Error("no primary key found!");
}

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
                if (lhConstraint == LHConstraint.ONE_TO_ONE) {
                    console.log("one many!")
                    oneMany = true;
                    oneManySource = entityID;
                }
            })

            if (oneMany) {
                const source = this.entities.get(oneManySource)|| this.relationships.get(oneManySource)
                var table: Table = translatedTable.tables.get(source!.text)!
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, ID: string) => {
                    if (lhConstraint != LHConstraint.ONE_TO_ONE) {
                        const foreignTable = this.entities.get(ID) || this.relationships.get(ID)
                        const foreignTableName = foreignTable!.text
                        const key: string = getPrimaryKey(foreignTable!).text
                        const foreignKey: ForeignKey = {
                            keyName: source!.text + " " + foreignTableName,
                            foreignTable: foreignTableName,
                            columns: [key]
                        }
                        table.foreignKeys.push(foreignKey);
                    }
                });
                translatedTable.tables.set(source!.text, table);
            } else {
                var table: Table = translatedTable.tables.get(relationship.text)!
                // TODO: check for diff key name for nary rs
                console.log(relationship.text)
                relationship.lHConstraints.forEach((lhConstraint: LHConstraint, ID: string) => {
                    var foreignTable = this.entities.get(ID)!
                    if (foreignTable != undefined) {
                        // entity
                        var translatedForeignTable: Table = translatedTable.tables.get(foreignTable!.text)!;
                        const foreignTableName = foreignTable!.text;
                        const keys: string[] = []
                        for (var col of translatedForeignTable.columns) {
                            if (col.isPrimaryKey) {
                                keys.push(col.columnName)
                            }
                        }
                        const foreignKey: ForeignKey = {
                            keyName: relationship.text + " " + foreignTableName,
                            foreignTable: foreignTableName,
                            columns: keys
                        }
                        table.foreignKeys.push(foreignKey);
                    } else {
                        // relationship
                        foreignTable = this.relationships.get(ID)!
                        const foreignTableName: string = foreignTable!.text;
                        var translatedForeignTable: Table = translatedTable.tables.get(foreignTable!.text)!;
                        const keys: string[] = []
                        var correctKeys = false;
                        for (var col of translatedForeignTable.columns) {
                            if (col.isPrimaryKey) {
                                keys.push(col.columnName)
                                var correctKey = false
                                for (var localCol of table.columns) {
                                    if (localCol.columnName == col.columnName) {
                                        correctKey = true;
                                        break;
                                    }
                                }
                                correctKeys = correctKey
                                if (!correctKeys) {
                                    break;
                                } 
                            }
                        }
                        if (correctKeys) {
                            const foreignKey: ForeignKey = {
                                keyName: relationship.text + " " + foreignTableName,
                                foreignTable: foreignTableName,
                                columns: keys
                            }
                            console.log(foreignKey)
                            table.foreignKeys.push(foreignKey);
                        }
                    }
                });
                translatedTable.tables.set(relationship.text, table);
            }
        });

        this.entities.forEach((entity: Entity) => {
            if (entity.subsets !== undefined && entity.subsets.length != 0) {
                var table: Table = translatedTable.tables.get(entity.text)!
                const key: string = getPrimaryKeyTranslated(table.columns).columnName;
                entity.subsets.map((s: string) => {
                    const foreignTable = this.entities.get(s)!.text;
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
