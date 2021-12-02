export function Name({ id, type, parent, getElement, updateElement }) {
  const node = getElement(type, id, parent);
  const updateName = (name) => {
    let newNode = getElement(type, id);
    newNode.text = name;
    updateElement(type, newNode);
  };
  return (
    <div style={{ padding: "5px" }}>
      <input
        type="text"
        style={{ fontSize: "medium" }}
        value={node.text}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
}
