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
	name: string;
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

	public async createERD(uid: string, json: string): Promise<void> {
		// Store ERD
		const parsedJson = JSON.parse(json);
		const data: ERDSchema = {
			owner: uid,
			name: parsedJson.name,
			data: parsedJson.data,
		}
		const ref: CollectionReference = collection(this.db, "erds_list");
		let docRef: DocumentReference = await addDoc(ref, data);
		
		const erid: string = docRef.id;
		
		// create doc to store list of users that can access it
		docRef = doc(this.db, `erd_users/${erid}`);
		setDoc(docRef, {});

		// Give access to user
		docRef = doc(this.db, `user_erds/${uid}`);
		updateDoc(docRef, {
			erds: arrayUnion(erid)
		});

		// Update user as owner on ERD
		docRef = doc(this.db, `erd_users/${erid}`);
		updateDoc(docRef, {
			users: arrayUnion({
				uid,
				permission: "OWNER"
			})
		});
	}

	public async checkERDExists(erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		return docData.exists();
	}

	public async checkUserExists(uid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		return docData.exists();
	}

	public async canRead(uid: string, erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const erds: string[] = docData.get("erds");
		for (const x of erds) {
			if (x === erid) return true;
		}
		return false;
	}

	public async canWrite(uid: string, erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const users: UserPermission[] = docData.get("users");
		for (const x of users) {
			if (x.uid === uid) return x.permission === "OWNER" || x.permission === "READ-WRITE";
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

		// TODO: concurrent update?
	}

	public async deleteERD(erid: string): Promise<void> {
		const erdRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const users: UserPermission[] = erdData.get("users");
		for (const x of users) {
			const usersRef: DocumentReference = doc(this.db, `user_erds/${x.uid}`);
			updateDoc(usersRef, {
				erds: arrayRemove(erid)
			});
		}
		deleteDoc(erdRef);
		const dataRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		deleteDoc(dataRef);
	}

	public async getERDAccessList(erid: string): Promise<string> {
		const docRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const users: UserPermission[] = docData.get("users");
		return JSON.stringify(users);
	}

	public async getUserAccessList(uid: string): Promise<string> {
		const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const erds: string[] = await docData.get("erds");
		const erdsMeta: ERDMeta[] = [];
		for (const x of erds) {
			const erdRef: DocumentReference = doc(this.db, `erds_list/${x}`);
			const erdData = await getDoc(erdRef);
			erdsMeta.push({erid: x, name: erdData.get("name")});
		}
		return JSON.stringify(erdsMeta);
	}

	public isValidPermission(permission: string): boolean {
		return permission === "READ" || permission === "READ-WRITE";		
	}

	public async updateAccess(uid: string, erid: string, permission: string): Promise<void> {
		// Give access to user
		const userRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		await updateDoc(userRef, {
			erds: arrayUnion(erid)
		});

		// Update permission of user
		const erdRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const users: UserPermission[] = erdData.get("users");
		for (const x of users) {
			if (x.uid === uid) {
				await updateDoc(erdRef, {
					users: arrayRemove(x)
				});
				break;
			}
		}
		await updateDoc(erdRef, {
			users: arrayUnion({
				uid,
				permission
			})
		});
	}

	public async createDuplicate(uid: string, erid: string): Promise<string> {
		const erdRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const data = erdData.get("data");
		const name = erdData.get("name");
		const result = JSON.stringify({name, data});
		await this.createERD(uid, result);
		return result;
	}
}

export default FirestoreController
