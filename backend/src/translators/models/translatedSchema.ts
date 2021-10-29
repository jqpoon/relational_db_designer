interface TranslatedSchema {

    entities: Map<string, AttributesSchema>
    relationships: Map<string, AttributesSchema>

    // key: foreign key name, value is list of entities name
    foreignKey: Map<string, Array<string>>

}

interface AttributesSchema {

    name: string,
    isPrimaryKey: boolean,
    isOptional: boolean

}

export default TranslatedSchema