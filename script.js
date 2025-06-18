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

// This makes sure our script ONLY runs after the entire HTML page is ready.
// This is the FIX for "Core UI elements missing" error.
document.addEventListener('DOMContentLoaded', () => {

    // PART 1: AUTHENTICATION
    // First, let's get all the elements we need for Login/Logout
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const githubLoginButton = document.getElementById('github-login-button');
    
    // Auth UI Event Listeners (with checks to prevent errors if element not found)
    if(loginButton) loginButton.addEventListener('click', () => loginModalOverlay.classList.remove('hidden'));
    if(closeModalButton) closeModalButton.addEventListener('click', () => loginModalOverlay.classList.add('hidden'));
    if(loginModalOverlay) loginModalOverlay.addEventListener('click', (event) => {
        if (event.target === loginModalOverlay) {
            loginModalOverlay.classList.add('hidden');
        }
    });

    const signInWithProvider = (provider) => {
        auth.signInWithPopup(provider).catch(error => console.error("Authentication Error:", error));
    };

    if(googleLoginButton) googleLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if(githubLoginButton) githubLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));
    if(logoutButton) logoutButton.addEventListener('click', () => auth.signOut());

    // --- User State Listener (Listen for login/logout) ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            if(loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if(loginButton) loginButton.classList.add('hidden');
            if(userProfileDiv) userProfileDiv.classList.remove('hidden');
            if(userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png'; // Add a default image to your /images folder

            const userRef = db.collection('users').doc(user.uid);
            userRef.set({
                displayName: user.displayName, email: user.email, photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } else {
            // User is signed out
            if(loginButton) loginButton.classList.remove('hidden');
            if(userProfileDiv) userProfileDiv.classList.add('hidden');
            if(userAvatarImg) userAvatarImg.src = '';
        }
    });
    
    // =================================================================
    // PART 2: YOUR ORIGINAL QR CODE SCRIPT (Now it's inside DOMContentLoaded)
    // =================================================================
    
    // --- All your original DOM Elements ---
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const generateQrMainButton = document.getElementById('generateQrMainButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay'); 
    const yearSpan = document.getElementById('year');
    const inputAreaTitle = document.getElementById('inputAreaTitle');
    const qrDataUrlInput = document.getElementById('qrDataUrl');
    const qrDataTextInput = document.getElementById('qrDataText');
    const qrEmailToInput = document.getElementById('qrEmailTo');
    const qrEmailSubjectInput = document.getElementById('qrEmailSubject');
    const qrEmailBodyInput = document.getElementById('qrEmailBody');
    const qrPhoneNumberInput = document.getElementById('qrPhoneNumber');
    const qrSmsNumberInput = document.getElementById('qrSmsNumber');
    const qrSmsMessageInput = document.getElementById('qrSmsMessage');
    const qrWifiSsidInput = document.getElementById('qrWifiSsid');
    const qrWifiPasswordInput = document.getElementById('qrWifiPassword');
    const qrWifiEncryptionSelect = document.getElementById('qrWifiEncryption');
    const qrWifiHiddenCheckbox = document.getElementById('qrWifiHidden');
    const vcardFirstNameInput = document.getElementById('vcardFirstName');
    const vcardLastNameInput = document.getElementById('vcardLastName');
    const vcardFormattedNameInput = document.getElementById('vcardFormattedName');
    const vcardPhoneMobileInput = document.getElementById('vcardPhoneMobile');
    const vcardPhoneWorkInput = document.getElementById('vcardPhoneWork');
    const vcardEmailInput = document.getElementById('vcardEmail');
    const vcardWebsiteInput = document.getElementById('vcardWebsite');
    const vcardOrganizationInput = document.getElementById('vcardOrganization');
    const vcardJobTitleInput = document.getElementById('vcardJobTitle');
    const vcardAdrStreetInput = document.getElementById('vcardAdrStreet');
    const vcardAdrCityInput = document.getElementById('vcardAdrCity');
    const vcardAdrRegionInput = document.getElementById('vcardAdrRegion');
    const vcardAdrPostcodeInput = document.getElementById('vcardAdrPostcode');
    const vcardAdrCountryInput = document.getElementById('vcardAdrCountry');
    const vcardNoteInput = document.getElementById('vcardNote');
    const qrLocationLatitudeInput = document.getElementById('qrLocationLatitude');
    const qrLocationLongitudeInput = document.getElementById('qrLocationLongitude');
    const qrLocationQueryInput = document.getElementById('qrLocationQuery');
    const qrEventSummaryInput = document.getElementById('qrEventSummary');
    const qrEventLocationInput = document.getElementById('qrEventLocation');
    const qrEventDtStartInput = document.getElementById('qrEventDtStart');
    const qrEventDtEndInput = document.getElementById('qrEventDtEnd');
    const qrEventDescriptionInput = document.getElementById('qrEventDescription');
    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');

    // THIS CHECK SHOULD NOW PASS
    if (!qrDataUrlInput || !generateQrMainButton || !qrTypeButtons || !qrCanvasContainer || !inputAreaTitle) {
        console.error("This shouldn't happen, but a core element is still missing!");
        return; 
    }

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; 

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded.");
        return;
    }

    const previewQrWidth = 250; const previewQrHeight = 250; 
    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: "https://qodeo.vercel.app", image: '',
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    qrCodeInstance.append(qrCanvasContainer);

    // ALL OF YOUR ORIGINAL FUNCTIONS (switchQrType, getQrDataStringForInstance, etc.)
    // ... Paste all your functions from the original script.js here ...
    function switchQrType(selectedType) { /* Your full function */ }
    function getQrDataStringForInstance() { /* Your full function */ }
    async function generateQRCodePreview() { /* Your full function */ }
    
    // ALL OF YOUR ORIGINAL EVENT LISTENERS
    // ... Paste all your event listeners here ...
    generateQrMainButton.addEventListener('click', generateQRCodePreview);
    
});