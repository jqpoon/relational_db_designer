interface TranslatedTable {
    tables: Map<string, Table>
}

interface Table {
    source: TableSource,
    columns: Map<string, Column>
    foreignKeys: Array<ForeignKey>
}

enum TableSource {
    ENTITY,
    RELATIONSHIP
}

interface Column {
    columnName: string,
    isPrimaryKey: boolean,
    isOptional: boolean
    isMultiValued: boolean
}

interface ForeignKey {
    keyName: string, //works_in person
    foreignTable: string, // person
    columns: Array<string> //salary_number
    //has to say which columns are affected by it
}

export default TranslatedTable
export { Table, TableSource, Column, ForeignKey }
