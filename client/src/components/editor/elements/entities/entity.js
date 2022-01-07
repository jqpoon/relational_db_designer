import { addAttributeToNode } from "../../edges/attribute";
import { Node } from "../general";
import { Generalisation } from "../generalisations/generalisation";

export function Entity({ entity, ctx, functions }) {
  const ctxMenuActions = {
    ["Add Attribute"]: () =>
      addAttributeToNode({
        addElement: functions.addElement,
        getElement: functions.getElement,
        parentId: entity.id,
        parentType: entity.type,
      }),
  };
  return (
    <>
      <Node
        node={entity}
        className={entity.isWeak.length === 0 ? "entity" : "weak-entity"}
        ctx={ctx}
        ctxMenuActions={ctxMenuActions}
        functions={functions}
      />
      {Object.values(entity.generalisations).map((generalisation) => {
        return (
          <Generalisation
            generalisation={generalisation}
            ctx={ctx}
            ctxMenuActions={ctxMenuActions}
            functions={functions}
          />
        );
      })}
    </>
  );
}
