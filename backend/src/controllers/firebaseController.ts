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
				this.firestoreController.createDocumentForNewUser(uid);
				return "User created";
    }

    public login(email: string, password: string): Promise<string> {
        return this.firebaseAuthController.login(email, password);
    }

		public async createERD(uid: string, json: string): Promise<void> {
				const exists: boolean = await this.firestoreController.checkUserExists(uid);
				if (!exists) throw new ErrorBuilder(404, "User does not exist");
				await this.firestoreController.createERD(uid, json);
		}

		public async getERD(uid: string, erid: string): Promise<string> {
				const exists: boolean = await this.firestoreController.checkERDExists(erid);
				if (!exists) throw new ErrorBuilder(404, "ERD does not exist");
				const canAccess: boolean = await this.firestoreController.checkAccess(uid, erid);
				if (!canAccess) throw new ErrorBuilder(403, "You do not have permission to access");
				const data: string = await this.firestoreController.getERD(erid);
				return data;
		}

		public async updateERD(uid: string, erid: string, json: string): Promise<void> {
				const exists: boolean = await this.firestoreController.checkERDExists(erid);
				if (!exists) throw new ErrorBuilder(404, "ERD does not exist");
				const canAccess: boolean = await this.firestoreController.checkAccess(uid, erid);
				if (!canAccess) throw new ErrorBuilder(403, "You do not have permission to access");
				await this.firestoreController.updateERD(erid, json);
		}

		public async deleteERD(uid: string, erid: string): Promise<void> {
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
}

export default FirebaseController
