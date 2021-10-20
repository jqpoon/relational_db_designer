// An interface for any object in the ER model that can be parsed from a JSON request.
interface ModelObject {
    buildFromJson(objectAsJson: any): void;
}

export default ModelObject;
