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
    // PART 2: YOUR ORIGINAL QR CODE SCRIPT
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
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; 

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded."); return;
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
    if (qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);

    function switchQrType(selectedType) {
        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active')); 

        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroupDiv = document.getElementById(`${selectedType}Inputs`);

        if (activeButton) activeButton.classList.add('active');
        if (activeInputGroupDiv) activeInputGroupDiv.classList.add('active');
        else {
            if(document.getElementById('urlInputs')) document.getElementById('urlInputs').classList.add('active'); 
            selectedType = 'url';
            if(document.querySelector(`.qr-type-button[data-type="url"]`)) document.querySelector(`.qr-type-button[data-type="url"]`).classList.add('active'); 
        }
        currentQrType = selectedType;

        let title = "Enter Data"; 
        const selectedButtonSpan = activeButton ? activeButton.querySelector('span') : null;
        if (selectedButtonSpan) title = `Enter details for ${selectedButtonSpan.textContent} QR`;
        else if (selectedType === 'url') title = 'Enter your Website URL';
        if(inputAreaTitle) inputAreaTitle.textContent = title;

        let placeholderData = "https://qodeo.pro";
        if (selectedType === 'text') placeholderData = "Your sample text";
        else if (selectedType === 'email') placeholderData = "mailto:test@example.com";
        
        qrCodeInstance.update({ data: placeholderData });
        if(qrDataDisplay) qrDataDisplay.textContent = `Switched to ${selectedType.toUpperCase()}.`;
    }

    // === YAHAN CODE ADD KIYA GAYA HAI ===
    if (qrTypeButtons) {
        qrTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                switchQrType(button.dataset.type);
            });
        });
    }

    function getQrDataStringForInstance() {
        // ... (Aapka poora getQrDataStringForInstance function jaisa pehle tha)
    }
    async function generateQRCodePreview() {
        // ... (Aapka poora generateQRCodePreview function jaisa pehle tha)
    }

    // Aapke saare baki ke event listeners
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', generateQRCodePreview);
    if(logoUploadInput){ /*... logo upload listener ...*/ }
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', generateQRCodePreview);
    });
    // ... baki saare event listeners

    // Initialize the first tab on page load
    if (qrTypeButtons.length > 0) {
        switchQrType('url'); 
    }
});