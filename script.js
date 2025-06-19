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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==============================================================
// === MAIN APPLICATION CODE                                   ===
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {
    // PART 1: AUTHENTICATION
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    //... (your other auth elements)
    const loginModalOverlay = document.getElementById('login-modal-overlay');

    auth.onAuthStateChanged(user => { /*... your auth state change logic ...*/ });
    //... (your auth event listeners for login/logout/etc.)

    // =================================================================
    // PART 2: QR CODE SCRIPT (WITH FINAL LOCK LOGIC)
    // =================================================================
    const dynamicQrCheckbox = document.getElementById('makeQrDynamic');
    // ... (all your other qr code const elements)

    function switchQrType(selectedType) {
        const dynamicToggleContainer = document.querySelector('.dynamic-qr-toggle-container');
        // Logic to show/hide the toggle switch based on 'url' type
        if (selectedType === 'url' && dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'flex';
        } else if (dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'none';
            if (dynamicQrCheckbox) dynamicQrCheckbox.checked = false; // Also uncheck it
        }
        // ... (rest of your switchQrType logic)
    }

    // --- YOUR getQrDataStringForInstance FUNCTION IS HERE (NO CHANGES) ---
    function getQrDataStringForInstance() { /*...*/ }

    // --- UPDATED generateQRCodePreview FUNCTION ---
    async function generateQRCodePreview() {
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
        const currentUser = auth.currentUser;
        
        // === THIS IS THE LOCK ===
        if (isDynamic && !currentUser) {
            alert("Please log in to generate a Dynamic QR Code.");
            loginModalOverlay.classList.remove('hidden'); // Show the login popup
            dynamicQrCheckbox.checked = false; // Turn the switch back off
            return; // Stop the function here
        }
        
        if (!generateQrMainButton) return;
        
        let dataForQr;
        if(isDynamic) {
             // For preview, we just show a generic link
            dataForQr = `https://qodeo.vercel.app/qr/preview`;
        } else {
            dataForQr = getQrDataStringForInstance();
        }

        if (dataForQr === null) return;
        
        // ... (The rest of your generate QR code logic, setting button to "Generating..." etc.)
        generateQrMainButton.disabled = true;
        // ...
        await qrCodeInstance.update({ data: dataForQr, /*... other options ...*/ });
        // ...
        generateQrMainButton.disabled = false;
    }

    // --- Your saveQrButton logic is ALREADY correct. It checks for a logged in user. ---

    // --- All your original Event Listeners are here ---
    // ...
});