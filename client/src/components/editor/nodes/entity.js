import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import "./stylesheets/entity.css";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { types } from "..";

export default function Entity({
  id,
  text,
  pos,
  parentRef,
  scale,
  updateNode,
  getNode,
  setPanDisabled,
  modifyContext,
}) {
  const updateXarrow = useXarrow();
  const entityRef = useRef(null);
  const [value, setValue] = useState(text);
  // To set bounds of draggable
  const [dimensions, setDimensions] = useState({});

  // Run on mount
  useEffect(() => {
    const entityCurr = entityRef.current;
    setDimensions({
      width: entityCurr.clientWidth,
      height: entityCurr.clientHeight,
    });
    const handler = (e) => {
      e.preventDefault();
    };
    // Right click
    entityCurr?.addEventListener("contextmenu", handler);
    return () => {
      entityCurr?.removeEventListener("contextmenu", handler);
    };
  }, []);

  // Highlight if selected
  // const border =
  //   focus === index
  //     ? {
  //         border: "2px solid orange",
  //       }
  //     : null;

  return (
    <Draggable
      nodeRef={entityRef} // TODO:This appears in the inner div as well
      defaultPosition={pos}
      onMouseDown={() => setPanDisabled(true)}
      onDrag={updateXarrow}
      onStop={(e, data) => {
        //Update entity position
        let newNode = getNode(types.ENTITY, id);
        newNode.pos = { x: data.x, y: data.y };
        updateNode(types.ENTITY, newNode);
        setPanDisabled(false);
        updateXarrow(e);
      }}
      scale={scale}
      bounds={{
        left: 5,
        top: 5,
        right: parentRef.current.clientWidth - dimensions.width - 5,
        bottom: parentRef.current.clientHeight - dimensions.height - 5,
      }}
    >
      <div
        className="entity"
        id={id}
        // style={border}
        ref={entityRef}
        onClick={() => modifyContext(id, types.ENTITY)}
      >
        {value}
      </div>
    </Draggable>
  );
}
