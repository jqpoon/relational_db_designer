import TranslatedSchema from "./models/translatedSchema";

interface Translator {

    // if its foreign key then we have another function for it
    translateFromDiagramToSchema(translatedSchema: TranslatedSchema): TranslatedSchema
}

export default Translator
