import { types } from "../types";

class IdCounter {
	static counter = 10;
	static getCount() {
		return IdCounter.counter++;
	}
}

export function setIdCounter(count) {
	IdCounter.counter = count;
}
export function saveIdCounter() {
	return IdCounter.counter;
}
export function getId(type, parentId = null, secondaryId = null) {
	switch (type) {
		case types.ATTRIBUTE:
			return parentId + "A" + IdCounter.getCount();
		case types.ENTITY:
			return "E" + IdCounter.getCount();
		case types.RELATIONSHIP:
			return "R" + IdCounter.getCount();
		case types.GENERALISATION:
			return parentId + "G" + IdCounter.getCount();
		case types.EDGE.RELATIONSHIP:
		case types.EDGE.HIERARCHY:
			return parentId + secondaryId;
		default:
			console.error("type not valid when generating id");
	}
}
