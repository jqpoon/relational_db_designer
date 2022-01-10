/*
	TABLE OF CONTENTS

	1. Imports
	2. Single controller class for Firebase that wraps authentication and Firestore
		2.1 Authentication methods
		2.2 CRUD for ERDs
		2.3 Collaboration methods
*/

// **********
// 1. Imports
// **********

import { FirebaseApp, initializeApp } from "firebase/app";
import FirebaseAuthController from "./firebaseAuthController";
import FirestoreController from "./firestoreController";
import ErrorBuilder from "./errorBuilder";

// *******************************************************************************
// 2. Single controller class for Firebase that wraps authentication and Firestore
// *******************************************************************************

class FirebaseController {
	private static instance: FirebaseController;
	private firebaseApp: FirebaseApp;
	private firestoreController: FirestoreController;
	private firebaseAuthController: FirebaseAuthController;

	private constructor() {
		this.firebaseApp = initializeApp({
			apiKey: process.env.FIREBASE_APIKEY,
			authDomain: process.env.FIREBASE_AUTHDOMAIN,
			projectId: process.env.FIREBASE_PROJECTID,
			storageBucket: process.env.FIREBASE_STORAGEBUCKET,
			messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
			appId: process.env.FIREBASE_APPID,
			measurementId: process.env.FIREBASE_MEASUREMENTID,
		});

		this.firestoreController = FirestoreController.getInstance(this.firebaseApp);
		this.firebaseAuthController = FirebaseAuthController.getInstance(this.firebaseApp);
	}

	public static getInstance(): FirebaseController {
		if (!FirebaseController.instance) {
			FirebaseController.instance = new FirebaseController();
		}
		return FirebaseController.instance;
	}

	// **************************
	// 2.1 Authentication methods
	// **************************

	public async signUp(email: string, password: string): Promise<string> {
		const uid: string = await this.firebaseAuthController.signUp(email, password);
		await this.firestoreController.createDocumentForNewUser(uid, email);
		return uid;
	}

	public login(email: string, password: string): Promise<string> {
		return this.firebaseAuthController.login(email, password);
	}

	// *****************
	// 2.2 CRUD for ERDs
	// *****************

	public async createERD(uid: string, data: string): Promise<string> {
		const exists: boolean = await this.firestoreController.checkUserExists(uid);
		if (!exists) throw new ErrorBuilder(404, "User does not exist");
		return this.firestoreController.createERD(uid, data);
	}

	public async getERD(uid: string, erid: string): Promise<string> {
		const userExists: boolean = await this.firestoreController.checkUserExists(uid);
		if (!userExists) throw new ErrorBuilder(404, "User does not exist");
		const erdExists: boolean = await this.firestoreController.checkERDExists(erid);
		if (!erdExists) throw new ErrorBuilder(404, "ERD does not exist");
		const canRead: boolean = await this.firestoreController.canRead(uid, erid);
		if (!canRead) throw new ErrorBuilder(403, "You do not have permission to access");
		const data: string = await this.firestoreController.getERD(erid);
		return data;
	}

	public async updateERD(uid: string, erid: string, data: string): Promise<void> {
		const json: any = JSON.parse(data);
		if (json.name === undefined || json.data === undefined || json.counter === undefined) {
			throw new ErrorBuilder(400, "Name, data and counter have to be defined");
		}
		const userExists: boolean = await this.firestoreController.checkUserExists(uid);
		if (!userExists) throw new ErrorBuilder(404, "User does not exist");
		const erdExists: boolean = await this.firestoreController.checkERDExists(erid);
		if (!erdExists) throw new ErrorBuilder(404, "ERD does not exist");
		const canWrite: boolean = await this.firestoreController.canWrite(uid, erid);
		if (!canWrite)
			throw new ErrorBuilder(
				403,
				"You do not have permission to write, please make a duplicate to make changes."
			);
		const canUpdate: boolean = await this.firestoreController.canUpdateERD(
			erid,
			json.counter as number
		);
		if (!canUpdate)
			throw new ErrorBuilder(409, "ERD update conflict, please retrieve the latest version");
		await this.firestoreController.updateERD(erid, data);
	}

	public async deleteERD(uid: string, erid: string): Promise<void> {
		const userExists: boolean = await this.firestoreController.checkUserExists(uid);
		if (!userExists) throw new ErrorBuilder(404, "User does not exist");
		const exists: boolean = await this.firestoreController.checkERDExists(erid);
		if (!exists) throw new ErrorBuilder(404, "ERD does not exist");
		const isOwner: boolean = await this.firestoreController.checkOwner(uid, erid);
		if (!isOwner) throw new ErrorBuilder(403, "Only the owner can delete");
		await this.firestoreController.deleteERD(erid);
	}

	// *************************
	// 2.3 Collaboration methods
	// *************************

	public async getAccessList(id: string, isUser: boolean): Promise<string> {
		let exists: boolean;
		if (isUser) {
			exists = await this.firestoreController.checkUserExists(id);
			if (!exists) throw new ErrorBuilder(404, "User does not exist");
			return this.firestoreController.getUserAccessList(id);
		}
		exists = await this.firestoreController.checkERDExists(id);
		if (!exists) throw new ErrorBuilder(404, "ERD does not exist");
		return this.firestoreController.getERDAccessList(id);
	}

	public async updateAccess(
		owner: string,
		email: string,
		erid: string,
		permission: string
	): Promise<void> {
		const uid: string | null = await this.firestoreController.getUidFromEmail(email);
		if (uid == null) throw new ErrorBuilder(404, "User does not exist");
		if (owner === uid) {
			throw new ErrorBuilder(400, "Cannot change owner permission");
		}
		if (!this.firestoreController.isValidPermission(permission)) {
			throw new ErrorBuilder(400, "Permission should be READ or READ-WRITE");
		}
		const erdExists: boolean = await this.firestoreController.checkERDExists(erid);
		if (!erdExists) throw new ErrorBuilder(404, "ERD does not exist");
		const ownerGrant: boolean = await this.firestoreController.checkOwner(owner, erid);
		if (!ownerGrant) throw new ErrorBuilder(403, "Only owner can change permissions");
		return this.firestoreController.updateAccess(uid, erid, permission);
	}

	public async createDuplicate(uid: string, erid: string): Promise<string> {
		const userExists: boolean = await this.firestoreController.checkUserExists(uid);
		if (!userExists) throw new ErrorBuilder(404, "User does not exist");
		const erdExists: boolean = await this.firestoreController.checkERDExists(erid);
		if (!erdExists) throw new ErrorBuilder(404, "ERD does not exist");
		const canRead: boolean = await this.firestoreController.canRead(uid, erid);
		if (!canRead) throw new ErrorBuilder(403, "You do not have permission to access");
		return this.firestoreController.createDuplicate(uid, erid);
	}
}

export default FirebaseController;
