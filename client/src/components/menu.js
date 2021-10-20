import "./menu.css";

export default function Menu({ display, x, y, target, resetMenu }) {
    const style = {
        display: display,
        left: x ? x + 2 + "px" : null,
        top: y ? y + 2 + "px" : null,
    };

    const handleAddAttribute = () => {
        if (target) console.log(target);
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