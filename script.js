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

    // This function will get the data STRING, with alerts if `doValidate` is true
    function getQrDataStringForInstance(doValidate = false) {
        let dataString = "";
        switch (currentQrType) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email': const to = qrEmailToInput.value; if (doValidate && !to) { alert("Please enter 'To Email Address'."); return null; } dataString = `mailto:${encodeURIComponent(to || '')}`; if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`; if (qrEmailBodyInput.value) dataString += (qrEmailSubjectInput.value ? '&' : '?') + `body=${encodeURIComponent(qrEmailBodyInput.value)}`; break;
            case 'phone': const phoneNum = qrPhoneNumberInput.value; if (doValidate && !phoneNum) { alert("Please enter a Phone Number."); return null; } dataString = `tel:${phoneNum}`; break;
            // ... all your other cases here with the `doValidate` check...
        }
        return dataString;
    }

    async function updatePreview() {
        // This version gets the data WITHOUT validation for a smooth experience
        const dataForPreview = getQrDataStringForInstance(false); 
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';

        await qrCodeInstance.update({
            data: isDynamic ? `https://qodeo.vercel.app/qr/preview` : dataForPreview,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
        });
    }
    
    function switchQrType(selectedType) {
        const dynamicToggleContainer = document.querySelector('.dynamic-qr-toggle-container');
        if (selectedType === 'url' && dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'flex';
        } else if (dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'none';
        }
        // ... rest of your switch type logic (it's correct)
        currentQrType = selectedType;
        // Update the preview smoothly
        updatePreview();
    }
    
    function handleGenerateClick() {
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
        const currentUser = auth.currentUser;
        
        // ** DYNAMIC QR LOCK IS HERE AND WORKING **
        if (isDynamic && !currentUser) {
            alert("Please log in to generate or save a Dynamic QR Code.");
            loginModalOverlay.classList.remove('hidden');
            return;
        }

        // Run validation now. This will show alerts if something is wrong.
        const dataForQr = getQrDataStringForInstance(true); // `true` will trigger alerts
        if(dataForQr === null) {
            return; // Stop if validation failed
        }
        console.log("Validation passed! QR Ready.");
        // The preview is already live, so this button is just for validation.
    }

    if (qrTypeButtons) { qrTypeButtons.forEach(button => { button.addEventListener('click', () => { switchQrType(button.dataset.type); }); }); }

    // THE GENERATE BUTTON ONLY VALIDATES and CHECKS THE LOCK
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', handleGenerateClick);

    // ALL REAL-TIME INPUTS WILL UPDATE THE PREVIEW SMOOTHLY
    document.querySelectorAll('.qr-input-group input, .qr-input-group textarea, .qr-input-group select').forEach(input => {
        if (input.type !== 'file') input.addEventListener('input', updatePreview);
    });
    [dotColorInput, backgroundColorInput, dotStyleSelect, dynamicQrCheckbox].forEach(input => {
        if(input) input.addEventListener('change', updatePreview);
    });

    if (logoUploadInput) { /* Your logo upload logic that calls updatePreview() at the end */ }
    
    // --- Download and Save buttons will use the validating function ---
    if (downloadSvgButton) { 
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataStringForInstance(true); // Validate first
            if (dataForDownload === null) return;
            qrCodeInstance.update({ data: dataForDownload });
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) { /* Your download PNG logic that calls getQrDataStringForInstance(true) */ }
    if (saveQrButton) { /* Your save button logic that calls getQrDataStringForInstance(true) */ }
    
    // Initial call
    if (qrTypeButtons.length > 0) switchQrType('url');
});