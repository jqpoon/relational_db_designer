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
	arrayUnion,
	getDoc,
	DocumentSnapshot,
	arrayRemove,
	deleteDoc,
} from "firebase/firestore"

interface ERDSchema {
	owner: string;
	data: string;
}

interface ERDMeta {
	name: string;
	erid: string;
}

interface UserPermission {
	uid: string;
	permission: string;
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
			data: JSON.parse(json)
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

	public async checkExist(erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		return docData.exists();
	}

	public async checkAccess(uid: string, erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const erds: ERDMeta[] = docData.get("erds");
		for (const x of erds) {
			if (x.erid === erid) return true;
		}
		return false;
	}

	public async checkOwner(uid: string, erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const users: UserPermission[] = docData.get("users");
		for (const x of users) {
			if (x.uid === uid) return x.permission === "OWNER";
		}
		return false;
	}

	public async getERD(erid: string): Promise<string> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		return JSON.stringify(docData.get("data"));
	}

	public async updateERD(erid: string, json: string): Promise<void> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		await setDoc(docRef, JSON.parse(json));
	}

	public async deleteERD(erid: string): Promise<void> {
		const erdRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const users: UserPermission[] = erdData.get("users");
		for (const x of users) {
			const usersRef: DocumentReference = doc(this.db, `user_erds/${x.uid}`);
			const usersData: DocumentSnapshot = await getDoc(usersRef);
			const erds: ERDMeta[] = usersData.get("erds");
			for (const x of erds) {
				if (x.erid === erid) {
					updateDoc(usersRef, {
						erds: arrayRemove(x)
					});
					break;
				}
			}
		}
		deleteDoc(erdRef);
		const dataRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		deleteDoc(dataRef);
	}
}

export default FirestoreController
