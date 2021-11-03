import { useCallback, useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { useXarrow } from "react-xarrows";
import { types } from "..";
import { ContextMenu } from "../contextMenu";
import { actions } from "../types";
import "./stylesheets/node.css";


export function TestRelationship(props) {
  return <Node {...props} />;
}

export function TestEntity(props) {
  return <Node {...props} />;
}

const classFromNodeType = {
  [types.ENTITY]: "entity",
  [types.RELATIONSHIP]: "relationship",
};

// General draggable, editable node
export default function Node({
  id,
  type,
  text,
  pos,
  parentRef,
  scale,
  updateNode,
  getNode,
  addNode,
  setPanDisabled,
  context,
  setContext,
}) {
  // Reference to self allows info about self to be propagated
  const nodeRef = useRef(null);
  // Name of node which will be displayed
  const [name, setName] = useState(text);

  // To set bounds of draggable
  const [dimensions, setDimensions] = useState({});

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);
  const [editable, setEditable] = useState(false);

	const handleContextMenu = useCallback(
		(event) => {
			event.preventDefault();
			setAnchorPoint({ x: 0, y: 0 }); // TODO: figure out how to fix anchor point
			setShow(true);
		},
		[]
	);

  // Hides the context menu if we left click again
	const handleClick = useCallback(
		() => {
      setShow(false);
    },
		[show]
	);

  // Set dimensions on mount
  useEffect(() => {
    const curNode = nodeRef.current;
    setDimensions({
      width: curNode.clientWidth,
      height: curNode.clientHeight,
    });
    // Right click
    document?.addEventListener("click", handleClick);
    curNode?.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document?.removeEventListener("click", handleClick);
      curNode?.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // For updating edges connected to the node
  const updateXarrow = useXarrow();

  // Event handlers
  const onDrag = updateXarrow;
  const onStop = (e, data) => {
    // Save new position of node
    let newNode = getNode(type, id);
    newNode.pos = { x: data.x, y: data.y };
    updateNode(type, newNode);
    // Update arrow position
    updateXarrow(e); // TODO: check function signature of updateXarrow(E, DATA) ?
    // Re-enable panning of canvas
    setPanDisabled(false);
  };
  const onClick = () => {
    switch (context.action) {
      case actions.NORMAL:
      case actions.SELECT:
        setContext({
          action: actions.SELECT,
          selected: { type: type, id: id },
        });
        break;
      default:
    }
  };

  // Configurations for rendered elements
  const draggableConfig = {
    defaultPosition: pos,
    scale: scale,
    bounds: {
      // ?
      left: 5,
      top: 5,
      right: parentRef.current.clientWidth - dimensions.width - 5,
      bottom: parentRef.current.clientHeight - dimensions.height - 5,
    },
    onDrag: onDrag,
    onStop: onStop,
    onMouseDown: () => setPanDisabled(true),
  };

  const contentsConfig = {
    id: id,
    ref: nodeRef,
    className: "node-wrapper", //classFromNodeType[type],
    onClick: onClick,
  };

  // Contents displayed in node
  const editingMode = () => {
    var className;
    if(type === types.ENTITY){
      className = "entity-input";
    }else if(type === types.RELATIONSHIP){
      className ="diamond-input";
    }

    return ( editable ? (
      <div className={className}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              // Update node text
              let newNode = getNode(type, id);
              newNode.text = name;
              updateNode(type, newNode);
              setEditable(false);
            }
          }}
        />
      </div>
    ) : <div>{text}</div>
    );
  };

  const normalMode = (
    <div className={classFromNodeType[type]}>
      {editingMode()}
    </div>
  );
  // TODO:conditional rendering

  return (
    <Draggable style={{width: "150px", height: "75px"}} {...draggableConfig} >
      <div {...contentsConfig}>
        <ContextMenu 
          anchorPoint={anchorPoint} 
          show={show} 
          setEditable={setEditable} 
          id={id}
          updateNode={updateNode}
          addNode={addNode}
          getNode={getNode}
        />
        {normalMode}
      </div>
    </Draggable>
  );
}
