import Entity from "src/models/entity";
import Attribute from "../models/attribute";
import Relationship, { LHConstraint } from "../models/relationship";
import { getPrimaryKey } from "./foreignKeyTranslator";
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
                const otherKey: Attribute = getPrimaryKey(otherEntity);
                const thisEntity: Entity = this.entities.get(entityID)!;
                const entityTable: Table = translatedTable.tables.get(thisEntity.text)!;
                entityTable.columns.push({
                    columnName: otherKey.text,
                    isPrimaryKey: this.entities.get(entityID)!.isWeak || false,
                    isOptional: otherKey.isOptional,
                    isMultiValued: otherKey.isMultiValued
                })
                translatedTable.tables.set(thisEntity.text, entityTable);
            }
        });
        if (!oneMany) {
            //one-many relationships should not have tables
            var columns: Array<Column> = new Array();
            this.relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
                const attribute: Attribute = getPrimaryKey(this.entities.get(entityID)!);
                const column: Column = {
                    columnName: attribute.text,
                    isPrimaryKey: attribute.isPrimaryKey,
                    isOptional: attribute.isOptional,
                    isMultiValued: attribute.isMultiValued
                }
                columns.push(column);
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