import { FirebaseApp } from "firebase/app"
import { 
	Firestore, 
	getFirestore, 
	setDoc, 
	doc, 
	collection,
	DocumentReference, 
	CollectionReference,
	addDoc,
	updateDoc,
	arrayUnion
} from "firebase/firestore"

interface ERDSchema {
	owner: string;
	data: string;
}

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

		// New doc for user to store ERDs it can access
		public createDocumentForNewUser(uid: string): void {
				const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
				setDoc(docRef, {});
		}

		// Store ERD as JSON and create doc to store list of users that can access it
		public async createERD(uid: string, json: string): Promise<string> {
				const data: ERDSchema = {
					owner: uid,
					data: json
				}
				const ref: CollectionReference = collection(this.db, "erds_list");
				let docRef: DocumentReference = await addDoc(ref, data);

				const erid: string = docRef.id;

				docRef = doc(this.db, `erd_users/${erid}`);
				setDoc(docRef, {});

				return erid;
		}

		public addERDToUser(uid: string, erid: string, name: string): void {
				const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
				updateDoc(docRef, {
					erds: arrayUnion({
						erid,
						name
					})
				});
		}

		public addUserToERD(uid: string, erid: string, permission: string): void {
			const docRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
			updateDoc(docRef, {
				users: arrayUnion({
					uid,
					permission
				})
			});
		}
}

export default FirestoreController
