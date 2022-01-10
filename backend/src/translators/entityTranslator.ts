import Attribute from "../models/attribute";
import Entity from "../models/entity";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";
import { getPrimaryKey } from "./foreignKeyTranslator";

class EntityTranslator implements Translator {
	entity: Entity;
	entities: Map<string, Entity>;

	constructor(entity: Entity, entities: Map<string, Entity>) {
		this.entity = entity;
		this.entities = entities;
	}
	
	translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
		// Translates entity's table and populates it with attributes. 
		var columns: Array<Column> = [];
		if (this.entity.attributes !== undefined) {
			this.entity.attributes!.map((a: Attribute) => {
				if (a.isMultiValued) {
					// Each multi-valued attribute is also 
					// stored in its own table, 
					// with the key attributes of it's entity's table.
					var aColumns: Array<Column> = [];
					var fColumns: Array<string> = [];
					this.entity.attributes!.map((att: Attribute) => {
						if (att.id != a.id) {
							aColumns.push({
								columnName: att.text,
								isPrimaryKey: true,
								isOptional: false,
								isMultiValued: false,
							});
							if (att.isPrimaryKey) {
								fColumns.push(att.text);
							}
						}
					});
					// A foreign key is also created from 
					// the attribute's table to the entity's table.
					var foreignKeys: Array<ForeignKey> = new Array<ForeignKey>();
					foreignKeys.push({
						keyName: this.entity.text + " " + a.text,
						foreignTable: this.entity.text,
						columns: fColumns,
					});
					var aTable: Table = {
						source: TableSource.MULTI_ATTRIBUTE,
						columns: aColumns,
						foreignKeys: foreignKeys,
					};
					translatedTable.tables.set(this.entity.text + "_" + a.text, aTable);
				} else {
					// Regular Attribute
					columns.push({
						columnName: a.text,
						isPrimaryKey: a.isPrimaryKey,
						isOptional: a.isOptional,
						isMultiValued: a.isMultiValued,
					});
				}
			});
		}
		if (this.entity.subsets !== undefined) {
			// Adds the primary keys of entity tables to those of their subsets
			for (var s of this.entity.subsets) {
				var e = this.entities.get(s)!;
				var a: Attribute = getPrimaryKey(e);
				columns.push({
					columnName: a.text,
					isPrimaryKey: a.isPrimaryKey,
					isOptional: a.isOptional,
					isMultiValued: a.isMultiValued,
				});
			}
		}
		var entityTable: Table = {
			source: TableSource.ENTITY,
			columns: columns,
			foreignKeys: new Array<ForeignKey>(),
		};
		translatedTable.tables.set(this.entity.text, entityTable);
		return translatedTable;
	}
}

export default EntityTranslator;
