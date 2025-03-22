/**
 * Firebase Authentication Module
 * This module handles user authentication with Firebase
 */
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} userData - Additional user data (name, userType, etc.)
 * @returns {Promise} - Promise that resolves with user info on success
 */
export const registerUser = async (email, password, userData) => {
    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await updateProfile(user, {
            displayName: userData.name
        });
        
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: userData.name,
            email: email,
            userType: userData.userType,
            createdAt: serverTimestamp(),
            ...userData // Add any additional fields
        });
        
        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error("Error registering user:", error);
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message
            }
        };
    }
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise that resolves with user info on success
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        return {
            success: true,
            user: user,
            userData: userDoc.exists() ? userDoc.data() : null
        };
    } catch (error) {
        console.error("Error logging in:", error);
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message
            }
        };
    }
};

/**
 * Sign out the current user
 * @returns {Promise} - Promise that resolves when user is signed out
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Error signing out:", error);
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message
            }
        };
    }
};

/**
 * Get current authentication state
 * @param {function} callback - Function to call with auth state changes
 * @returns {function} - Unsubscribe function to stop listening for changes
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            // Get additional user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            callback({
                user: user,
                userData: userDoc.exists() ? userDoc.data() : null,
                isLoggedIn: true
            });
        } else {
            // User is signed out
            callback({
                user: null,
                userData: null,
                isLoggedIn: false
            });
        }
    });
};

/**
 * Get the current logged in user
 * @returns {object|null} - Current user object or null if not logged in
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Send password reset email
 * @param {string} email - Email address to send reset link to
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message
            }
        };
    }
}; 