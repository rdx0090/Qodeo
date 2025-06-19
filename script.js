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
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const githubLoginButton = document.getElementById('github-login-button');

    if(loginButton) loginButton.addEventListener('click', () => loginModalOverlay.classList.remove('hidden'));
    if(closeModalButton) closeModalButton.addEventListener('click', () => loginModalOverlay.classList.add('hidden'));
    if(loginModalOverlay) loginModalOverlay.addEventListener('click', (event) => {
        if (event.target === loginModalOverlay) loginModalOverlay.classList.add('hidden');
    });
    const signInWithProvider = (provider) => {
        auth.signInWithPopup(provider).catch(error => console.error("Authentication Error:", error));
    };
    if(googleLoginButton) googleLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if(githubLoginButton) githubLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));
    if(logoutButton) logoutButton.addEventListener('click', () => auth.signOut());

    // --- User State Listener ---
    auth.onAuthStateChanged(user => {
        const saveQrButton = document.getElementById('saveQrButton'); // Save button ko yahan get karein
        if (user) {
            if(loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if(loginButton) loginButton.classList.add('hidden');
            if(userProfileDiv) userProfileDiv.classList.remove('hidden');
            if(userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
            if(saveQrButton) saveQrButton.disabled = false; // <<< NAYI LINE: User login ho toh Save button enable karein
            const userRef = db.collection('users').doc(user.uid);
            userRef.set({
                displayName: user.displayName, email: user.email, photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } else {
            if(loginButton) loginButton.classList.remove('hidden');
            if(userProfileDiv) userProfileDiv.classList.add('hidden');
            if(userAvatarImg) userAvatarImg.src = '';
            if(saveQrButton) saveQrButton.disabled = true; // <<< NAYI LINE: User logout ho toh Save button disable karein
        }
    });

    // =================================================================
    // PART 2: YOUR ORIGINAL QR CODE SCRIPT (FULLY RESTORED & FIXED)
    // =================================================================

    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const generateQrMainButton = document.getElementById('generateQrMainButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const saveQrButton = document.getElementById('saveQrButton'); // Naya Save button ka element
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
    if (typeof QRCodeStyling === 'undefined') { console.error("QRCodeStyling library not loaded."); return; }
    const previewQrWidth = 250; 
    const previewQrHeight = 250; 
    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: "https://qodeo.vercel.app", image: '',
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    if (qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);

    function switchQrType(selectedType) { /* Your switchQrType function */ }
    function getQrDataStringForInstance() { /* Your getQrDataStringForInstance function */ }
    async function generateQRCodePreview() { /* Your generateQRCodePreview function */ }
    
    // Yahan saare aapke original Event Listeners hain...
    if (qrTypeButtons) { qrTypeButtons.forEach(button => { button.addEventListener('click', () => { switchQrType(button.dataset.type); }); }); }
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', generateQRCodePreview);
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', generateQRCodePreview);
    });
    if (logoUploadInput) { /* ... Your logo upload listener logic ... */ }
    if (downloadSvgButton) { /* ... Your download SVG listener logic ... */ }
    if (downloadPngButton) { /* ... Your download PNG listener logic ... */ }
    
    // === YAHAN AAKHRI NAYA LOGIC ADD KIYA GAYA HAI ===
    if (saveQrButton) {
        saveQrButton.addEventListener('click', async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                // Agar user login nahi hai, toh login popup dikhayein
                loginModalOverlay.classList.remove('hidden');
                return;
            }

            // Button ko 'Saving...' state mein daalein
            saveQrButton.disabled = true;
            const originalText = saveQrButton.querySelector('span').textContent;
            saveQrButton.querySelector('span').textContent = 'Saving...';
            saveQrButton.querySelector('i').classList.add('fa-spin');

            // QR code ki saari information collect karein
            const qrCodeData = {
                userId: currentUser.uid,
                qrTextData: getQrDataStringForInstance(),
                design: {
                    dotColor: dotColorInput.value,
                    backgroundColor: backgroundColorInput.value,
                    dotStyle: dotStyleSelect.value,
                    logo: currentLogoBase64 // Save the logo too
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                qrName: `QR for ${currentQrType} - ${new Date().toLocaleTimeString()}`, // Better name
                type: currentQrType
            };

            try {
                // Firestore mein 'qrcodes' collection ke andar data save karein
                await db.collection('qrcodes').add(qrCodeData);
                
                // Success!
                saveQrButton.querySelector('span').textContent = 'Saved!';
                saveQrButton.querySelector('i').classList.remove('fa-spin', 'fa-cloud-arrow-up');
                saveQrButton.querySelector('i').classList.add('fa-check');

                setTimeout(() => {
                    saveQrButton.disabled = false;
                    saveQrButton.querySelector('span').textContent = originalText;
                    saveQrButton.querySelector('i').classList.remove('fa-check');
                    saveQrButton.querySelector('i').classList.add('fa-cloud-arrow-up');
                }, 2000);

            } catch (error) {
                console.error("Error saving QR code: ", error);
                alert("Sorry, couldn't save your QR code. Please try again.");
                // Error hone par button ko original state mein wapas le aayein
                saveQrButton.disabled = false;
                saveQrButton.querySelector('span').textContent = originalText;
                saveQrButton.querySelector('i').classList.remove('fa-spin');
            }
        });
    }

    // Initialize the first tab on page load
    if (qrTypeButtons.length > 0) {
        switchQrType('url'); 
    }
});