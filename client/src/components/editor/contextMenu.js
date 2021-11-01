import "./stylesheets/contextMenu.css"
import useContextMenu from "./useContextMenu"

export function ContextMenu(){
    // For context menu: anchorPoint contains position of contextMenu and show controls when contextMenu will be shown
  const { anchorPoint, show } = useContextMenu();
  if(show){
    return(
      <div>
      <ul
          className="context-menu"
          style={{
            top: anchorPoint.y,
            left: anchorPoint.x
          }}
        >
          <li>Edit Label</li>
          <hr />
          <li>Add Attribute</li>
          <hr />
          <li>Something</li>
        </ul>
        </div>
    );
  }
  
  return null;
  }
