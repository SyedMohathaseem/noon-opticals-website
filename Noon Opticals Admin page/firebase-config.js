/**
 * =============================================
 * Firebase Configuration for Admin Panel
 * Firestore Database Setup for Noon Opticals
 * (Authentication disabled - using localStorage)
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
let firebaseDB = null;

/**
 * Initialize Firebase (Firestore only)
 */
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Running in local-only mode.');
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

        // Enable offline persistence for Firestore
        firebaseDB.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Firestore persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('Firestore persistence not supported in this browser');
                }
            });

        console.log('Firebase Firestore initialized successfully (Admin Panel)');
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

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
});

// Export for global access
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.getFirebaseDB = getFirebaseDB;
