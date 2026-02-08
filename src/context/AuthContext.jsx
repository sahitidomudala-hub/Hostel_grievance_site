import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student' or 'admin'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, fetch role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    } else {
                        // Handle case where user exists in Auth but not in 'users' collection
                        console.error("User document not found in Firestore");
                        setUserRole('student'); // Default fallback or error handling
                        // Ideally should sign out or show error
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    // Registers a new student using SAP ID as the identifier.
    // Maps SAP ID to an internal email format (@hostel.local) for Firebase Auth compatibility.
    const signup = async (sapId, password, name, roomNumber) => {
        const email = `${sapId}@hostel.local`;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            sapId: sapId,
            name: name,
            roomNumber: roomNumber,
            role: 'student',
            email: email,
            createdAt: serverTimestamp()
        });

        return userCredential;
    };

    const value = {
        currentUser,
        userRole,
        login,
        logout,
        signup,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
