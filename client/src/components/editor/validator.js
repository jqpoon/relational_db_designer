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

  checkForEntityText(e) {
    if (e.text === "") this.flagInvalid("Entity " + e.id + " has no name.");
    Object.values(e.attributes).forEach(a => {
      if (a.text === "") this.flagInvalid("Attribute " + a.id + " has no name.");
    });
    Object.values(e.generalisations).forEach(g => {
      if (g.text === "") this.flagInvalid("Generalisation " + g.id + " has no name.");
    });
  }

  checkForRelationshipText(r) {
    if (r.text === "") this.flagInvalid("Relationship " + r.id + " has no name.");
  }

  validate() {
    this.entities.forEach(e => {
      this.checkForEntityText(e);
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