import { notificationHandler } from "./alerts/alert";

// Validates a given schema in specific JSON format. See exportStateToObject in editor.js.
export class Validator {
  constructor(schema) {
    this.schema = schema;
    this.entities = Object.values(schema.data.entities);
    this.relationships = Object.values(schema.data.relationships);
    this.edges = Object.values(schema.data.edges);

    // Whether the current schema is valid.
    this.valid = true;
    // Keeps track of all errors until they are dumped when error message is displayed.
    this.errors = [];
  }

  // Add an error to the error stack and mark the schema as invalid.
  flagInvalid(error) {
    this.valid = false;
    this.errors.push(error);
  }

  // Generate some display name for an entity or relationship, even if the text field is empty.
  // Used in generating error messages.
  findNodeName(node) {
    return (node.text === "") ? node.id : node.text;
  }

  // Entities.

  // Whether an entity has been given a name.
  checkForEntityText(e) {
    if (e.text === "") this.flagInvalid("Entity \"" + e.id + "\" has no name.");
    Object.values(e.attributes).forEach(a => {
      if (a.text === "") this.flagInvalid("Attribute \"" + a.id + "\" has no name.");
    });
    Object.values(e.generalisations).forEach(g => {
      if (g.text === "") this.flagInvalid("Generalisation \"" + g.id + "\" has no name.");
    });
  }

  // Whether an entity has a single primary key (if applicable).
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

  // Whether a relationship has been given a name.
  checkForRelationshipText(r) {
    if (r.text === "") this.flagInvalid("Relationship \"" + r.id + "\" has no name.");
  }

  // Public methods.

  // Runs each test to see if schema is valid or not.
  validate() {
    this.entities.forEach(e => {
      this.checkForEntityText(e);
      this.checkForEntityPrimaryKey(e);
    });

    this.relationships.forEach(r => {
      this.checkForRelationshipText(r);
    });
  }

  // Validate, then generate an error pop-up for the client-side.
  validateAndAlert() {
    this.validate();

    if (!this.valid) {
      const message = this.errors.join("\n");
      notificationHandler("Invalid Schema", message);
    }
  }
}