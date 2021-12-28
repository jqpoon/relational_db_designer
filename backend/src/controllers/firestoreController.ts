import { FirebaseApp } from "firebase/app"
import { Firestore, getFirestore, setDoc, doc, DocumentReference } from "firebase/firestore"

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

		public createDocumentForNewUser(uid: string): void {
				const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
				setDoc(docRef, {});
		}
}

export default FirestoreController
