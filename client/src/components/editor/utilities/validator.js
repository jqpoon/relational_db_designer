import { notificationHandler } from "./alert";
import {types} from "../types";

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
		this.errors = new Set();
	}

	// Add an error to the error stack and mark the schema as invalid.
	flagInvalid(error) {
		this.valid = false;
		this.errors.add(error);
	}

	// Entities.

	// Whether an entity has been given a name.
	checkForEntityText(e) {
		if (e.text === "") this.flagInvalid("Make sure all your entities are named.");
		Object.values(e.attributes).forEach((a) => {
			if (a.text === "") this.flagInvalid("Make sure all your attributes are named.");
		});
		Object.values(e.generalisations).forEach((g) => {
			if (g.text === "") this.flagInvalid("Make sure all your generalisations are named.");
		});
	}

	// Whether an entity has a single primary key (if applicable).
	checkForEntityPrimaryKey(e) {
		const attributes = Object.values(e.attributes);

		// Check if entity is a subset of another entity.
		let isSubset = false;
		Object.entries(e.edges).forEach(([edgeID, edgeData]) => {
			if (edgeData.type === types.EDGE.HIERARCHY && this.schema.data.edges[edgeID].child === e.id) isSubset = true;
		});
		// Guard statement. Only process if entity is not a subset of some other entity.
		if (isSubset) return;

		let nPrimaryKeys = 0;
		attributes.forEach((a) => {
			if (a.isPrimaryKey) nPrimaryKeys++;
		});

		if (nPrimaryKeys === 0) {
			if (e.text === "") {
				this.flagInvalid("Some unnamed entities have no primary key.");
			} else {
				this.flagInvalid('Entity "' + e.text + '" has no primary key.');
			}
		} else if (nPrimaryKeys > 1) {
			if (e.text === "") {
				this.flagInvalid("Some unnamed entities have multiple primary keys.");
			} else {
				this.flagInvalid('Entity "' + e.text + '" has multiple primary keys.');
			}
		}
	}

	// Relationships.

	// Whether a relationship has been given a name.
	checkForRelationshipText(r) {
		if (r.text === "") this.flagInvalid('Relationship "' + r.id + '" has no name.');
	}

	// Public methods.

	// Runs each test to see if schema is valid or not.
	validate() {
		this.entities.forEach((e) => {
			this.checkForEntityText(e);
			this.checkForEntityPrimaryKey(e);
		});

		this.relationships.forEach((r) => {
			this.checkForRelationshipText(r);
		});
	}

	// Validate, then generate an error pop-up for the client-side.
	validateAndAlert() {
		this.validate();

		if (!this.valid) {
			const message = Array.from(this.errors).join("\n");
			notificationHandler("Invalid Schema", message);
		}
	}
}
