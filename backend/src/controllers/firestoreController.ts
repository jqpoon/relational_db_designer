/*
	TABLE OF CONTENTS

	1. Imports
	2. Interface definitions
	3. Singleton controller class for Cloud Firestore
		3.1 Utilities
		3.2 User documents initialisation
		3.3 CRUD for ERD
		3.4 Collaboration methods
*/

// **********
// 1. Imports
// **********

import { FirebaseApp } from "firebase/app";
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
	increment,
} from "firebase/firestore";
import asyncLock from "async-lock";

// ************************
// 2. Interface definitions
// ************************

interface ERDSchema {
	counter: number;
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

interface DisplayPermission {
	permission: string;
	email: string;
}

// *************************************************
// 3. Singleton controller class for Cloud Firestore
// *************************************************

class FirestoreController {
	private static instance: FirestoreController;
	private db: Firestore;
	private lock: asyncLock;

	private constructor(firebaseApp: FirebaseApp) {
		this.db = getFirestore(firebaseApp);
		this.lock = new asyncLock();
	}

	public static getInstance(firebaseApp: FirebaseApp): FirestoreController {
		if (!FirestoreController.instance) {
			FirestoreController.instance = new FirestoreController(firebaseApp);
		}
		return FirestoreController.instance;
	}

	// *************
	// 3.1 Utilities
	// *************

	public async getUidFromEmail(email: string): Promise<string | null> {
		const docRef: DocumentReference = doc(this.db, `email_uid/${email}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		if (!docData.exists()) return null;
		return docData.get("uid") as string;
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

	public async checkOwner(uid: string, erid: string): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const users: UserPermission[] = docData.get("users");
		for (const x of users) {
			if (x.uid === uid) return x.permission === "OWNER";
		}
		return false;
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

	// Lock on ERid for mutual exclusion
	public async canUpdateERD(erid: string, counter: number): Promise<boolean> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const res = await this.lock.acquire(
			erid,
			() => {
				return getDoc(docRef);
			},
			{}
		);
		return counter === res.get("counter");
	}

	public isValidPermission(permission: string): boolean {
		return permission === "REMOVE" || permission === "READ" || permission === "READ-WRITE";
	}

	// *********************************
	// 3.2 User documents initialisation
	// *********************************

	public async createDocumentForNewUser(uid: string, email: string): Promise<void> {
		let docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		await setDoc(docRef, { email });
		docRef = doc(this.db, `email_uid/${email}`);
		await setDoc(docRef, { uid });
	}

	// ****************
	// 3.3 CRUD for ERD
	// ****************

	public async createERD(uid: string, json: string): Promise<string> {
		// Store ERD
		const parsedJson = JSON.parse(json);
		const data: ERDSchema = {
			counter: 1,
			name: parsedJson.name,
			data: parsedJson.data,
		};
		const ref: CollectionReference = collection(this.db, "erds_list");
		let docRef: DocumentReference = await addDoc(ref, data);

		const erid: string = docRef.id;

		// create doc to store list of users that can access it
		docRef = doc(this.db, `erd_users/${erid}`);
		await setDoc(docRef, {});

		// Give access to user
		docRef = doc(this.db, `user_erds/${uid}`);
		await updateDoc(docRef, {
			erds: arrayUnion(erid),
		});

		// Update user as owner on ERD
		docRef = doc(this.db, `erd_users/${erid}`);
		await updateDoc(docRef, {
			users: arrayUnion({
				uid,
				permission: "OWNER",
			}),
		});

		return erid;
	}

	public async getERD(erid: string): Promise<string> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const res = await this.lock.acquire(
			erid,
			() => {
				return getDoc(docRef);
			},
			{}
		);
		return JSON.stringify(res.data());
	}

	public async updateERD(erid: string, json: string): Promise<void> {
		const docRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		await this.lock.acquire(
			erid,
			() => {
				updateDoc(docRef, { ...JSON.parse(json), counter: increment(1) });
			},
			{}
		);
	}

	public async deleteERD(erid: string): Promise<void> {
		const erdRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const users: UserPermission[] = erdData.get("users");
		for (const x of users) {
			const usersRef: DocumentReference = doc(this.db, `user_erds/${x.uid}`);
			await updateDoc(usersRef, {
				erds: arrayRemove(erid),
			});
		}
		await deleteDoc(erdRef);
		const dataRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		await deleteDoc(dataRef);
	}

	// *************************
	// 3.4 Collaboration methods
	// *************************

	public async getERDAccessList(erid: string): Promise<string> {
		const docRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const users: UserPermission[] = docData.get("users");
		const res: DisplayPermission[] = [];
		for (const x of users) {
			const userRef: DocumentReference = doc(this.db, `user_erds/${x.uid}`);
			const userData = await getDoc(userRef);
			res.push({ email: userData.get("email"), permission: x.permission });
		}
		return JSON.stringify(res);
	}

	public async getUserAccessList(uid: string): Promise<string> {
		const docRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		const docData: DocumentSnapshot = await getDoc(docRef);
		const erds: string[] = await docData.get("erds");
		const erdsMeta: ERDMeta[] = [];
		if (erds !== undefined) {
			for (const x of erds) {
				const erdRef: DocumentReference = doc(this.db, `erds_list/${x}`);
				const erdData = await getDoc(erdRef);
				erdsMeta.push({ erid: x, name: erdData.get("name") });
			}
		}
		return JSON.stringify(erdsMeta);
	}

	public async updateAccess(uid: string, erid: string, permission: string): Promise<void> {
		// Update user access
		const userRef: DocumentReference = doc(this.db, `user_erds/${uid}`);
		if (permission !== "REMOVE") {
			await updateDoc(userRef, {
				erds: arrayUnion(erid),
			});
		} else {
			await updateDoc(userRef, {
				erds: arrayRemove(erid),
			});
		}

		// Update permission of user (if not remove)
		const erdRef: DocumentReference = doc(this.db, `erd_users/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const users: UserPermission[] = erdData.get("users");
		for (const x of users) {
			if (x.uid === uid) {
				await updateDoc(erdRef, {
					users: arrayRemove(x),
				});
				break;
			}
		}

		if (permission !== "REMOVE") {
			await updateDoc(erdRef, {
				users: arrayUnion({
					uid,
					permission,
				}),
			});
		}
	}

	public async createDuplicate(uid: string, erid: string): Promise<string> {
		const erdRef: DocumentReference = doc(this.db, `erds_list/${erid}`);
		const erdData: DocumentSnapshot = await getDoc(erdRef);
		const data = erdData.get("data");
		// Attach "Copy of " to prevent name confusion
		const name = "Copy of " + erdData.get("name");
		const result = JSON.stringify({ name, data });
		return await this.createERD(uid, result);
	}
}

export default FirestoreController;
