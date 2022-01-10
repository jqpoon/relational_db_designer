import Entity from "../models/entity";
import Attribute from "../models/attribute";
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
};

class ForeignKeyTranslator implements Translator {
	entities: Map<string, Entity>;
	relationships: Map<string, Relationship>;

	constructor(entities: Map<string, Entity>, relationships: Map<string, Relationship>) {
		this.entities = entities;
		this.relationships = relationships;
	}

	translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
		this.relationships.forEach((relationship: Relationship) => {
			var oneMany: boolean = false;
			var oneManySource: string = "-1";
			// Check if relationship should be treated as one-many or many-many
			relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
				if (lhConstraint == LHConstraint.ONE_TO_ONE) {
					oneMany = true;
					oneManySource = entityID;
				}
			});

			// one-many
			if (oneMany) {
				const source =
					this.entities.get(oneManySource) || this.relationships.get(oneManySource);
				var table: Table = translatedTable.tables.get(source!.text)!;
				relationship.lHConstraints.forEach((lhConstraint: LHConstraint, ID: string) => {
					if (lhConstraint != LHConstraint.ONE_TO_ONE) {
						const foreignTable = this.entities.get(ID);
						if (foreignTable != undefined && table != undefined) {
							const foreignTableName = foreignTable!.text;
							const keys: string[] = [];
							for (var attribute of foreignTable!.attributes ?? []) {
								if (attribute.isPrimaryKey) {
									keys.push(attribute.text);
								}
							}
							const foreignKey: ForeignKey = {
								keyName: source!.text + " " + foreignTableName,
								foreignTable: foreignTableName,
								columns: keys,
							};
							table.foreignKeys.push(foreignKey);
						}
					}
				});
				translatedTable.tables.set(source!.text, table);
			} else {
				// many-many
				var table: Table = translatedTable.tables.get(relationship.text)!;
				relationship.lHConstraints.forEach((lhConstraint: LHConstraint, ID: string) => {
					var foreignTable = this.entities.get(ID)!;
					if (foreignTable != undefined) {
						// foreign table is entity
						var translatedForeignTable: Table = translatedTable.tables.get(
							foreignTable!.text
						)!;
						const foreignTableName = foreignTable!.text;

						// get foreign keys
						const keys: string[] = [];
						for (var col of translatedForeignTable.columns) {
							if (col.isPrimaryKey) {
								keys.push(col.columnName);
							}
						}

						// push foreign key to table
						const foreignKey: ForeignKey = {
							keyName: relationship.text + " " + foreignTableName,
							foreignTable: foreignTableName,
							columns: keys,
						};
						table.foreignKeys.push(foreignKey);
					} else {
						// foreign table is relationship
						foreignTable = this.relationships.get(ID)!;
						const foreignTableName: string = foreignTable!.text;
						var translatedForeignTable: Table = translatedTable.tables.get(
							foreignTable!.text
						)!;

						// get foreign keys
						const keys: string[] = [];
						var correctKeys = false;
						for (var col of translatedForeignTable.columns) {
							if (col.isPrimaryKey) {
								keys.push(col.columnName);
								var correctKey = false;
								// validate foreign key (for nested rs)
								for (var localCol of table.columns) {
									if (localCol.columnName == col.columnName) {
										correctKey = true;
										break;
									}
								}
								correctKeys = correctKey;
								if (!correctKeys) {
									break;
								}
							}
						}
						if (correctKeys) {
							// push foreign key to table
							const foreignKey: ForeignKey = {
								keyName: relationship.text + " " + foreignTableName,
								foreignTable: foreignTableName,
								columns: keys,
							};
							table.foreignKeys.push(foreignKey);
						}
					}
				});
				translatedTable.tables.set(relationship.text, table);
			}
		});

		// foreign keys for subsets
		this.entities.forEach((entity: Entity) => {
			if (entity.subsets !== undefined && entity.subsets.length != 0) {
				var table: Table = translatedTable.tables.get(entity.text)!;

				// create foreign key with entity's primary key to its subsets
				const key: string = getPrimaryKeyTranslated(table.columns).columnName;
				entity.subsets.map((s: string) => {
					const foreignTable = this.entities.get(s)!.text;
					const foreignKey: ForeignKey = {
						keyName: entity.text + " " + foreignTable,
						foreignTable: foreignTable,
						columns: [key],
					};
					table.foreignKeys.push(foreignKey);
				});
				translatedTable.tables.set(entity.text, table);
			}
		});
		return translatedTable;
	}
}

export default ForeignKeyTranslator;
