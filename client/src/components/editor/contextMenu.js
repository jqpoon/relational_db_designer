import "./stylesheets/contextMenu.css"
import { addAttributeToNode } from "./edges/attribute";

export function ContextMenu({
  id, 
  setEditable, 
  anchorPoint, 
  show,
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
            // top: anchorPoint.y,
            // left: anchorPoint.x,
          }}
        >
          <li onClick={() => setEditable(true)} >Edit Label </li>
          <hr />
          <li onClick={() => addAttributeToNode(updateNode, addNode, getNode, "Attribute", id)}>Add Attribute</li>
          <hr />
          <li>Something</li>
        </ul>
        </div>
    );
  }

  return null;
  }
