import Entity from "src/models/entity";
import Attribute from "../models/attribute";
import Relationship, { LHConstraint } from "../models/relationship";
import { getPrimaryKey, getPrimaryKeyTranslated } from "./foreignKeyTranslator";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

class RelationshipTranslator implements Translator {
	relationship: Relationship;
	entities: Map<string, Entity>;
	relationships: Map<string, Relationship>;

	constructor(
		entities: Map<string, Entity>,
		relationship: Relationship,
		relationships: Map<string, Relationship>
	) {
		this.relationship = relationship;
		this.entities = entities;
		this.relationships = relationships;
	}

	translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
		var oneMany: boolean = false;
		this.relationship.lHConstraints.forEach((lhConstraint: LHConstraint, entityID: string) => {
			if (lhConstraint == LHConstraint.ONE_TO_ONE) {
				oneMany = true;
				// One-many relationships do not have their own tables
				var otherEntity: Entity = {
					id: "",
					text: "",
					pos: { x: -1, y: -1 },
				};
				this.relationship.lHConstraints.forEach((lhC: LHConstraint, e: string) => {
					if (lhC != LHConstraint.ONE_TO_ONE) {
						otherEntity = this.entities.get(e)!;
					}
				});
				// Assigns the primary keys of the entity table corresponding to the "many" side, 
				// as well as the attributes of the relationship, 
				// to the entity table corresponding to the "one" side
				const otherKey: Attribute = getPrimaryKey(otherEntity);
				const thisEntity: Entity = this.entities.get(entityID)!;
				if (thisEntity != undefined) {
					const entityTable: Table = translatedTable.tables.get(thisEntity.text)!;
					var columnSources: Map<string, string> = new Map<string, string>();

					// Checks for duplicate incoming attribute names and 
					// appends the source to the front of the name if it is repeated
					var dupe: boolean = false;
					entityTable.columns.map((prevColumn: Column) => {
						if (prevColumn.columnName == otherKey.text) {
							dupe = true;
							entityTable.columns = entityTable.columns.filter(function (col) {
								return col.columnName != otherKey.text;
							});
							const prevColumnSource: string =
								columnSources.get(otherKey.text) || thisEntity.text;
							const newPrevColumnName: string =
								prevColumnSource + "_" + otherKey.text;
							const newPrevColumn: Column = {
								columnName: newPrevColumnName,
								isPrimaryKey: this.entities.get(entityID)!.isWeak || false,
								isOptional: otherKey.isOptional,
								isMultiValued: otherKey.isMultiValued,
							};
							entityTable.columns.push(newPrevColumn);
							columnSources.set(newPrevColumnName, prevColumnSource);

							//incoming column
							const newIncColumnName: string = otherEntity.text + "_" + otherKey.text;
							const newIncColumn: Column = {
								columnName: newIncColumnName,
								isPrimaryKey: this.entities.get(entityID)!.isWeak || false,
								isOptional: otherKey.isOptional,
								isMultiValued: otherKey.isMultiValued,
							};
							entityTable.columns.push(newIncColumn);
							columnSources.set(newIncColumnName, otherEntity.text);
						}
					});
					if (!dupe) {
						entityTable.columns.push({
							columnName: otherKey.text,
							isPrimaryKey: this.entities.get(entityID)!.isWeak || false,
							isOptional: otherKey.isOptional,
							isMultiValued: otherKey.isMultiValued,
						});
						columnSources.set(otherKey.text, otherEntity.text);
					}

					this.relationship.attributes!.map((a: Attribute) => {
						entityTable.columns.push({
							columnName: a.text,
							isPrimaryKey: a.isPrimaryKey,
							isOptional: a.isOptional,
							isMultiValued: a.isMultiValued,
						});
					});

					translatedTable.tables.set(thisEntity.text, entityTable);
				} else {
					// relationship
					// In the case of nested relationships, 
					// the connected relationship is mapped as if it were an entity. 
					var rs = this.relationships.get(entityID)!;
					var rsTable: Table = translatedTable.tables.get(rs.text)!;
					if (rsTable != undefined) {
						var columns: Array<Column> = new Array<Column>();
						if (this.relationship.attributes !== undefined) {
							this.relationship.attributes!.map((a: Attribute) => {
								columns.push({
									columnName: a.text,
									isPrimaryKey: a.isPrimaryKey,
									isOptional: a.isOptional,
									isMultiValued: a.isMultiValued,
								});
							});
						}
						rsTable.columns.map((c: Column) => {
							if (c.isPrimaryKey) {
								columns.push(c);
							}
						});
						var rTable: Table = {
							source: TableSource.RELATIONSHIP,
							columns: columns,
							foreignKeys: new Array<ForeignKey>(),
						};
						translatedTable.tables.set(this.relationship.text, rTable);
					} else {
						var columns: Array<Column> = new Array<Column>();
						if (this.relationship.attributes !== undefined) {
							this.relationship.attributes!.map((a: Attribute) => {
								columns.push({
									columnName: a.text,
									isPrimaryKey: a.isPrimaryKey,
									isOptional: a.isOptional,
									isMultiValued: a.isMultiValued,
								});
							});
						}
						rs.attributes!.map((a: Attribute) => {
							if (a.isPrimaryKey) {
								columns.push({
									columnName: a.text,
									isPrimaryKey: a.isPrimaryKey,
									isOptional: a.isOptional,
									isMultiValued: a.isMultiValued,
								});
							}
						});
						rsTable = {
							source: TableSource.RELATIONSHIP,
							columns: columns,
							foreignKeys: new Array<ForeignKey>(),
						};
						translatedTable.tables.set(this.relationship.text, rsTable);
					}
				}
			}
		});
		if (!oneMany) {
			// Many-many relationships
			
			// The relationship's table is created and populated with its attributes. 
			var columns: Array<Column> = new Array<Column>();
			if (this.relationship.attributes !== undefined) {
				this.relationship.attributes!.map((a: Attribute) => {
					columns.push({
						columnName: a.text,
						isPrimaryKey: a.isPrimaryKey,
						isOptional: a.isOptional,
						isMultiValued: a.isMultiValued,
					});
				});
			}

			// Primary keys of its related entities are also pushed to its table.
			var columnSources: Map<string, string> = new Map<string, string>();
			this.relationship.lHConstraints.forEach((lhConstraint: LHConstraint, ID: string) => {
				var object = this.entities.get(ID);
				if (object != null) {
					// Entity
					var entityName = object.text;
					var table: Table = translatedTable.tables.get(entityName)!;

					// Push primary key of related entity to relationship's table
					const column: Column = getPrimaryKeyTranslated(table.columns);
					var dupe: boolean = false;

					// Checks for duplicate objects and appends to source name
					columns.map((prevColumn: Column) => {
						if (prevColumn.columnName == column.columnName) {
							dupe = true;

							// Remove old column
							columns = columns.filter(function (col) {
								return col.columnName != column.columnName;
							});

							// Previous column
							const prevColumnSource: string = columnSources.get(column.columnName)!;
							const newPrevColumnName: string =
								prevColumnSource + "_" + column.columnName;
							const newPrevColumn: Column = {
								columnName: newPrevColumnName,
								isPrimaryKey: prevColumn.isPrimaryKey,
								isOptional: prevColumn.isOptional,
								isMultiValued: prevColumn.isMultiValued,
							};
							columns.push(newPrevColumn);
							columnSources.set(newPrevColumnName, prevColumnSource);

							// Incoming column
							const newIncColumnName: string = entityName + "_" + column.columnName;
							const newIncColumn: Column = {
								columnName: newIncColumnName,
								isPrimaryKey: column.isPrimaryKey,
								isOptional: column.isOptional,
								isMultiValued: column.isMultiValued,
							};
							columns.push(newIncColumn);
							columnSources.set(newIncColumnName, entityName);
						}
					});
					if (!dupe) {
						columns.push(column);
						columnSources.set(column.columnName, entityName);
					}
				} else {
					// Relationship
					var rs = this.relationships.get(ID)!;
					var rsTable: Table = translatedTable.tables.get(rs.text)!;

					// Push primary key of related rs to relationship's table
					if (rsTable != undefined) {
						rsTable.columns.map((c: Column) => {
							if (c.isPrimaryKey) {
								columns.push(c);
							}
						});
					} else {
						rs.attributes!.map((a: Attribute) => {
							if (a.isPrimaryKey) {
								columns.push({
									columnName: a.text,
									isPrimaryKey: a.isPrimaryKey,
									isOptional: a.isOptional,
									isMultiValued: a.isMultiValued,
								});
							}
						});
					}
				}
			});
			var rsTable: Table = {
				source: TableSource.RELATIONSHIP,
				columns: columns,
				foreignKeys: new Array<ForeignKey>(),
			};
			translatedTable.tables.set(this.relationship.text, rsTable);
		}
		return translatedTable;
	}
}

export default RelationshipTranslator;
