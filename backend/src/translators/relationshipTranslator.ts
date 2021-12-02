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
        Object.keys(this.relationship.lHConstraints).forEach((entityId: string) => {
            let lhConstraint: LHConstraint = this.relationship.lHConstraints.get(entityId)!
            if (lhConstraint === LHConstraint.ONE_TO_ONE) {
                //one-many relationships should not have tables
                return translatedTable;
            }
        })
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
        // if (this.relationship.attributes !== undefined) {
        //     columns =
        //         this.relationship.attributes!.map((a: Attribute) => {
        //         return {
        //             columnName: a.text,
        //             isPrimaryKey: a.isPrimaryKey,
        //             isOptional: a.isOptional,
        //             isMultiValued: a.isMultiValued
        //             }
        //         })
        // }
        var rsTable: Table = { 
            source: TableSource.RELATIONSHIP,
            columns: columns,
            foreignKeys: new Array<ForeignKey>()
        }
        translatedTable.tables.set(this.relationship.text, rsTable)
        return translatedTable
    }

}

export default RelationshipTranslator