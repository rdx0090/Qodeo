// =========================================================
// === FIREBASE & CLOUDINARY SETUP                         ===
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
        generateQRCodePreview(false);
    });

    // PART 2: QR CODE SCRIPT
    // ... (Saare const declarations) ...
    const pdfUploadInput = document.getElementById('pdfUpload');
    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    
    let currentTool = 'url';
    const qrCodeInstance = new QRCodeStyling({ /* ... */ });
    if(qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);

    // === INITIALIZATION & ROUTING LOGIC ===
    const urlParams = new URLSearchParams(window.location.search);
    const toolFromUrl = urlParams.get('tool');
    if (toolFromUrl) {
        auth.onAuthStateChanged(user => {
            if (user) {
                switchTool(toolFromUrl);
            } else {
                alert("Please log in to use Pro features.");
                loginModalOverlay.classList.remove('hidden');
                switchTool('url');
            }
        });
    } else {
        switchTool('url');
    }

    function switchTool(selectedTool) {
        currentTool = selectedTool;
        document.querySelectorAll('.qr-input-group').forEach(group => group.classList.remove('active'));
        document.querySelectorAll('.qr-type-button').forEach(btn => btn.classList.remove('active'));
        const activeInputGroupDiv = document.getElementById(`${selectedTool}Inputs`);
        if (activeInputGroupDiv) activeInputGroupDiv.classList.add('active');
        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedTool}"]`);
        if (activeButton) activeButton.classList.add('active');
        
        const titleMap = {
            url: 'Enter your Website URL', text: 'Enter Plain Text', email: 'Enter Email Details',
            phone: 'Enter Phone Number', sms: 'Create an SMS', wifi: 'Setup Wi-Fi QR',
            vcard: 'Create a vCard', location: 'Enter Geolocation', event: 'Create a Calendar Event',
            pdf: 'Upload a PDF File (Pro)', app_store: 'Enter App Store Links (Pro)'
        };
        inputAreaTitle.textContent = titleMap[selectedTool] || 'Enter Data';
        generateQRCodePreview(false);
    }

    // === EVENT LISTENERS ===
    qrTypeButtons.forEach(button => button.addEventListener('click', () => switchTool(button.dataset.type)));
    
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', () => generateQRCodePreview(true));
    
    // ... (other event listeners)

    // === DOWNLOAD & SAVE LOGIC ===
    if (saveQrButton) saveQrButton.addEventListener('click', async () => {
        if (!auth.currentUser) { alert("Please log in to save your QR Code."); loginModalOverlay.classList.remove('hidden'); return; }
        
        const isDynamic = dynamicQrCheckbox.checked && currentTool === 'url';
        let dataToSave;
        let qrDataTypeForDb = currentTool;
        let typeForDb = 'static';
        
        if (isDynamic) {
            typeForDb = 'dynamic';
            dataToSave = qrDataUrlInput.value;
            if (!dataToSave) {
                alert("Please enter a URL to save as a Dynamic QR.");
                return;
            }
        } else if (currentTool === 'pdf') {
            typeForDb = 'pro';
            dataToSave = qrDataDisplay.textContent;
            if (!dataToSave.startsWith('http')) {
                 alert("Please generate the PDF QR first.");
                 return;
            }
        } else {
            dataToSave = getQrDataStringForInstance(true);
        }

        if (!dataToSave) { 
            // getQrDataStringForInstance returns null on validation failure
            return; 
        }
        
        saveQrButton.disabled = true;
        saveQrButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const qrRecord = {
            userId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            type: typeForDb,
            qrDataType: qrDataTypeForDb,
            targetData: dataToSave, // For dynamic, this is the destination. For static, it's the content.
            scanCount: 0,
            customization: { /* ... */ }
        };

        try {
            const docRef = await db.collection("qrcodes").add(qrRecord);
            
            if (isDynamic) {
                const dynamicUrl = `https://qodeo.vercel.app/qr/${docRef.id}`;
                await finalizeQrGeneration(dynamicUrl, false);
            }

            saveQrButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(resetSaveButton, 2000);
        } catch (error) {
            alert("Could not save QR Code.");
            resetSaveButton();
        }
    });
    
    // ... (other download logic)

    // === HELPER FUNCTIONS ===
    
    async function generateQRCodePreview(shouldValidate) {
        const isDynamic = dynamicQrCheckbox.checked && currentTool === 'url';
        let dataForQr;

        if (isDynamic) {
            if (!auth.currentUser && shouldValidate) {
                alert("Please log in to use the Dynamic QR feature.");
                dynamicQrCheckbox.checked = false;
                return;
            }
            // For preview, we show the actual URL so the user can test it.
            // The magic happens when they save it.
            dataForQr = qrDataUrlInput.value;
            if (!dataForQr && shouldValidate) {
                alert("Please enter a URL for the Dynamic QR.");
                return;
            }
        } else {
            // Normal static QR generation
            if (currentTool === 'pdf') {
                handlePdfUpload();
                return; // Stop here, handlePdfUpload will call finalizeQrGeneration
            }
            dataForQr = getQrDataStringForInstance(shouldValidate);
        }

        if (dataForQr) {
            await finalizeQrGeneration(dataForQr, shouldValidate);
        } else if (shouldValidate) {
            // This case handles when getQrDataStringForInstance returns null
            resetGenerateButton();
        }
    }
    
    // ... (finalizeQrGeneration, resetGenerateButton, getQrDataStringForInstance, and all other functions) ...
});