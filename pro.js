document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // === FIREBASE INITIALIZATION                             ===
    // =========================================================
    const firebaseConfig = {
        apiKey: "AIzaSyDNFQRtlvEJsvbmabHoLYduBfqRcPdgFpw",
        authDomain: "qodeo-qr.firebaseapp.com",
        projectId: "qodeo-qr",
        storageBucket: "qodeo-qr.appspot.com",
        messagingSenderId: "238610791735",
        appId: "1:238610791735:web:bc59eac9903994533f2eb2"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    
    // ==============================================================
    // === PAGE LOGIC                                             ===
    // ==============================================================

    const proFeatureCards = document.querySelectorAll('.pro-feature-card');
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const githubLoginButton = document.getElementById('github-login-button');
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Logic for Login Modal
    if(closeModalButton) closeModalButton.addEventListener('click', () => loginModalOverlay.classList.add('hidden'));
    if(loginModalOverlay) loginModalOverlay.addEventListener('click', (event) => {
        if (event.target === loginModalOverlay) loginModalOverlay.classList.add('hidden');
    });
    const signInWithProvider = (provider) => auth.signInWithPopup(provider).catch(error => console.error("Authentication Error:", error));
    if(googleLoginButton) googleLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if(githubLoginButton) githubLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));

    // Main logic for pro feature cards
    if (proFeatureCards) {
        proFeatureCards.forEach(card => {
            // Check if it's not the "Coming Soon" card
            if (!card.classList.contains('coming-soon')) {
                card.addEventListener('click', (event) => {
                    event.preventDefault(); // Link ko follow karne se roko

                    const tool = card.dataset.tool;
                    const currentUser = auth.currentUser;

                    if (currentUser) {
                        // Agar user logged in hai, to use tool par le jao (Future implementation)
                        // Abhi ke liye ek alert dikha do
                        const toolName = card.querySelector('h3').textContent;
                        alert(`You have access! Taking you to the ${toolName} tool... (This feature is coming soon)`);
                        // Example for future: window.location.href = `/tools/${tool}.html`;
                    } else {
                        // Agar user logged in nahi hai, to login popup dikhao
                        if(loginModalOverlay) loginModalOverlay.classList.remove('hidden');
                    }
                });
            }
        });
    }

    // Header Authentication logic (copied from script.js)
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    if(logoutButton) logoutButton.addEventListener('click', () => auth.signOut());

    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            if(loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if(loginButton) loginButton.style.display = 'none';
            if(userProfileDiv) {
                userProfileDiv.style.display = 'flex';
                userProfileDiv.classList.remove('hidden');
            }
            if(userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
        } else {
            // No user is signed in
            if(loginButton) loginButton.style.display = 'block';
            if(userProfileDiv) {
                userProfileDiv.style.display = 'none';
                userProfileDiv.classList.add('hidden');
            }
        }
    });
});