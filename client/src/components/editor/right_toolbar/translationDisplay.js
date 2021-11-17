import "./toolbar-right.css";


export default function DisplayTranslation({relationalSchema}) {
  return (
    <div className="toolbar-right">
    <div> <b>Relational Schema:</b> </div>
    {
     displayEntitiesRelationships(relationalSchema.translation.entities)
    }
    {
     displayEntitiesRelationships(relationalSchema.translation.relationships)
    }
    {
     displayForeignKeys(relationalSchema.translation.foreignKeys)
    }
</div>
  )
}

const displayEntitiesRelationships = (entities) => {
    var ents = [];
    Object.entries(entities).forEach(([key, val]) =>
     { ents.push(displayEntityRelationshipsAttributes(key, val))});
     return <div className="translation"> {ents}</div>;
}

// TODO: ensure that entities only have one primary key? relationships usually will have 2 primary keys.
const displayEntityRelationshipsAttributes = (entityName, attributeMap) =>{
    var primaryKey = [];
    var atts = [];
    attributeMap.map((attribute) => {
        if(attribute.isPrimaryKey){
            primaryKey.push(attribute.name);
        } else if(attribute.isOptional){
           atts.push(attribute.name + "?")
        } else{
           atts.push(attribute.name);
        }
    });
    return <div> {entityName}(<u>{primaryKey.join(',')}</u>{atts.length > 0 ? ',' : null}{atts.join(',') + ')'} </div>;
}

const displayForeignKeys = (foreignKeyMap) => {
    var keys = [];
    foreignKeyMap.forEach((fk) => {
        keys.push(<div>{(fk[0] + '(' + fk[1] + ') => ' + fk[2] +'(' + fk[1] + ')')}</div>)})

    return <div className="translation">{keys}</div>;
}