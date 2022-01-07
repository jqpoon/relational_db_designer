import Attribute from "../models/attribute";
import Entity from "../models/entity";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";
import { getPrimaryKey } from './foreignKeyTranslator';

class EntityTranslator implements Translator {

    entity: Entity;
    entities: Map<string, Entity>;

    constructor(entity: Entity, entities: Map<string, Entity>) {
        this.entity = entity;
        this.entities = entities;
    }

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
        var columns: Array<Column> = [];
        if (this.entity.attributes !== undefined) {
            this.entity.attributes!.map((a: Attribute) => {
            columns.push({
                columnName: a.text,
                isPrimaryKey: a.isPrimaryKey,
                isOptional: a.isOptional,
                isMultiValued: a.isMultiValued
                });
            });
        }
        if (this.entity.subsets !== undefined) {
            for (var s of this.entity.subsets) {
                var e = this.entities.get(s)!
                var a: Attribute = getPrimaryKey(e);
                columns.push({
                    columnName: a.text,
                    isPrimaryKey: a.isPrimaryKey,
                    isOptional: a.isOptional,
                    isMultiValued: a.isMultiValued
                });
            }
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
