import "./toolbar-right.css";


export default function DisplayTranslation(props) {
  return (
    <div className="toolbar-right">
    <div> <b>Relational Schema:</b> </div>
    {
        displayTables(props.relationalSchema)
    }
</div>
  )
}

const displayTables = (tables) => {
    var tabs = []
    var fks = []
    Object.keys(tables).forEach((key) =>
    {
        tabs.push(displayTable(key, tables[key]))
        fks.push(displayTablesFK(key, tables[key]))
    })
    return <div className="translation"> {tabs} {fks} </div>;
}

const displayTable = (tableName, content) => {
    var primaryKeys = [];
    var cols = [];
    content.columns.forEach((col) => {
        if(col.isPrimaryKey){
            primaryKeys.push(col.columnName)
        } else if(col.isOptional && col.isMulti){
            cols.push(col.columnName + "\u2217")
        } else if(col.isOptional){
            cols.push(col.columnName + "?")
        } else if (col.isMulti){
            cols.push(col.columnName + "+")
        } else{
            cols.push(col.columnName)
        }
    })
   return <div> {tableName}(<u>{primaryKeys.join(',')}</u>{cols.length > 0 ? ',' : null}{cols.join(',') + ')'} </div>
}

const displayTablesFK = (tableName, content) => {
    var fks = []
    content.foreignKeys.forEach((fk) => {
        var key = "(" + fk.columns.join(',') + ")";
        fks.push(<div> {tableName + key +"=>" + fk.foreignTable + key} </div>)
    })
    return <div className="translation">{fks}</div>;

}
