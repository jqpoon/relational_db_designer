import "./menu.css";

let attributeId = 0;
const getNewAttributeName = () => `attribute_${attributeId++}`;

export default function Menu({ display, x, y, target, resetMenu, setElements}) {
    const style = {
        display: display,
        left: x ? x + 2 + "px" : null,
        top: y ? y + 2 + "px" : null,
    };

    const newAttributeNodeName = getNewAttributeName()

    const newAttributeNode = (nodeId, x, y) => {
        return {
            id: nodeId + newAttributeNodeName,
            type: "attributeNode",
            data: { label: "attribute_placeholder" },
            position: { x: x + 75, y: y + 100},
        }
    }

    const newAttributeEdge = (nodeId, target) => {
        return {
            id: nodeId + newAttributeNodeName + "edge",
            source: nodeId,
            target: target,
            type: "attributeEdge"
        }
    }

    const handleAddAttribute = () => {
        if (target) {

            // TODO: check if adding attribute to attribute

            const newNode = newAttributeNode(target, x, y);
            const newEdge = newAttributeEdge(target, target + newAttributeNodeName)

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