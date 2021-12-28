import { FirebaseApp } from "firebase/app"
import { Firestore, getFirestore } from "firebase/firestore"

class FirestoreController {

    private static instance: FirestoreController;
    private db: Firestore;

    private constructor(firebaseApp: FirebaseApp) {
        this.db = getFirestore(firebaseApp);
    }

    public static getInstance(firebaseApp: FirebaseApp): FirestoreController {
        if (!FirestoreController.instance) {
            FirestoreController.instance = new FirestoreController(firebaseApp);
        }
        return FirestoreController.instance;
    }

}

export default FirestoreController
