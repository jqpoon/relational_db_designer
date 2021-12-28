import { FirebaseApp } from "firebase/app";
import { 
	Auth, 
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


    public signUp(email: string, password: string): Promise<string> {
			return createUserWithEmailAndPassword(this.auth, email, password).then(
					() => {
							return "User has been created";
					})
					.catch((error) => {
							const errorMessage = error.message;
							throw errorMessage;
					});
    }

    public login(email: string, password: string): Promise<string> {
			return signInWithEmailAndPassword(this.auth, email, password).then(
					(userCredential: UserCredential) => {
							// Signed in
							const uid = userCredential.user.uid;
							return uid;
					})
					.catch((error) => {
							const errorMessage = error.message;
							throw errorMessage;
					});
    }

}

export default FirebaseAuthController