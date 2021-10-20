import React, { useState } from 'react';
import './nodes.css'

// @ts-nocheck
import {
  Handle,
  Position,
} from 'react-flow-renderer';

export default function Entity(props: any){
    const [value, setValue] = useState("");
    const [text, updateText] = useState(props.data.text);
    const [seen, setSeen] = useState('inline');

    return (
        <div className="entity"
             onDoubleClick={() => {updateText(""); setSeen('inline')}}>
            <Handle type="target" position={Position.Left} />
            <input value={value}
                   style={{display: seen}}
                   placeholder="entity name"
                   onChange={(e) => {setValue(e.target.value)}}
                   onKeyPress={(e) => {
                       if(e.key === 'Enter'){
                        updateText(value);
                        setSeen('none');
                       }
                   }}
            />
            <div> {text} </div>
            <Handle
            type="source"
            position={Position.Right}
            />

        </div>

    )


}