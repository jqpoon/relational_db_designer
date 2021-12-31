import "./stylesheets/contextMenu.css";
import { addAttributeToNode } from "../edges/attribute";
import { types } from "../types";

export function EntityContextMenu({
  id,
  setEditable,
  anchorPoint,
  show,
  getElement,
  addElement,
  updateElement,
}) {
  // For context menu: anchorPoint contains position of contextMenu and show controls when contextMenu will be shown
  if (show) {
    return (
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
          <li onClick={() => setEditable(true)}>Edit Label </li>
          <hr />
          <li
            onClick={() =>
              addAttributeToNode({
                addElement: addElement,
                getElement: getElement,
                parentId: id,
                parentType: types.ENTITY,
              })
            }
          >
            Add Attribute
          </li>
        </ul>
      </div>
    );
  }

  return null;
}
