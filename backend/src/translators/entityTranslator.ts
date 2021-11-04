import Entity from "src/models/entity";
import TranslatedSchema from "./models/translatedSchema";
import Translator from "./translator";

class EntityTranslator implements Translator {

    entity: Entity;

    constructor(entity: Entity) {
        this.entity = entity;
    }

    translateFromDiagramToSchema(translatedSchema: TranslatedSchema): TranslatedSchema {
        throw new Error("Method not implemented.");
    }

}
