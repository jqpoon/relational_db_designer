import Entity from "src/models/entity";
import Attribute from "../models/attribute";
import Relationship, { LHConstraint } from "../models/relationship";
import { getPrimaryKey, getPrimaryKeyTranslated} from "./foreignKeyTranslator";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

class RelationshipTranslator implements Translator {

    relationship: Relationship;
    entities: Map<string, Entity>;
    relationships: Map<string, Relationship>;

    constructor(entities: Map<string, Entity>, relationship: Relationship, 
        relationships: Map<string, Relationship>) {
        this.relationship = relationship;
        this.entities = entities;
        this.relationships = relationships
    }

    parseEntity(entityName: string, translatedTable: TranslatedTable, 
        columns: Array<Column>, columnSources: Map<string, string>): void {

        var table: Table = translatedTable.tables.get(entityName)!
        const column: Column = getPrimaryKeyTranslated(table.columns);
        var dupe: boolean = false;
        columns.map((prevColumn: Column) => {
            if (prevColumn.columnName == column.columnName) {
                dupe = true;
                columns = columns.filter(function(col){ 
                    return col.columnName != column.columnName; 
                });
                const prevColumnSource: string = columnSources.get(column.columnName)!;
                const newPrevColumnName: string = prevColumnSource + "_" + column.columnName;
                const newPrevColumn: Column = {
                    columnName: newPrevColumnName,
                    isPrimaryKey: prevColumn.isPrimaryKey,
                    isOptional: prevColumn.isOptional,
                    isMultiValued: prevColumn.isMultiValued
                }
                columns.push(newPrevColumn)
                columnSources.set(newPrevColumnName, prevColumnSource)

                //incoming column
                const newIncColumnName:string = entityName + "_" + column.columnName;
                const newIncColumn: Column = {
                    columnName: newIncColumnName,
                    isPrimaryKey: column.isPrimaryKey,
                    isOptional: column.isOptional,
                    isMultiValued: column.isMultiValued
                }
                columns.push(newIncColumn)
                columnSources.set(newIncColumnName, entityName)
            }
        });
        if (!dupe) {
            columns.push(column);
            columnSources.set(column.columnName, entityName);
        }
    }

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
        var oneMany:boolean = false;
        this.relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
            if (lhConstraint == LHConstraint.ONE_TO_ONE) {
                oneMany = true;
                var otherEntity: Entity = {
                    id: "",
                    text: "",
                    pos: {x: -1, y: -1}
                };
                this.relationship.lHConstraints.forEach((lhC: LHConstraint, e: string) => {
                    if (lhC != LHConstraint.ONE_TO_ONE) {
                        otherEntity = this.entities.get(e)!;
                        console.log(e)
                    }
                });
                const otherKey: Attribute = getPrimaryKey(otherEntity);
                const thisEntity: Entity = this.entities.get(entityID)!;
                const entityTable: Table = translatedTable.tables.get(thisEntity.text)!;
                entityTable.columns.push({
                    columnName: otherKey.text,
                    isPrimaryKey: this.entities.get(entityID)!.isWeak || false,
                    isOptional: otherKey.isOptional,
                    isMultiValued: otherKey.isMultiValued
                })

                this.relationship.attributes!.map((a: Attribute) => {
                    entityTable.columns.push({
                        columnName: a.text,
                        isPrimaryKey: a.isPrimaryKey,
                        isOptional: a.isOptional,
                        isMultiValued: a.isMultiValued
                        });
                })

                translatedTable.tables.set(thisEntity.text, entityTable);
            }
        });
        if (!oneMany) {
            // one-many relationships should not have tables
            var columns: Array<Column> = new Array<Column>();
            if (this.relationship.attributes !== undefined) {
                this.relationship.attributes!.map((a: Attribute) => {
                    columns.push({
                        columnName: a.text,
                        isPrimaryKey: a.isPrimaryKey,
                        isOptional: a.isOptional,
                        isMultiValued: a.isMultiValued
                        });
                });
            }
            var columnSources: Map<string, string> = new Map<string, string>();
            this.relationship.lHConstraints.forEach((lhConstraint: LHConstraint, ID: string) => {
                var object = this.entities.get(ID)
                if (object != null) {
                    //entity
                    var entityName = object.text;
                    this.parseEntity(entityName, translatedTable, columns, columnSources);
                } else {
                    //relationship
                    if (lhConstraint == LHConstraint.ONE_TO_ONE) {
                        var rs = this.relationships.get(ID)!;
                        rs.attributes!.map((a:Attribute) => {
                            columns.push({
                                columnName: a.text,
                                isPrimaryKey: a.isPrimaryKey,
                                isOptional: a.isOptional,
                                isMultiValued: a.isMultiValued
                                });
                        })
                    } else {
                        var rs = this.relationships.get(ID)!;
                        var rsTable: Table = translatedTable.tables.get(rs.text)!;
                        if (rsTable != undefined) {
                            rsTable.columns.map((c: Column) => {
                                if (c.isPrimaryKey) {
                                    columns.push(c)
                                }
                            })
                        } else {
                            rs.attributes!.map((a:Attribute) => {
                                if (a.isPrimaryKey) {
                                    columns.push({
                                        columnName: a.text,
                                        isPrimaryKey: a.isPrimaryKey,
                                        isOptional: a.isOptional,
                                        isMultiValued: a.isMultiValued
                                        });
                                }
                            })
                        }
                    }
                } 
            });
            var rsTable: Table = { 
                source: TableSource.RELATIONSHIP,
                columns: columns,
                foreignKeys: new Array<ForeignKey>()
            }
            translatedTable.tables.set(this.relationship.text, rsTable)
        }
        return translatedTable
    }

}

export default RelationshipTranslator