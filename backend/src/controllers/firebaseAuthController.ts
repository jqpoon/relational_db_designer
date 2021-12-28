import { FirebaseApp } from "firebase/app";
import { Auth, UserCredential, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

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

    private validatePassword(password: string): boolean {
        return password.length >= 3;
    }

    public signUp(email: string, password: string): boolean {
        if (this.validatePassword(password)) {
            createUserWithEmailAndPassword(this.auth, email, password).then(
                (userCredential: UserCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log(user);
                    return true;
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                    console.log(errorMessage);
                    return false;
                });
        }
        return false;
    }

    public login(email: string, password: string): boolean {
        if (this.validatePassword(password)) {
            signInWithEmailAndPassword(this.auth, email, password).then(
                (userCredential: UserCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log(user);
                    return true;
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                    console.log(errorMessage);
                    return false;
                });
        }
        return false;
    }

}

export default FirebaseAuthController