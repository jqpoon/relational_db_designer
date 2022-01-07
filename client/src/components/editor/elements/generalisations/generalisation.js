import { Node } from "../general";

export function Generalisation({ generalisation, ctx, functions }) {
  return (
      <Node
        className="generalisation"
        node={generalisation}
        ctx={ctx}
        functions={functions}
      />
  );
}