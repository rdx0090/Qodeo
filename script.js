// === Firebase Ko Initialize Karna (Compatibility Mode) ===
// Isme aapka config pehle se daal diya gaya hai.
const firebaseConfig = {
    apiKey: "AIzaSyDNFQRtlvEJsvbmabHoLYduBfqRcPdgFpw",
    authDomain: "qodeo-qr.firebaseapp.com",
    projectId: "qodeo-qr",
    storageBucket: "qodeo-qr.appspot.com", // Maine 'firebasestorage' ko aasan karne ke liye hata diya, V8 me iski zaroorat nahi
    messagingSenderId: "238610791735",
    appId: "1:238610791735:web:bc59eac9903994533f2eb2"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// === Main Application Code ===
document.addEventListener('DOMContentLoaded', () => {
    
    // --- AUTHENTICATION & UI ELEMENTS ---
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileInfo = document.getElementById('profileInfo');
    const userProfilePic = document.getElementById('userProfilePic');
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const githubLoginBtn = document.getElementById('githubLoginBtn');
    
    // --- Login Modal (Popup) ko Kholna/Band Karna ---
    if(loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.add('visible'));
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => loginModal.classList.remove('visible'));
    if(loginModal) loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) { 
            loginModal.classList.remove('visible');
        }
    });

    // --- Social Login Functions ---
    const signInWithProvider = (provider) => {
        auth.signInWithPopup(provider)
            .then(result => {
                console.log(`Logged in successfully!`);
                if(loginModal) loginModal.classList.remove('visible');
            })
            .catch(error => console.error(`Login error:`, error));
    };
    
    if(googleLoginBtn) googleLoginBtn.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if(githubLoginBtn) githubLoginBtn.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));
    
    // --- Logout Function ---
    if(logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());

    // --- User State Observer (sabse zaroori) ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User login hai
            if(loginBtn) loginBtn.classList.add('hidden');
            if(profileInfo) profileInfo.classList.remove('hidden');
            if(userProfilePic) userProfilePic.src = user.photoURL || 'default-profile-pic.png';

            const userRef = db.collection("users").doc(user.uid);
            userRef.set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true })
            .catch(error => console.error("Error saving user data:", error));

        } else {
            // User logout hai
            if(loginBtn) loginBtn.classList.remove('hidden');
            if(profileInfo) profileInfo.classList.add('hidden');
            if(userProfilePic) userProfilePic.src = '';
        }
    });

    
    // =============================================================
    // === AAPKA ORIGINAL QR CODE GENERATOR KA LOGIC (BELOW)     ===
    // =============================================================

    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Aapka poora original script.js ka logic (variables, functions, event listeners)
    // yahan paste kar dein. Sirf upar waale AUTHENTICATION se jude elements ko chhod kar.
    // Aapne pehle jo QR code ka JS diya tha, woh yahan aayega.

});