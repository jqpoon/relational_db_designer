/* eslint-disable max-len */
import { FirebaseApp, initializeApp } from "firebase/app"
import ErrorBuilder from "./errorBuilder";
import FirebaseAuthController from "./firebaseAuthController";
import FirestoreController from "./firestoreController";

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
						measurementId: process.env.FIREBASE_MEASUREMENTID
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

    public async signUp(email: string, password: string): Promise<string> {
				const uid: string = await this.firebaseAuthController.signUp(email, password);
				this.firestoreController.createDocumentForNewUser(uid, email);
				return uid;
    }

    public login(email: string, password: string): Promise<string> {
        return this.firebaseAuthController.login(email, password);
    }

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
				if (!canWrite) throw new ErrorBuilder(403, "You do not have permission to write");
				const canUpdate: boolean = await this.firestoreController.canUpdateERD(erid, json.counter as number);
				if (!canUpdate) throw new ErrorBuilder(409, "ERD update conflict, please retrieve the latest version");
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

		public async updateAccess(owner: string, uid: string, erid: string, permission: string): Promise<void> {
				if (owner === uid) {
						throw new ErrorBuilder(400, "Cannot change owner permission");
				}
				if (!this.firestoreController.isValidPermission(permission)) {
						throw new ErrorBuilder(400, "Permission should be READ or READ-WRITE");
				}
				const userExists: boolean = await this.firestoreController.checkUserExists(uid);
				if (!userExists) throw new ErrorBuilder(404, "User does not exist");
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

export default FirebaseController
