// === Firebase Ko Initialize Karna (Compatibility Mode for Reliability) ===
// !!! YAHAN APNA FIREBASE CONFIG PASTE KAREIN !!!
const firebaseConfig = {
    apiKey: "AIzaSy...YOUR_KEY...", // <-- PASTE YOURS
    authDomain: "qodeo-qr.firebaseapp.com",
    projectId: "qodeo-qr",
    storageBucket: "qodeo-qr.appspot.com",
    messagingSenderId: "...",
    appId: "...",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === MAIN APPLICATION LOGIC ===
document.addEventListener('DOMContentLoaded', () => {

    // === AUTHENTICATION AND LOGIN/LOGOUT UI ===
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileInfo = document.getElementById('profileInfo');
    const userProfilePic = document.getElementById('userProfilePic');
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const githubLoginBtn = document.getElementById('githubLoginBtn');

    // -- Modal (Popup) Visibility Logic --
    loginBtn.addEventListener('click', () => loginModal.classList.add('visible'));
    closeModalBtn.addEventListener('click', () => loginModal.classList.remove('visible'));
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('visible');
        }
    });

    // -- Social Login & Logout Handlers --
    const signInWithProvider = (provider) => {
        auth.signInWithPopup(provider)
            .then(result => { loginModal.classList.remove('visible'); })
            .catch(error => console.error("Login Error:", error));
    };
    googleLoginBtn.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    githubLoginBtn.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));
    logoutBtn.addEventListener('click', () => auth.signOut());

    // --- User State Observer (sabse zaroori) ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User login hai
            loginBtn.classList.add('hidden');
            profileInfo.classList.remove('hidden');
            userProfilePic.src = user.photoURL || 'default-profile-pic.png';
            const userRef = db.collection("users").doc(user.uid);
            userRef.set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).catch(error => console.error("Error saving user data:", error));
        } else {
            // User logout hai
            loginBtn.classList.remove('hidden');
            profileInfo.classList.add('hidden');
            userProfilePic.src = '';
        }
    });
    

    // =============================================================
    // === AAPKA ORIGINAL QR CODE GENERATOR KA LOGIC (BELOW)     ===
    // =============================================================

    // --- DOM Elements for QR Generator ---
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

    if (!qrDataUrlInput || !generateQrMainButton || qrTypeButtons.length === 0 || !qrCanvasContainer || !inputAreaTitle) {
        console.error("Core UI elements missing."); if(generateQrMainButton) generateQrMainButton.disabled = true; return; 
    }

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; 

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded."); if(generateQrMainButton) generateQrMainButton.disabled = true; return;
    }

    const previewQrWidth = 250; const previewQrHeight = 250; 
    const qrCodeInstance = new QRCodeStyling({ width: previewQrWidth, height: previewQrHeight, type: 'svg', data: "https://qodeo.pro", image: '', dotsOptions: { color: "#000000", type: "square" }, backgroundOptions: { color: "#ffffff" }, imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true }, qrOptions: { errorCorrectionLevel: 'H' }});
    qrCodeInstance.append(qrCanvasContainer);

    function switchQrType(selectedType) { /* ... Your full switchQrType function */ }
    qrTypeButtons.forEach(button => { button.addEventListener('click', () => { switchQrType(button.dataset.type); }); });
    function getQrDataStringForInstance() { /* ... Your full getQrDataStringForInstance function */ }
    async function generateQRCodePreview() { /* ... Your full generateQRCodePreview function */ }
    if (logoUploadInput) { /* ... Your full logo upload logic */ }
    generateQrMainButton.addEventListener('click', generateQRCodePreview);
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => { if (input) input.addEventListener('change', generateQRCodePreview); });
    if (downloadSvgButton) { /* ... Your full SVG download logic */ }
    if (downloadPngButton) { /* ... Your full PNG download logic */ }

    if (qrTypeButtons.length > 0) { switchQrType('url'); }
});