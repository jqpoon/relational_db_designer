interface TranslatedTable {
    // Map from table names to tables
	tables: Map<string, Table>;
}

interface Table {
	source: TableSource;
	columns: Array<Column>;
	foreignKeys: Array<ForeignKey>;
}

enum TableSource {
	ENTITY,
	RELATIONSHIP,
	MULTI_ATTRIBUTE,
}

interface Column {
	columnName: string;
	isPrimaryKey: boolean;
	isOptional: boolean;
	isMultiValued: boolean;
}

interface ForeignKey {
    // keyName should be concatenation of source and foreign table names
	keyName: string;
	foreignTable: string;
	columns: Array<string>; 
}

export default TranslatedTable;
export { Table, TableSource, Column, ForeignKey };
