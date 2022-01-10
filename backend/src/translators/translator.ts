import TranslatedTable from "./models/translatedTable";

interface Translator {
	translateFromDiagramToTable(translatedTable: TranslatedTable): TranslatedTable;
}

export default Translator;
