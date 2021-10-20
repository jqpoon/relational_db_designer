import "./menu.css";

export default function Menu({ display, x, y, target, resetMenu, setElements}) {
    const style = {
        display: display,
        left: x ? x + 2 + "px" : null,
        top: y ? y + 2 + "px" : null,
    };

    const newAttributeNode = (nodeId, x, y) => {
        return {
            id: nodeId + "attribute1",
            type: "attributeNode",
            data: { label: "attribute1" },
            position: { x: x - 10, y: y - 10},
        }
    }

    const newAttributeEdge = (nodeId, target) => {
        return {
            id: nodeId + "attribute1edge",
            source: nodeId,
            target: target,
            type: "attributeEdge"
        }
    }

    const handleAddAttribute = () => {
        if (target) {
            console.log(target);

            const newNode = newAttributeNode(target, x, y);
            const newEdge = newAttributeEdge(target, target + "attribute1")

            setElements(prevElements => [...prevElements, newNode, newEdge])
        }
        
        resetMenu();
    };

    return (
        <div id="menu" style={style}>
            <div>
                <button onClick={handleAddAttribute}>Add attribute</button>
            </div>
        </div>
    );
}