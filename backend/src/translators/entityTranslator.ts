import Attribute from "../models/attribute";
import Entity from "../models/entity";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

class EntityTranslator implements Translator {

    entity: Entity;

    constructor(entity: Entity) {
        this.entity = entity;
    }

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
        var columns: Array<Column> = new Array();
        if (this.entity.attributes !== undefined) {
            columns =
                this.entity.attributes!.map((a: Attribute) => {
                return {
                    columnName: a.text,
                    isPrimaryKey: a.isPrimaryKey,
                    isOptional: a.isOptional,
                    isMultiValued: a.isMultiValued
                    }
                })
        }
        var entityTable: Table = {
            source: TableSource.ENTITY,
            columns: columns,
            foreignKeys: new Array<ForeignKey>()
        }
        translatedTable.tables.set(this.entity.text, entityTable)
        return translatedTable
    }
}

export default EntityTranslator
