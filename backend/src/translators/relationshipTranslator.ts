import Entity from "src/models/entity";
import Attribute from "../models/attribute";
import Relationship, { LHConstraint } from "../models/relationship";
import { getPrimaryKey, getPrimaryKeyTranslated} from "./foreignKeyTranslator";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

class RelationshipTranslator implements Translator {

    relationship: Relationship;
    entities: Map<string, Entity>;

    constructor(entities: Map<string, Entity>, relationship: Relationship) {
        this.relationship = relationship;
        this.entities = entities;
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
                    }
                });
                console.log(otherEntity)
                const otherKey: Attribute = getPrimaryKey(otherEntity);
                const thisEntity: Entity = this.entities.get(entityID)!;
                const entityTable: Table = translatedTable.tables.get(thisEntity.text)!;
                entityTable.columns.set(otherKey.text, {
                    columnName: otherKey.text,
                    isPrimaryKey: this.entities.get(entityID)!.isWeak || false,
                    isOptional: otherKey.isOptional,
                    isMultiValued: otherKey.isMultiValued
                })

                this.relationship.attributes!.map((a: Attribute) => {
                    entityTable.columns.set(otherKey.text, {
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
            //TODO: CHANGE COLUMNS TO A MAP AND CHECK FOR DUPLICATE COL NAMES
            var columns: Map<string, Column> = new Map<string, Column>();
            if (this.relationship.attributes !== undefined) {
                this.relationship.attributes!.map((a: Attribute) => {
                    columns.set(a.text, {
                        columnName: a.text,
                        isPrimaryKey: a.isPrimaryKey,
                        isOptional: a.isOptional,
                        isMultiValued: a.isMultiValued
                        });
                });
            }
            var columnSources: Map<string, string> = new Map<string, string>();
            this.relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                var entityName = this.entities.get(entityID)!.text
                var table: Table = translatedTable.tables.get(entityName)!
                const column: Column = getPrimaryKeyTranslated(table.columns);
                if (columns.has(column.columnName)) {
                    // previous column
                    const prevColumn: Column = columns.get(column.columnName)!;
                    const prevColumnSource: string = columnSources.get(column.columnName)!;
                    const newPrevColumnName: string = prevColumnSource + "_" + column.columnName;
                    const newPrevColumn: Column = {
                        columnName: newPrevColumnName,
                        isPrimaryKey: prevColumn.isPrimaryKey,
                        isOptional: prevColumn.isOptional,
                        isMultiValued: prevColumn.isMultiValued
                    }
                    columns.set(newPrevColumnName, newPrevColumn)
                    columnSources.set(newPrevColumnName, prevColumnSource)

                    //incoming column
                    const newIncColumnName:string = entityName + "_" + column.columnName;
                    const newIncColumn: Column = {
                        columnName: newIncColumnName,
                        isPrimaryKey: column.isPrimaryKey,
                        isOptional: column.isOptional,
                        isMultiValued: column.isMultiValued
                    }
                    columns.set(newIncColumnName, newIncColumn)
                    columnSources.set(newIncColumnName, entityName)
                } else {
                    columns.set(column.columnName, column);
                    columnSources.set(column.columnName, entityName);
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