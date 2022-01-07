export function Name({ id, type, parent, getElement, updateElement, setContext, context }) {
  const node = getElement(type, id, parent);
  const updateName = (name) => {
    let newNode = getElement(type, id, parent);
    newNode.text = name;
    updateElement(type, newNode);
  };

  // Disable right-click editing of nodes
  function handleClick(e) {
    setContext({ ...context, disableNodeNameEditing: true });
  }

  return (
    <div style={{ padding: "5px" }} onClick={ handleClick }>
      <input
        type="text"
        style={{ fontSize: "medium" }}
        value={node.text}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
}
