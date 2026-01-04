/**
 * =============================================
 * Firebase Configuration
 * Firestore + Auth (Google Sign-In) for Noon Opticals
 * ============================================= 
 */

// Firebase Configuration
// Noon Opticals Firebase Project
const firebaseConfig = {
    apiKey: "AIzaSyDsFdVluzW7FyRY599dzaJqZe6Ik136Nvw",
    authDomain: "noon-opticals-332c8.firebaseapp.com",
    projectId: "noon-opticals-332c8",
    storageBucket: "noon-opticals-332c8.firebasestorage.app",
    messagingSenderId: "332002608976",
    appId: "1:332002608976:web:61fa4b458f614b38248e55",
    measurementId: "G-FHN4TQRJY3"
};

// Firebase instances
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDB = null;

/**
 * Initialize Firebase
 */
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded.');
        return false;
    }

    try {
        // Initialize Firebase App
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            firebaseApp = firebase.app();
        }

        // Initialize Firestore
        firebaseDB = firebase.firestore();

        // Initialize Auth (for Google Sign-In)
        firebaseAuth = firebase.auth();

        // Enable offline persistence for Firestore
        firebaseDB.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Firestore persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('Firestore persistence not supported in this browser');
                }
            });

        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

/**
 * Get Firestore instance
 */
function getFirebaseDB() {
    return firebaseDB;
}

/**
 * Get Auth instance
 */
function getFirebaseAuth() {
    return firebaseAuth;
}

// Auto-initialize on load
if (typeof firebase !== 'undefined') {
    initializeFirebase();
}

// Export for global access
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.getFirebaseDB = getFirebaseDB;
window.getFirebaseAuth = getFirebaseAuth;

/**
 * Get Firebase Auth instance
 */
function getFirebaseAuth() {
    return firebaseAuth;
}

/**
 * Get Firestore instance
 */
function getFirebaseDB() {
    return firebaseDB;
}

/**
 * Get current user
 */
function getCurrentUser() {
    return firebaseAuth ? firebaseAuth.currentUser : null;
}

/**
 * Listen to auth state changes
 */
function onAuthStateChanged(callback) {
    if (firebaseAuth) {
        return firebaseAuth.onAuthStateChanged(callback);
    }
    return null;
}

// Export for global access
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.getFirebaseAuth = getFirebaseAuth;
window.getFirebaseDB = getFirebaseDB;
window.getCurrentUser = getCurrentUser;
window.onAuthStateChanged = onAuthStateChanged;
