interface TranslatedSchema {

    entities: Map<string, Array<AttributesSchema>>
    relationships: Map<string, Array<AttributesSchema>>

    // key: foreign key name, value is list of entities name
    foreignKey: Map<string, Array<string>>

}

interface AttributesSchema {

    name: string,
    isPrimaryKey: boolean,
    isOptional: boolean

}

export default TranslatedSchema
export { AttributesSchema }
