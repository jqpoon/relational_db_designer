import "./toolbar-right.css";


export default function DisplayTranslation(props) {
  return (
    <div className="toolbar-right">
    <div className="title" > <b>Relational Schema:</b> </div>
    {
        displayTables(props.relationalSchema)
    }
</div>
  )
}

const displayTables = (tables) => {
    var tabs = []
    Object.keys(tables).forEach((key) =>
    {
        tabs.push(displayTableFK(key, tables[key]))
    })
    return <div className="translation"> {tabs} </div>;
}

const displayTableFK = (tableName, content) => {
    var primaryKeys = [];
    var cols = [];
    var fks = [];
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
    content.foreignKeys.forEach((fk) => {
        var key = "(" + fk.columns.join(',') + ")";
        fks.push(<div> {tableName + key +" => " + fk.foreignTable + key} </div>)
    })
   return (
        <div>
            <div className="translation"> {tableName}(<u>{primaryKeys.join(',')}</u>{cols.length > 0 ? ', ' : null}{cols.join(', ') + ')'} </div>
            <div className="translation"> {fks} </div>
            <br/>
       </div>)
}

const displayTablesFK = (tableName, content) => {
    var fks = []
    content.foreignKeys.forEach((fk) => {
        var key = "(" + fk.columns.join(',') + ")";
        fks.push(<div> {tableName + key +" => " + fk.foreignTable + key} </div>)
    })
    return <div className="translation">{fks}</div>;

}
