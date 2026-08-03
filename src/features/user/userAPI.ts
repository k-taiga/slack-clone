import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "../../firebase/firebaseconfig";
import {User} from "../../type/User";

const db = getFirestore(firebaseApp);

export const getUser = async (user_uid:string) => {
    const usersRef = doc(db, "Users", user_uid);
    const docSnap = await getDoc(usersRef);
    if (!docSnap.exists()) {
        console.log("user not found:", usersRef.path);
        return;
    }
    return docSnap.data() as User;
};