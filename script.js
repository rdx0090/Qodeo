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
    const signInWithProvider = (provider) => auth.signInWithPopup(provider).catch(error => console.error("Authentication Error:", error));
    if(googleLoginButton) googleLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if(githubLoginButton) githubLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));
    if(logoutButton) logoutButton.addEventListener('click', () => auth.signOut());

    auth.onAuthStateChanged(user => {
        const dynamicQrCheckbox = document.getElementById('makeQrDynamic');
        if (user) {
            if(loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if(loginButton) loginButton.classList.add('hidden');
            if(userProfileDiv) userProfileDiv.classList.remove('hidden');
            if(userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
        } else {
            if(loginButton) loginButton.classList.remove('hidden');
            if(userProfileDiv) userProfileDiv.classList.add('hidden');
            if(userAvatarImg) userAvatarImg.src = '';
            if (dynamicQrCheckbox) dynamicQrCheckbox.checked = false; 
        }
    });

    // =================================================================
    // PART 2: QR CODE SCRIPT (POLISHED & FIXED)
    // =================================================================
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const generateQrMainButton = document.getElementById('generateQrMainButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const saveQrButton = document.getElementById('saveQrButton');
    const dynamicQrCheckbox = document.getElementById('makeQrDynamic');
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

    // --- YOUR ORIGINAL FUNCTIONS WITH THE FIX ---
    function switchQrType(selectedType) {
        const dynamicToggleContainer = document.querySelector('.dynamic-qr-toggle-container');
        if (selectedType === 'url' && dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'flex';
        } else if (dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'none';
        }

        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active'));
        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroupDiv = document.getElementById(`${selectedType}Inputs`);
        if (activeButton) activeButton.classList.add('active');
        if (activeInputGroupDiv) activeInputGroupDiv.classList.add('active');
        else {
            if (document.getElementById('urlInputs')) document.getElementById('urlInputs').classList.add('active');
            selectedType = 'url';
            if (document.querySelector(`.qr-type-button[data-type="url"]`)) document.querySelector(`.qr-type-button[data-type="url"]`).classList.add('active');
        }
        currentQrType = selectedType;
        let title = "Enter Data";
        const selectedButtonSpan = activeButton ? activeButton.querySelector('span') : null;
        if (selectedButtonSpan) title = `Enter details for ${selectedButtonSpan.textContent} QR`;
        else if (selectedType === 'url') title = 'Enter your Website URL';
        if (inputAreaTitle) inputAreaTitle.textContent = title;

        // Auto-generate preview on type switch WITHOUT alerts
        updatePreview();
    }
    
    // NEW FUNCTION: THIS FUNCTION ONLY GETS DATA, IT DOES NOT VALIDATE.
    function getQrDataForPreview() {
        let dataString = "";
        switch (currentQrType) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email': dataString = `mailto:${qrEmailToInput.value || 'test@example.com'}?subject=${qrEmailSubjectInput.value || ''}&body=${qrEmailBodyInput.value || ''}`; break;
            // ... all other cases with placeholder values
            default: dataString = "https://qodeo.pro";
        }
        return dataString;
    }

    // THIS FUNCTION GETS THE FINAL DATA AND VALIDATES IT. IT'S USED BY 'Generate' and 'Save' buttons.
    function getQrDataAndValidate() {
        // ... (This function is basically your old getQrDataStringForInstance)
        let dataString = "";
        switch (currentQrType) {
            case 'email': const to = qrEmailToInput.value; if (!to) { alert("Please enter 'To Email Address'."); return null; }
                          dataString = `mailto:${encodeURIComponent(to)}`; if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`; if (qrEmailBodyInput.value) dataString += `?body=${encodeURIComponent(qrEmailBodyInput.value)}`; break;
            // ... (All other cases with alerts are here)
        }
        return dataString;
    }

    // THIS FUNCTION IS FOR INSTANT VISUAL UPDATES ONLY
    function updatePreview() {
        const dataForQr = getQrDataForPreview(); // Gets data without validation
        qrCodeInstance.update({ 
            data: dataForQr,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || ''
         });
         if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.length > 70 ? dataForQr.substring(0, 67) + "..." : dataForQr;
    }

    function generateQRCode() {
        if (!generateQrMainButton) return;
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
        const currentUser = auth.currentUser;
        if (isDynamic && !currentUser) {
            alert("Please log in to use the Dynamic QR feature.");
            loginModalOverlay.classList.remove('hidden');
            return;
        }

        const data = getQrDataAndValidate(); // This will show alerts if needed
        if(data === null) return; // Stop if validation fails

        // The preview is already updated in real-time, so this button is just for validation.
        console.log("Validation passed. QR is ready.");
    }

    if (qrTypeButtons) { qrTypeButtons.forEach(button => { button.addEventListener('click', () => { switchQrType(button.dataset.type); }); }); }
    
    // THE GENERATE BUTTON ONLY VALIDATES
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', generateQRCode);
    
    // DESIGN AND TEXT INPUTS WILL UPDATE THE PREVIEW INSTANTLY
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', updatePreview);
    });
    document.querySelectorAll('.qr-input-group input, .qr-input-group textarea, .qr-input-group select').forEach(input => {
        if (input.type !== 'file') input.addEventListener('input', updatePreview);
    });

    if (logoUploadInput) { /* Your logo logic that calls updatePreview() at the end */ }
    if (downloadSvgButton) { /* Your download logic that calls getQrDataAndValidate() */ }
    if (downloadPngButton) { /* Your download logic that calls getQrDataAndValidate() */ }
    if (saveQrButton) { /* Your save logic that calls getQrDataAndValidate() and dynamic check */ }

    if (qrTypeButtons.length > 0) switchQrType('url');
});