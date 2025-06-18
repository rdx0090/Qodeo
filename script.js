// === Firebase SDKs Ko Import Karna ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// === FIREBASE CONFIG ===
// !!! YAHAN APNA FIREBASE CONFIG PASTE KAREIN !!!
const firebaseConfig = {
  apiKey: "AIza...", // <-- PASTE YOUR KEY
  authDomain: "qodeo-qr.firebaseapp.com", // <-- PASTE YOURS
  projectId: "qodeo-qr", // <-- PASTE YOURS
  storageBucket: "qodeo-qr.appspot.com", // <-- PASTE YOURS
  messagingSenderId: "...", // <-- PASTE YOURS
  appId: "..." // <-- PASTE YOURS
};


// === Firebase Ko Initialize Karna ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// === Main Application Code ===
document.addEventListener('DOMContentLoaded', () => {
    
    // --- NAYE DOM ELEMENTS (Login System ke liye) ---
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileInfo = document.getElementById('profileInfo');
    const userProfilePic = document.getElementById('userProfilePic');
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const githubLoginBtn = document.getElementById('githubLoginBtn');


    // --- AAPKE PURANE DOM ELEMENTS (QR Generator ke liye) ---
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    // ... aapke baaki saare elements jaise qrDataUrlInput etc.
    

    // === NAYA CODE: AUTHENTICATION (LOGIN/LOGOUT) LOGIC ===

    // -- Modal (Popup) ko Kholna/Band Karna --
    const openLoginModal = () => loginModal.classList.add('visible');
    const closeLoginModal = () => loginModal.classList.remove('visible');
    
    loginBtn.addEventListener('click', openLoginModal);
    closeModalBtn.addEventListener('click', closeLoginModal);
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) { // Sirf overlay par click hone par band karein
            closeLoginModal();
        }
    });

    // -- Google se Login --
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Logged in with Google:", result.user);
            closeLoginModal();
        } catch (error) {
            console.error("Google login error:", error);
        }
    };
    googleLoginBtn.addEventListener('click', signInWithGoogle);

    // -- GitHub se Login --
    const signInWithGitHub = async () => {
        const provider = new GithubAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Logged in with GitHub:", result.user);
            closeLoginModal();
        } catch (error) {
            console.error("GitHub login error:", error);
        }
    };
    githubLoginBtn.addEventListener('click', signInWithGitHub);
    
    // -- Logout --
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("User logged out");
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });


    // --- AUTH STATE OBSERVER (Sabse Zaroori Hissa) ---
    // Yeh check karta hai ki user login hai ya nahi, aur uske hisaab se UI badalta hai.
    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in
            loginBtn.classList.add('hidden');
            profileInfo.classList.remove('hidden');
            userProfilePic.src = user.photoURL || 'default-profile.png'; // Agar photo nahi hai toh default

            // User ka data database mein save karna
            saveUserToDb(user);

        } else {
            // User is signed out
            loginBtn.classList.remove('hidden');
            profileInfo.classList.add('hidden');
            userProfilePic.src = '';
        }
    });

    // -- Helper function to save user data to Firestore --
    const saveUserToDb = async (user) => {
        const userRef = doc(db, "users", user.uid); // user.uid ek unique ID hai
        try {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: new Date()
            }, { merge: true }); // merge: true se purana data delete nahi hota
            console.log("User data saved to Firestore");
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    };

    // =============================================================
    // === AAPKA PURANA QR CODE GENERATOR KA CODE NEECHE HAI      ===
    // === YEH BILKUL BHI CHANGE NAHI KIYA GAYA HAI              ===
    // =============================================================
    
    // Aapka poora purana script.js ka code (variables, functions, event listeners)
    // yahan se shuru hota hai...
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    // ...and so on. The rest of your script goes here.
});