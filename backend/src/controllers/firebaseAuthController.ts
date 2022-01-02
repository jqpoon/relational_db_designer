import { FirebaseApp } from "firebase/app";
import { 
	UserCredential, 
	getAuth, 
	createUserWithEmailAndPassword, 
	signInWithEmailAndPassword 
} from "firebase/auth";

class FirebaseAuthController {

    private static instance: FirebaseAuthController;
    private auth;

    private constructor(firebaseApp: FirebaseApp) {
        this.auth = getAuth(firebaseApp);
    }

    public static getInstance(firebaseApp: FirebaseApp): FirebaseAuthController {
        if (!FirebaseAuthController.instance) {
            FirebaseAuthController.instance = new FirebaseAuthController(firebaseApp);
        }
        return FirebaseAuthController.instance;
    }

    public async signUp(email: string, password: string): Promise<string> {
			try {
					const userCredential: UserCredential = 
							await createUserWithEmailAndPassword(this.auth, email, password);
					return userCredential.user.uid;
			} catch (error: any) {
					const errorMessage = error.message;
					throw errorMessage;
			}
    }

    public async login(email: string, password: string): Promise<string> {
			try {
					const userCredential: UserCredential = 
							await signInWithEmailAndPassword(this.auth, email, password);
					return userCredential.user.uid;
			} catch (error: any) {
					const errorMessage = error.message;
					throw errorMessage;
			}
    }

}

export default FirebaseAuthController