import { FirebaseApp, initializeApp } from "firebase/app"
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
				// Create actual ERD
				const erid: string = await this.firestoreController.createERD(uid, json);
				const name: string = JSON.parse(json).name as string;
				// Give user access to ERD and set as owner
				this.firestoreController.addERDToUser(uid, erid, name);
				this.firestoreController.addUserToERD(uid, erid, "OWNER");
		}
}

export default FirebaseController
