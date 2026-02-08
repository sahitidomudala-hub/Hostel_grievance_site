import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCMPrXfRKuivE4imBDNT-Q3VhTIlehZTFY",
    authDomain: "hostel-308d2.firebaseapp.com",
    projectId: "hostel-308d2",
    storageBucket: "hostel-308d2.firebasestorage.app",
    messagingSenderId: "973304255876",
    appId: "1:973304255876:web:4a4a9860ac0169e42179d1",
    measurementId: "G-6617V0BN9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
