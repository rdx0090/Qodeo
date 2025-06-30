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
            }
        }
    });

    // PART 2: QR CODE SCRIPT
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

    qrTypeButtons.forEach(button => button.addEventListener('click', () => switchTool(button.dataset.type)));

    if (dynamicQrCheckbox) {
        dynamicQrCheckbox.addEventListener('change', (event) => {
            if (event.target.checked && !auth.currentUser) {
                event.target.checked = false;
                alert("Please log in to create a Dynamic QR Code.");
                if (loginModalOverlay) {
                    loginModalOverlay.classList.remove('hidden');
                }
            } else {
                generateQRCodePreview(false, currentTool);
            }
        });
    }

    if (generateQrMainButton) generateQrMainButton.addEventListener('click', () => {
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
        const downloadInstance = new QRCodeStyling({
            width: size, height: size, type: extension, data: dataForDownload, image: currentLogoBase64 || '',
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
            qrOptions: { errorCorrectionLevel: 'H' }
        });
        downloadInstance.download({ name: `qodeo-qr-${size}`, extension: extension });
    }

    if (saveQrButton) saveQrButton.addEventListener('click', async () => { /* ... Save logic ... */ });
    async function generateQRCodePreview(shouldValidate, tool) { const dataForQr = getQrDataStringForInstance(shouldValidate, tool); if (dataForQr) await finalizeQrGeneration(dataForQr); }
    async function finalizeQrGeneration(dataForQr) { /* ... Finalize logic ... */ }
    function getQrDataStringForInstance(validate = false, tool = currentTool) { /* ... Get data logic ... */ }
});

// === NAYA VISITOR COUNTER KA LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
        const visitorRef = db.collection('stats').doc('visitors');
        const increment = firebase.firestore.FieldValue.increment(1);
        if (!sessionStorage.getItem('hasVisited')) {
            visitorRef.set({ total: increment }, { merge: true })
                .then(() => { sessionStorage.setItem('hasVisited', 'true'); });
        }
        visitorRef.onSnapshot(doc => {
            if (doc.exists) {
                visitorCountElement.textContent = doc.data().total.toLocaleString();
            }
        });
    }
});

// === INTERACTIVE EFFECTS ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Aurora background effect
    document.body.addEventListener('mousemove', (event) => {
        const { clientX, clientY } = event;
        window.requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--mouse-x', `${clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${clientY}px`);
        });
    });

    // 2. Magnetic spotlight for QR type buttons
    const grid = document.querySelector('.qr-type-selector-grid');
    if (grid) {
        grid.addEventListener('mousemove', e => {
            const buttons = grid.querySelectorAll('.qr-type-button');
            buttons.forEach(button => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                button.style.setProperty('--spotlight-x', `${x}px`);
                button.style.setProperty('--spotlight-y', `${y}px`);
            });
        });
    }
});