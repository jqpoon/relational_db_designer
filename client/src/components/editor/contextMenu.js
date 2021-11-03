import "./stylesheets/contextMenu.css"
import useContextMenu from "./useContextMenu"
// takes in an editable id
export function ContextMenu({editableId, anchorPoint, show}){
    // For context menu: anchorPoint contains position of contextMenu and show controls when contextMenu will be shown
  //const { anchorPoint, show } = useContextMenu();
  if (show){
    console.log(anchorPoint);
    return(
      <div>
      <ul
          className="context-menu"
          style={{
						position: "absolute",
            transform: `translate(${0}px, ${0}px)`,
            // top: anchorPoint.y,
            // left:anchorPoint.x,
          }}
        >
          <li onClick={() => console.log(editableId)} >Edit Label </li>
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
