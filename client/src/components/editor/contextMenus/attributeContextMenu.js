import "./stylesheets/contextMenu.css"

export function AttributeContextMenu({
  id, 
  setEditable, 
  anchorPoint, 
  show,
  toggleKeyAttribute,
  toggleOptionalAttribute,
  toggleMultiValuedAttribute,
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
          <li onClick={() => toggleOptionalAttribute()}>Toggle Optional Attribute</li>
          <hr />
          <li onClick={() => toggleMultiValuedAttribute()}>Toggle Multi-valued Attribute</li>
        </ul>
      </div>
    );
  }

  return null;
}
