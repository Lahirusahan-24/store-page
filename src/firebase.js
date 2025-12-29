import {
    initializeApp
} from "firebase/app";
import {
    getFirestore
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBS9lOYA_eBhuh1zH7QL5PVchLZPtUFYVc",
    authDomain: "store-db-66b2a.firebaseapp.com",
    projectId: "store-db-66b2a",
    storageBucket: "store-db-66b2a.firebasestorage.app",
    messagingSenderId: "460566373422",
    appId: "1:460566373422:web:8b32308e4ff08b54702bbf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);