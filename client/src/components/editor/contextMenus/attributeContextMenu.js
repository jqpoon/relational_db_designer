import "./stylesheets/contextMenu.css"

export function AttributeContextMenu({
  id, 
  setEditable, 
  anchorPoint, 
  show,
  toggleKeyAttribute,
  updateNode,
  getNode,
  addNode
}){
    // For context menu: anchorPoint contains position of contextMenu and show controls when contextMenu will be shown
  //const { anchorPoint, show } = useContextMenu();
  if (show){
    return(
      <div>
        <ul
          className="context-menu"
          style={{
						position: "absolute",
            transform: `translate(${anchorPoint.x}px, ${anchorPoint.y}px)`,
          }}
        >
          <li onClick={() => setEditable(true)} >Edit Label</li>
          <hr />
          <li onClick={() => toggleKeyAttribute()}>Toggle Key Attribute</li>
          <hr />
          <li onClick={() => console.log("click 3")}>Toggle Optional Attribute</li>
        </ul>
      </div>
    );
  }

  return null;
}
