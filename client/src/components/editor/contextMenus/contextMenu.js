export function ContextMenu({ contextMenu }) {
  if (contextMenu === null) {
    return null;
  }
  
  const totalActions = Object.keys(contextMenu.actions).length;
  return (
    <ul
      style={{
        borderRadius: "2px",
        boxShadow: "0 0 20px 0 #ccc",
        backgroundColor: "white",
        top: contextMenu.anchor.y,
        left: contextMenu.anchor.x,
        height: "auto",
        width: "150px",
        position: "absolute",
        margin: "0",
        padding: "5px 0 5px 0",
        fontSize: "14px",
        listStyle: "none",
      }}
    >
      {Object.entries(contextMenu.actions).map(([name, action], i) => (
        <>
          <li onClick={action}>{name}</li>
          {i === totalActions - 1 ? null : <hr />}
        </>
      ))}
    </ul>
  );
}
