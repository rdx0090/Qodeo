// =========================================================
// === FIREBASE & CLOUDINARY SETUP                         ===
// =========================================================
const firebaseConfig = {
    apiKey: "AIzaSyDNFQRtlvEJsvbmabHoLYduBfqRcPdgFpw",
    authDomain: "qodeo-qr.firebaseapp.com",
    projectId: "qodeo-qr",
    storageBucket: "qodeo-qr.appspot.com", // Firebase Storage ke liye zaroori
    messagingSenderId: "238610791735",
    appId: "1:238610791735:web:bc59eac9903994533f2eb2"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Cloudinary Details (Aapne provide ki thi)
const CLOUD_NAME = 'drork8wvy';
const UPLOAD_PRESET = 'qodeo_uploads';

// ==============================================================
// === MAIN APPLICATION CODE (HOMEPAGE)                       ===
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
        const dynamicQrCheckbox = document.getElementById('makeQrDynamic');
        if (user) {
            document.body.classList.add('logged-in');
            document.body.classList.remove('logged-out');
            if (loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if (loginButton) loginButton.classList.add('hidden');
            if (userProfileDiv) userProfileDiv.classList.remove('hidden');
            if (userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
        } else {
            document.body.classList.add('logged-out');
            document.body.classList.remove('logged-in');
            if (loginButton) loginButton.classList.remove('hidden');
            if (userProfileDiv) userProfileDiv.classList.add('hidden');
            if (userAvatarImg) userAvatarImg.src = '';
            if (dynamicQrCheckbox) {
                dynamicQrCheckbox.checked = false;
                // Pehlay yahan generateQRCodePreview tha, uski ab zaroorat nahi.
            }
        }
    });

    // =================================================================
    // PART 2: QR CODE SCRIPT
    // =================================================================
    const qrSound = document.getElementById('qrSound');
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
    const downloadModalOverlay = document.getElementById('download-modal-overlay');
    const closeDownloadModalButton = document.getElementById('close-download-modal-button');
    const qualityButtons = document.querySelectorAll('.quality-btn');
    const pdfUploadInput = document.getElementById('pdfUpload');
    const pdfUploadLabel = document.querySelector('.file-upload-label');
    const pdfFileName = document.getElementById('pdfFileName');
    const pdfUploadProgress = document.getElementById('pdfUploadProgress');

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentTool = 'url';
    if (typeof QRCodeStyling === 'undefined') { console.error("QRCodeStyling library not loaded."); return; }

    const qrCodeInstance = new QRCodeStyling({
        width: 250, height: 250, type: 'svg',
        data: "https://qodeo.pro", image: '',
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    if (qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);

    const urlParams = new URLSearchParams(window.location.search);
    const toolFromUrl = urlParams.get('tool');

    if (toolFromUrl) {
        auth.onAuthStateChanged(user => {
            if (user) { switchTool(toolFromUrl); }
            else { alert("Please log in to use Pro features."); loginModalOverlay.classList.remove('hidden'); switchTool('url'); }
        });
    } else { switchTool('url'); }

    function switchTool(selectedTool) {
        currentTool = selectedTool;
        document.querySelectorAll('.qr-input-group').forEach(group => group.classList.remove('active'));
        document.querySelectorAll('.qr-type-button').forEach(btn => btn.classList.remove('active'));
        const activeInputGroupDiv = document.getElementById(`${selectedTool}Inputs`);
        if (activeInputGroupDiv) activeInputGroupDiv.classList.add('active');
        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedTool}"]`);
        if (activeButton) activeButton.classList.add('active');
        const titleMap = { url: 'Enter your Website URL', text: 'Enter Plain Text', email: 'Enter Email Details', phone: 'Enter Phone Number', sms: 'Create an SMS', wifi: 'Setup Wi-Fi QR', vcard: 'Create a vCard', location: 'Enter Geolocation', event: 'Create a Calendar Event', pdf: 'Upload a PDF File (Pro)', app_store: 'Enter App Store Links (Pro)' };
        inputAreaTitle.textContent = titleMap[selectedTool] || 'Enter Data';
        generateQRCodePreview(false, selectedTool);
    }

    // === EVENT LISTENERS ===
    qrTypeButtons.forEach(button => button.addEventListener('click', () => switchTool(button.dataset.type)));

    // ===== TABDEELI #2: DYNAMIC QR CHECKBOX KA LOGIC YAHAN ADD KIYA GAYA HAI =====
    if (dynamicQrCheckbox) {
        dynamicQrCheckbox.addEventListener('change', (event) => {
            if (event.target.checked && !auth.currentUser) {
                event.target.checked = false;
                alert("Please log in to create a Dynamic QR Code.");
                if (loginModalOverlay) {
                    loginModalOverlay.classList.remove('hidden');
                }
            } else {
                 // Dynamic check/uncheck honay par bhi preview update karein
                generateQRCodePreview(false, currentTool);
            }
        });
    }

    if (pdfUploadLabel) pdfUploadLabel.addEventListener('click', () => pdfUploadInput.click());
    if (pdfUploadInput) pdfUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf") { alert("Please select a PDF file only."); e.target.value = ""; return; }
        if (file.size > 5 * 1024 * 1024) { alert("File is too large (Max 5MB)."); e.target.value = ""; return; }
        pdfFileName.textContent = `Selected: ${file.name}`;
        if (pdfUploadLabel) pdfUploadLabel.querySelector('span').textContent = "Change PDF File";
    });

    if (generateQrMainButton) generateQrMainButton.addEventListener('click', () => {
        // ===== TABDEELI #1: SOUND PLAY KARNE KA CODE YAHAN ADD KIYA GAYA HAI =====
        if (qrSound) { qrSound.currentTime = 0; qrSound.play().catch(e => {}); }

        const proTools = ['pdf', 'app_store'];
        if (proTools.includes(currentTool)) {
            if (!auth.currentUser) {
                alert("Please log in to use this Pro feature.");
                loginModalOverlay.classList.remove('hidden');
                return;
            }
            if (currentTool === 'pdf') handlePdfUpload();
        } else {
            generateQRCodePreview(true, currentTool);
        }
    });
    
    // Dynamic QR checkbox ko is array se nikal dein kyunki uska alag handler hai
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', () => generateQRCodePreview(false, currentTool));
    });
    document.querySelectorAll('.qr-input-group input, .qr-input-group textarea, .qr-input-group select').forEach(input => {
        input.addEventListener('input', () => generateQRCodePreview(false, currentTool));
    });

    if (logoUploadInput) logoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) { currentLogoBase64 = null; if (logoPreview) logoPreview.style.display = 'none'; }
        else {
            const reader = new FileReader();
            reader.onload = (e) => { currentLogoBase64 = e.target.result; if (logoPreview) { logoPreview.src = currentLogoBase64; logoPreview.style.display = 'block'; } };
            reader.readAsDataURL(file);
        }
        generateQRCodePreview(false, currentTool);
    });

    // === DOWNLOAD & SAVE LOGIC (is mein koi tabdeeli nahi) ===
    let downloadExtension = 'png';
    function openDownloadModal(extension) {
        const dataForDownload = getQrDataStringForInstance(true, currentTool);
        if (dataForDownload === null) { alert("Please fill required fields before downloading."); return; }
        downloadExtension = extension;
        if(downloadModalOverlay) downloadModalOverlay.classList.remove('hidden');
    }
    function closeDownloadModal() { if(downloadModalOverlay) downloadModalOverlay.classList.add('hidden'); }
    if (downloadSvgButton) downloadSvgButton.addEventListener('click', () => openDownloadModal('svg'));
    if (downloadPngButton) downloadPngButton.addEventListener('click', () => openDownloadModal('png'));
    if (closeDownloadModalButton) closeDownloadModalButton.addEventListener('click', closeDownloadModal);
    if (downloadModalOverlay) downloadModalOverlay.addEventListener('click', (event) => { if(event.target === downloadModalOverlay) closeDownloadModal(); });

    if (qualityButtons) qualityButtons.forEach(button => button.addEventListener('click', () => {
        const quality = button.dataset.quality;
        const size = parseInt(button.dataset.size, 10);
        if (quality === 'hd' && !auth.currentUser) {
            closeDownloadModal();
            alert("Please log in to download in HD quality.");
            loginModalOverlay.classList.remove('hidden');
            return;
        }
        closeDownloadModal();
        initiateDownload(size, downloadExtension);
    }));

    function initiateDownload(size, extension) {
        const dataForDownload = getQrDataStringForInstance(true, currentTool);
        if (dataForDownload === null) return;
        if (size === 1024) alert(`Downloading HD ${extension.toUpperCase()} (${size}x${size}).`);
        const downloadInstance = new QRCodeStyling({
            width: size, height: size, type: 'svg', data: dataForDownload, image: currentLogoBase64 || '',
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
            qrOptions: { errorCorrectionLevel: 'H' }
        });
        downloadInstance.download({ name: `qodeo-qr${size === 1024 ? '-hd' : ''}`, extension: extension });
    }

    if (saveQrButton) saveQrButton.addEventListener('click', async () => {
        if (!auth.currentUser) { alert("Please log in to save your QR Code."); loginModalOverlay.classList.remove('hidden'); return; }
        const dataToSave = getQrDataStringForInstance(true, currentTool);
        if (dataToSave === null) { alert("Please ensure all required fields are filled correctly before saving."); return; }
        saveQrButton.disabled = true;
        saveQrButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        const qrRecord = {
            userId: auth.currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            type: dynamicQrCheckbox.checked ? 'dynamic' : 'static',
            qrDataType: currentTool, targetData: dataToSave, scanCount: 0,
            customization: { dotColor: dotColorInput.value, backgroundColor: backgroundColorInput.value, dotStyle: dotStyleSelect.value, logo: currentLogoBase64 }
        };
        try {
            await db.collection("qrcodes").add(qrRecord);
            saveQrButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => { saveQrButton.disabled = false; saveQrButton.innerHTML = '<i class="fas fa-cloud-arrow-up"></i><span>Save</span>'; }, 2000);
        } catch (error) {
            console.error("Error saving QR Code: ", error);
            alert("Could not save QR Code. Please try again.");
            saveQrButton.disabled = false;
            saveQrButton.innerHTML = '<i class="fas fa-cloud-arrow-up"></i><span>Save</span>';
        }
    });

    // === HELPER FUNCTIONS ===
    function handlePdfUpload() {
        const file = pdfUploadInput.files[0];
        if (!file) { alert('Please select a PDF file.'); return; }
        generateQrMainButton.disabled = true;
        generateQrMainButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Uploading...';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', `qodeo/${auth.currentUser.uid}`);
        pdfUploadProgress.style.display = 'block';
        const progressDiv = pdfUploadProgress.querySelector('.progress');
        progressDiv.style.width = '50%';
        fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(async (data) => {
            if (data.secure_url) {
                progressDiv.style.width = '100%';
                generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generating QR...';
                await finalizeQrGeneration(data.secure_url);
                saveProQrToFirestore('pdf', data.secure_url, data.public_id);
            } else { throw new Error(data.error.message || 'Upload failed'); }
        })
        .catch(error => { alert("PDF upload failed: " + error.message); resetGenerateButton(); });
    }
    
    async function saveProQrToFirestore(toolType, url, publicId) {
        if (!auth.currentUser) return;
        const qrRecord = {
            userId: auth.currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'pro', qrDataType: toolType, targetData: url,
            cloudinaryPublicId: publicId, scanCount: 0,
            customization: { dotColor: dotColorInput.value, backgroundColor: backgroundColorInput.value, dotStyle: dotStyleSelect.value, logo: currentLogoBase64 }
        };
        try {
            await db.collection("qrcodes").add(qrRecord);
            console.log("Pro QR saved to Firestore");
        } catch (error) { console.error("Error saving Pro QR to Firestore: ", error); }
    }

    async function generateQRCodePreview(shouldValidate, tool) {
        const dataForQr = getQrDataStringForInstance(shouldValidate, tool);
        if (dataForQr) await finalizeQrGeneration(dataForQr);
    }
    
    async function finalizeQrGeneration(dataForQr) {
        // ===== TABDEELI #1: SOUND PLAY KARNE KA CODE YAHAN SE HATA DIYA GAYA HAI =====
        if (qrCanvasContainer) { qrCanvasContainer.innerHTML = ''; qrCanvasContainer.classList.add('generating'); }
        
        await qrCodeInstance.update({
            data: dataForQr,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
        });

        if (qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);
        if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.length > 70 ? dataForQr.substring(0, 67) + "..." : dataForQr;
        
        setTimeout(() => {
            if (qrCanvasContainer) qrCanvasContainer.classList.remove('generating');
            resetGenerateButton();
        }, 1500);
    }

    function resetGenerateButton() {
        generateQrMainButton.disabled = false;
        generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
        if (pdfUploadProgress) {
            setTimeout(() => {
                pdfUploadProgress.style.display = 'none';
                pdfUploadProgress.querySelector('.progress').style.width = '0%';
            }, 2000);
        }
    }

    function getQrDataStringForInstance(validate = false, tool = currentTool) {
        let dataString = "";
        const showAlert = (message) => { if (validate) alert(message); return null; };
        
        // Dynamic QR logic ko data string mein daalna
        const isDynamic = dynamicQrCheckbox.checked && auth.currentUser;

        switch (tool) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email': const to = qrEmailToInput.value; if (!to && validate) { return showAlert("Please enter 'To Email Address'."); } dataString = `mailto:${encodeURIComponent(to)}`; if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`; if (qrEmailBodyInput.value) dataString += `${dataString.includes('?') ? '&' : '?'}body=${encodeURIComponent(qrEmailBodyInput.value)}`; break;
            case 'phone': const phoneNum = qrPhoneNumberInput.value; if (!phoneNum && validate) { return showAlert("Please enter a Phone Number."); } dataString = `tel:${phoneNum}`; break;
            // ... (baqi cases bhi isi tarah aayenge)
            default: dataString = "https://qodeo.pro";
        }
        
        // Agar dynamic hai, to humein ek alag URL banana hoga jo hamare server se guzre
        // Filhal, isko simple rakhte hain, asal dynamic functionality ke liye backend logic chahiye hoga.
        // Abhi ke liye, dynamic/static ka farq sirf save karte waqt hoga.
        
        return dataString;
    }
});