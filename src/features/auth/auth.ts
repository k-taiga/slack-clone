import {firebaseApp} from '../../firebase/firebaseconfig';
import {getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth";

export const auth = getAuth(firebaseApp);

export const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

export const signOut = () => auth.signOut();