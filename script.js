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

    // PART 1: AUTHENTICATION (No changes needed here, it's good)
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
            // FIX: If user logs out, disable dynamic QR and uncheck the box.
            if (dynamicQrCheckbox) {
                dynamicQrCheckbox.checked = false;
                generateQRCodePreview(); // Regenerate preview as static
            }
        }
    });

    // =================================================================
    // PART 2: QR CODE SCRIPT (COMPLETED & FIXED)
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

    function switchQrType(selectedType) {
        const dynamicToggleContainer = document.querySelector('.dynamic-qr-toggle-container');
        // FIX: Show dynamic toggle only for 'url' type
        if (selectedType === 'url' && dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'flex';
        } else if (dynamicToggleContainer) {
            dynamicToggleContainer.style.display = 'none';
            dynamicQrCheckbox.checked = false; // Uncheck if we switch away from URL
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
        generateQRCodePreview();
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
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
        const currentUser = auth.currentUser;

        if (isDynamic && !currentUser) {
            alert("Please log in to use the Dynamic QR feature.");
            loginModalOverlay.classList.remove('hidden');
            dynamicQrCheckbox.checked = false; // Uncheck the box
            return;
        }

        if (!generateQrMainButton) return;

        let dataForQr;
        if(isDynamic) {
            dataForQr = `https://qodeo.vercel.app/qr/preview`;
        } else {
            dataForQr = getQrDataStringForInstance();
        }

        if (dataForQr === null) return;

        generateQrMainButton.disabled = true;
        generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            await qrCodeInstance.update({ 
                data: dataForQr,
                dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
                backgroundOptions: { color: backgroundColorInput.value },
                image: currentLogoBase64 || '',
             });
            if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.length > 70 ? dataForQr.substring(0, 67) + "..." : dataForQr;
        } catch (error) {
            console.error("Error updating QR Code:", error);
        } finally {
            if(generateQrMainButton) {
                generateQrMainButton.disabled = false;
                generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
            }
        }
    }

    // --- EVENT LISTENERS (Including newly added ones) ---
    if (qrTypeButtons) { qrTypeButtons.forEach(button => { button.addEventListener('click', () => { switchQrType(button.dataset.type); }); }); }
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', generateQRCodePreview);
    [dotColorInput, backgroundColorInput, dotStyleSelect, dynamicQrCheckbox].forEach(input => {
        if (input) input.addEventListener('change', generateQRCodePreview);
    });
    document.querySelectorAll('.qr-input-group input, .qr-input-group textarea, .qr-input-group select').forEach(input => {
        input.addEventListener('input', generateQRCodePreview);
    });

    // === ADDED: LOGO UPLOAD LOGIC ===
    if (logoUploadInput) {
        logoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                currentLogoBase64 = null;
                if(logoPreview) logoPreview.src = 'images/logo-placeholder.svg';
                generateQRCodePreview();
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                currentLogoBase64 = e.target.result;
                if (logoPreview) logoPreview.src = currentLogoBase64;
                generateQRCodePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    // === ADDED: DOWNLOAD BUTTONS LOGIC ===
    if (downloadSvgButton) {
        downloadSvgButton.addEventListener('click', () => {
            qrCodeInstance.download({ name: "qodeo-qr", extension: "svg" });
        });
    }

    if (downloadPngButton) {
        downloadPngButton.addEventListener('click', () => {
            qrCodeInstance.download({ name: "qodeo-qr", extension: "png" });
        });
    }

    // === ADDED: COMPLETE SAVE BUTTON LOGIC WITH LOGIN PROMPT ===
    if (saveQrButton) {
        saveQrButton.addEventListener('click', async () => {
            const currentUser = auth.currentUser;

            // Step 1: Check if user is logged in. If not, show login modal.
            if (!currentUser) {
                alert("Please log in to save your QR Code.");
                loginModalOverlay.classList.remove('hidden');
                return;
            }
            
            const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
            
            // Step 2: Get the data string for the QR code.
            const dataToSave = getQrDataStringForInstance();
            if (dataToSave === null) {
                alert("Please ensure all required fields are filled correctly before saving.");
                return;
            }

            // Step 3: Disable button and show loading state
            saveQrButton.disabled = true;
            saveQrButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            // Step 4: Prepare the data object for Firestore
            const qrRecord = {
                userId: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: isDynamic ? 'dynamic' : 'static',
                qrDataType: currentQrType,
                // For dynamic, save the original URL. For static, save the full data string.
                targetData: isDynamic ? qrDataUrlInput.value : dataToSave,
                scanCount: isDynamic ? 0 : null,
                customization: {
                    dotColor: dotColorInput.value,
                    backgroundColor: backgroundColorInput.value,
                    dotStyle: dotStyleSelect.value,
                    logo: currentLogoBase64 // Note: Storing large base64 can be expensive.
                }
            };

            // Step 5: Save to Firestore
            try {
                const docRef = await db.collection("qrcodes").add(qrRecord);
                console.log("QR Code saved with ID: ", docRef.id);
                saveQrButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
                // Revert button text after 2 seconds
                setTimeout(() => {
                    saveQrButton.disabled = false;
                    saveQrButton.innerHTML = '<i class="fas fa-save"></i> Save QR';
                }, 2000);
            } catch (error) {
                console.error("Error saving QR Code to Firestore: ", error);
                alert("Could not save QR Code. Please try again.");
                saveQrButton.disabled = false;
                saveQrButton.innerHTML = '<i class="fas fa-save"></i> Save QR';
            }
        });
    }

    // Initial state setup
    if (qrTypeButtons.length > 0) switchQrType('url');
    else { generateQRCodePreview(); }
});