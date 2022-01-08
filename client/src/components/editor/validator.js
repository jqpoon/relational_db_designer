import { notificationHandler } from "./alerts/alert";

export class Validator {
  constructor(schema) {
    this.schema = schema;
    this.entities = Object.values(schema.data.entities);
    this.relationships = Object.values(schema.data.relationships);
    this.edges = Object.values(schema.data.edges);
    this.valid = true;
    this.errors = [];
  }

  flagInvalid(error) {
    this.valid = false;
    this.errors.push(error);
  }

  findNodeName(node) {
    return (node.text === "") ? node.id : node.text;
  }

  // Entities.

  checkForEntityText(e) {
    if (e.text === "") this.flagInvalid("Entity \"" + e.id + "\" has no name.");
    Object.values(e.attributes).forEach(a => {
      if (a.text === "") this.flagInvalid("Attribute \"" + a.id + "\" has no name.");
    });
    Object.values(e.generalisations).forEach(g => {
      if (g.text === "") this.flagInvalid("Generalisation \"" + g.id + "\" has no name.");
    });
  }

  checkForEntityPrimaryKey(e) {
    const attributes = Object.values(e.attributes);

    // Guard statement. Only process if entity has attributes.
    if (attributes.length === 0) return;

    let nPrimaryKeys = 0;
    attributes.forEach(a => {
      if (a.isPrimaryKey) nPrimaryKeys++;
    });

    if (nPrimaryKeys === 0) {
      this.flagInvalid("Entity \"" + this.findNodeName(e) + "\" has no primary key.");
    } else if (nPrimaryKeys > 1) {
      this.flagInvalid("Entity \"" + this.findNodeName(e) + "\" has multiple primary keys.");
    }
  }

  // Relationships.

  checkForRelationshipText(r) {
    if (r.text === "") this.flagInvalid("Relationship \"" + r.id + "\" has no name.");
  }

  // Public methods.

  validate() {
    this.entities.forEach(e => {
      this.checkForEntityText(e);
      this.checkForEntityPrimaryKey(e);
    });

    this.relationships.forEach(r => {
      this.checkForRelationshipText(r);
    });
  }

  validateAndAlert() {
    this.validate();

    if (!this.valid) {
      const message = this.errors.join("\n");
      notificationHandler("Invalid Schema", message);
    }
  }
}