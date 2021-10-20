import React, { useState, useEffect, useCallback } from 'react';

// @ts-nocheck
import ReactFlow, {
  Handle,
  Position,
} from 'react-flow-renderer';

export function EditableNode(props: any){
    const [value, setValue] = useState("");
    const [text, updateText] = useState(props.data.text);

    return (
        <div>
            <Handle type="target" position={Position.Left} />
            <input value={value}
                   onChange={(e) => setValue(e.target.value)}
            />
            <button>
                        Save
            </button>

            <Handle
             type="source"
             position={Position.Right}
             id="a"
             style={{ top: '30%', borderRadius: 0 }}
            />
            <Handle
            type="source"
            position={Position.Right}
            id="b"
            style={{ top: '70%', borderRadius: 0 }}
            />

        </div>

    )


}