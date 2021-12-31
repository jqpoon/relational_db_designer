import Entity from "../models/entity";
import Relationship from "../models/relationship";
import EntityTranslator from "./entityTranslator";
import ForeignKeyTranslator from "./foreignKeyTranslator";
import TranslatedTable, { Table } from "./models/translatedTable";
import RelationshipTranslator from "./relationshipTranslator";

class FullTranslator {

    entities: Map<string, Entity>;
    relationships: Map<string, Relationship>;

    constructor(entities: Map<string, Entity>, relationships: Map<string, Relationship>) {
        this.entities = entities;
        this.relationships = relationships
    }
    
    translateFromDiagramToSchema(): TranslatedTable {
        var translatedTable: TranslatedTable = {
            tables: new Map<string, Table>()
        }

        this.entities.forEach((entity: Entity) => { 
            const eTranslator:EntityTranslator = new EntityTranslator(entity);
            eTranslator.translateFromDiagramToTable(translatedTable);
        });

        this.relationships.forEach((relationship: Relationship) => { 
            const rsTranslator:RelationshipTranslator = new RelationshipTranslator(this.entities, relationship);
            rsTranslator.translateFromDiagramToTable(translatedTable);
        });

        const fkTranslator:ForeignKeyTranslator = new ForeignKeyTranslator(this.entities, this.relationships);
        fkTranslator.translateFromDiagramToTable(translatedTable);

        return translatedTable;
    }
}

export default FullTranslator