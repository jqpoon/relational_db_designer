import { actions, types } from "../types";
import "./toolbar.css";
import { Load } from "./views/load";
import { SelectEntity } from "./views/selectEntity";
import SelectRelationship from "./views/selectRelationship";
import SelectGeneralisation from "./views/selectGeneralisation";
import Share from "./views/share";
import DisplayTranslation from "./views/translationDisplay";

export function RightToolbar({ context, user, erid, functions }) {
  switch (context.action) {
    case actions.LOAD:
      return <Load user={user} {...functions} />;
    case actions.SHARE:
      return <Share user={user} erid={erid} functions={functions} />;
    case actions.TRANSLATE:
      return <DisplayTranslation relationalSchema={context.tables} />;
    case actions.SELECT.NORMAL:
    case actions.SELECT.ADD_RELATIONSHIP:
    case actions.SELECT.ADD_SUPERSET:
    case actions.SELECT.ADD_SUBSET:
      const node = functions.getElement(
        context.selected.type,
        context.selected.id,
        context.selected.parent
      );
      if (!node) {
        functions.backToNormal();
        return null;
      }
      switch (context.selected.type) {
        case types.ENTITY:
          return (
            <SelectEntity entity={node} functions={functions} ctx={context} />
          );
        case types.RELATIONSHIP:
          return (
            <SelectRelationship
              relationship={node}
              ctx={context}
              functions={functions}
            />
          );
        case types.GENERALISATION:
          return (
            <SelectGeneralisation
              generalisation={node}
              ctx={context}
              functions={functions}
            />
          );
        default:
          return null;
      }
    default:
      return null;
  }
}
