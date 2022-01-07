import { addAttributeToNode } from "../attributes/attribute";
import { Node } from "../general";

export function Relationship({ relationship, ctx, functions }) {
  const ctxMenuActions = {
    ["Add Attribute"]: () =>
      addAttributeToNode({
        addElement: functions.addElement,
        getElement: functions.getElement,
        parentId: relationship.id,
        parentType: relationship.type,
      }),
  };
  return (
    <Node
      className="relationship"
      node={relationship}
      ctx={ctx}
      ctxMenuActions={ctxMenuActions}
      functions={functions}
    />
  );
}
