import Attribute from "../models/attribute";
import Relationship from "../models/relationship";
import TranslatedTable, { Table, TableSource, Column, ForeignKey } from "./models/translatedTable";
import Translator from "./translator";

class RelationshipTranslator implements Translator {

    relationship: Relationship;

    constructor(relationship: Relationship) {
        this.relationship = relationship;
    }

    translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable {
        var columns: Array<Column> = new Array();
        if (this.relationship.attributes !== undefined) {
            columns =
                this.relationship.attributes!.map((a: Attribute) => {
                return {
                    columnName: a.name,
                    isPrimaryKey: a.isPrimaryKey,
                    isOptional: a.isOptional
                    }
                })
        }
        var rsTable: Table = { 
            source: TableSource.RELATIONSHIP,
            columns: columns,
            foreignKeys: new Array<ForeignKey>()
        }
        translatedTable.tables.set(this.relationship.name, rsTable)
        return translatedTable
    }

}

export default RelationshipTranslator