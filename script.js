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

    if (loginButton) loginButton.addEventListener('click', () => loginModalOverlay.classList.remove('hidden'));
    if (closeModalButton) closeModalButton.addEventListener('click', () => loginModalOverlay.classList.add('hidden'));
    if (loginModalOverlay) loginModalOverlay.addEventListener('click', (event) => {
        if (event.target === loginModalOverlay) loginModalOverlay.classList.add('hidden');
    });
    const signInWithProvider = (provider) => auth.signInWithPopup(provider).catch(error => console.error("Authentication Error:", error));
    if (googleLoginButton) googleLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if (githubLoginButton) githubLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));
    if (logoutButton) logoutButton.addEventListener('click', () => auth.signOut());

    auth.onAuthStateChanged(user => {
        const saveQrButton = document.getElementById('saveQrButton');
        if (user) {
            if (loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if (loginButton) loginButton.classList.add('hidden');
            if (userProfileDiv) userProfileDiv.classList.remove('hidden');
            if (userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
        } else {
            if (loginButton) loginButton.classList.remove('hidden');
            if (userProfileDiv) userProfileDiv.classList.add('hidden');
            if (userAvatarImg) userAvatarImg.src = '';
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

    // --- YOUR ORIGINAL FUNCTIONS ARE NOW BACK ---
    function switchQrType(selectedType) {
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
        let placeholderData = "https://qodeo.pro";
        if (selectedType === 'text') placeholderData = "Your sample text";
        else if (selectedType === 'email') placeholderData = "mailto:test@example.com";
        qrCodeInstance.update({ data: placeholderData });
        if (qrDataDisplay) qrDataDisplay.textContent = `Switched to ${selectedType.toUpperCase()}.`;
    }
    function getQrDataStringForInstance() {
        let dataString = "";
        switch (currentQrType) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email': const to = qrEmailToInput.value; if (!to) { alert("Please enter 'To Email Address'."); return null; } dataString = `mailto:${encodeURIComponent(to)}`; if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`; if (qrEmailBodyInput.value) dataString += (qrEmailSubjectInput.value ? '&' : '?') + `body=${encodeURIComponent(qrEmailBodyInput.value)}`; break;
            case 'phone': const phoneNum = qrPhoneNumberInput.value; if (!phoneNum) { alert("Please enter a Phone Number."); return null; } dataString = `tel:${phoneNum}`; break;
            case 'sms': const smsNum = qrSmsNumberInput.value; if (!smsNum) { alert("Please enter Phone Number for SMS."); return null; } dataString = `smsto:${smsNum}`; if (qrSmsMessageInput.value) dataString += `:${encodeURIComponent(qrSmsMessageInput.value)}`; break;
            case 'wifi': const ssid = qrWifiSsidInput.value; if (!ssid) { alert("Please enter Network Name (SSID)."); return null; } const password = qrWifiPasswordInput.value; const encryption = qrWifiEncryptionSelect.value; const hidden = qrWifiHiddenCheckbox.checked ? 'true' : 'false'; dataString = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};;`; break;
            case 'vcard': const fn = vcardFormattedNameInput.value; if (!fn) { alert("Please enter 'Display Name' for vCard."); return null; } dataString = "BEGIN:VCARD\nVERSION:3.0\n"; dataString += `N:${vcardLastNameInput.value || ''};${vcardFirstNameInput.value || ''}\n`; dataString += `FN:${fn}\n`; if (vcardOrganizationInput.value) dataString += `ORG:${vcardOrganizationInput.value}\n`; if (vcardJobTitleInput.value) dataString += `TITLE:${vcardJobTitleInput.value}\n`; if (vcardPhoneMobileInput.value) dataString += `TEL;TYPE=CELL,VOICE:${vcardPhoneMobileInput.value}\n`; if (vcardPhoneWorkInput.value) dataString += `TEL;TYPE=WORK,VOICE:${vcardPhoneWorkInput.value}\n`; if (vcardEmailInput.value) dataString += `EMAIL:${vcardEmailInput.value}\n`; if (vcardWebsiteInput.value) dataString += `URL:${vcardWebsiteInput.value}\n`; if (vcardAdrStreetInput.value || vcardAdrCityInput.value || vcardAdrRegionInput.value || vcardAdrPostcodeInput.value || vcardAdrCountryInput.value) { dataString += `ADR;TYPE=HOME:;;${vcardAdrStreetInput.value || ''};${vcardAdrCityInput.value || ''};${vcardAdrRegionInput.value || ''};${vcardAdrPostcodeInput.value || ''};${vcardAdrCountryInput.value || ''}\n`; } if (vcardNoteInput.value) dataString += `NOTE:${vcardNoteInput.value}\n`; dataString += "END:VCARD"; break;
            case 'location': const lat = qrLocationLatitudeInput.value; const lon = qrLocationLongitudeInput.value; if (!lat || !lon) { alert("Please enter Latitude and Longitude."); return null; } const query = qrLocationQueryInput.value; dataString = `geo:${lat},${lon}`; if (query) dataString += `?q=${encodeURIComponent(query)}`; break;
            case 'event': const summary = qrEventSummaryInput.value; const dtstart = qrEventDtStartInput.value; const dtend = qrEventDtEndInput.value; if (!summary || !dtstart || !dtend) { alert("Please fill Event Summary, Start, and End Date/Time."); return null; } const formatDateTime = (datetime) => datetime ? datetime.replace(/[-:]/g, '').replace('T', 'T') + '00' : ''; dataString = "BEGIN:VEVENT\n"; dataString += `SUMMARY:${summary}\n`; dataString += `DTSTART:${formatDateTime(dtstart)}\n`; dataString += `DTEND:${formatDateTime(dtend)}\n`; if (qrEventLocationInput.value) dataString += `LOCATION:${qrEventLocationInput.value}\n`; if (qrEventDescriptionInput.value) dataString += `DESCRIPTION:${qrEventDescriptionInput.value}\n`; dataString += "END:VEVENT"; break;
            default: dataString = "https://qodeo.pro";
        }
        return dataString;
    }
    async function generateQRCodePreview() {
        if (!generateQrMainButton) return;
        const dataForQr = getQrDataStringForInstance();
        if (dataForQr === null) return;
        generateQrMainButton.disabled = true; generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        const options = {
            data: dataForQr,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
        };
        try {
            await qrCodeInstance.update(options);
            if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.length > 70 ? dataForQr.substring(0, 67) + "..." : dataForQr;
        } catch (error) {
            console.error("Error updating QR Code:", error);
        } finally {
            if (generateQrMainButton) { generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code'; }
        }
    }
    
    // --- YOUR ORIGINAL EVENT LISTENERS ARE NOW BACK ---
    if (qrTypeButtons) { qrTypeButtons.forEach(button => { button.addEventListener('click', () => { switchQrType(button.dataset.type); }); }); }
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', generateQRCodePreview);
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', generateQRCodePreview);
    });
    if (logoUploadInput) {
        logoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) { currentLogoBase64 = e.target.result; if (logoPreview) { logoPreview.src = e.target.result; logoPreview.style.display = 'block'; } generateQRCodePreview(); };
                reader.readAsDataURL(file);
            } else { currentLogoBase64 = null; if (logoPreview) { logoPreview.src = "#"; logoPreview.style.display = 'none'; } generateQRCodePreview(); }
        });
    }
    if (downloadSvgButton) {
        downloadSvgButton.addEventListener('click', () => {
            if (!qrCodeInstance) return;
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) {
        downloadPngButton.addEventListener('click', () => {
            if (!qrCodeInstance) return;
            const highResWidth = 1024; const highResHeight = 1024;
            const tempQrInstance = new QRCodeStyling({ ...qrCodeInstance._options, width: highResWidth, height: highResHeight, type: 'canvas' });
            downloadPngButton.textContent = "Preparing HD...";
            downloadPngButton.disabled = true;
            tempQrInstance.download({ name: `qodeo-qr-hd`, extension: 'png' })
                .catch(error => console.error("Error during HD PNG download:", error))
                .finally(() => {
                    downloadPngButton.textContent = "Download PNG";
                    downloadPngButton.disabled = false;
                });
        });
    }

    // --- SAVE BUTTON LOGIC (WITH THE "PROMPT TO LOGIN" FIX) ---
    if (saveQrButton) {
        saveQrButton.addEventListener('click', async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                loginModalOverlay.classList.remove('hidden');
                return;
            }
            saveQrButton.disabled = true;
            const originalText = saveQrButton.querySelector('span').textContent;
            saveQrButton.querySelector('span').textContent = 'Saving...';
            saveQrButton.querySelector('i').classList.add('fa-spin');

            const qrCodeData = {
                userId: currentUser.uid,
                qrTextData: getQrDataStringForInstance(),
                design: {
                    dotColor: dotColorInput.value,
                    backgroundColor: backgroundColorInput.value,
                    dotStyle: dotStyleSelect.value,
                    logo: currentLogoBase64
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                qrName: `${currentQrType} QR`,
                type: currentQrType
            };

            db.collection('qrcodes').add(qrCodeData)
                .then(() => {
                    saveQrButton.querySelector('span').textContent = 'Saved!';
                    saveQrButton.querySelector('i').classList.remove('fa-spin', 'fa-cloud-arrow-up');
                    saveQrButton.querySelector('i').classList.add('fa-check');
                    setTimeout(() => {
                        saveQrButton.disabled = false;
                        saveQrButton.querySelector('span').textContent = originalText;
                        saveQrButton.querySelector('i').classList.remove('fa-check');
                        saveQrButton.querySelector('i').classList.add('fa-cloud-arrow-up');
                    }, 2000);
                })
                .catch(error => {
                    console.error("Error saving QR code: ", error);
                    alert("Could not save your QR code.");
                    saveQrButton.disabled = false;
                    saveQrButton.querySelector('span').textContent = originalText;
                    saveQrButton.querySelector('i').classList.remove('fa-spin');
                });
        });
    }

    if (qrTypeButtons.length > 0) switchQrType('url');
});