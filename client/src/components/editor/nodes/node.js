import { useEffect } from "react";
import Draggable from "react-draggable";
import { useXarrow } from "react-xarrows/lib/Xarrow/Xarrow";
import { types } from "..";
/*
child = {
  id: Str
  name: Str
  position: {x: y: }
  type: 
}
*/

const classFromNodeType = {
  [types.ENTITY]: "entity",
  [types.RELATIONSHIP]: "relationship",
};

// General draggable, editable node
export default function Node({ child, getNode, updateNode }) {
  // Reference to self allows info about self to be propagated
  const nodeRef = useRef(null);
  // Name of node which will be displayed
  const [text, setText] = useState(child.text);

  // For updating edges connected to the node
  const updateXarrow = useXarrow();

  // Event handlers
  const onDrag = updateXarrow;
  const onStop = updateXarrow;
  const onClick = () => {};

  // Configurations for rendered elements
  const draggableConfig = {
    defaultPosition: child.position,
    onDrag: onDrag,
    onStop: onStop,
  };
  const contentsConfig = {
    id: child.id,
    ref: nodeRef,
    className: classFromNodeType[child.type],
    onClick: onClick,
  };

  // Contents displayed in node
  const editingMode = () => {
    return (
      <div className="node-content-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              // Update node text
              let newNode = getNode(child.type, child.id); // TODO: implement getNode in index.js
              newNode.text = text;
              updateNode(newNode);
            }
          }}
        />
      </div>
    );
  };
  const normalMode = () => {
    return <div className="node-content">{text}</div>;
  };

  return (
    <Draggable {...draggableConfig}>
      <div {...contentsConfig}>{text}</div>
    </Draggable>
  );
}
