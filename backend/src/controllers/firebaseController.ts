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

    public signUp(email: string, password: string): Promise<string> {
        return this.firebaseAuthController.signUp(email, password);
    }

    public login(email: string, password: string): Promise<string> {
        return this.firebaseAuthController.login(email, password);
    }

}

export default FirebaseController
