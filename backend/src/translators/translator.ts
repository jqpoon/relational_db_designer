import TranslatedSchema from "./models/translatedSchema";

interface Translator {

    translateFromDiagramToSchema(translatedSchema: TranslatedSchema): TranslatedSchema
}

export default Translator
