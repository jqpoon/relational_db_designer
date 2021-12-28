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

    public signUp(email: string, password: string): boolean {
        return this.firebaseAuthController.signUp(email, password);
    }

    public login(email: string, password: string): boolean {
        return this.firebaseAuthController.login(email, password);
    }

}

export default FirebaseController
