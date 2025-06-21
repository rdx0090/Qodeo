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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
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
        updateQRCodePreview();
    });

    // PART 2: QR CODE SCRIPT
    // ... (Saare const declarations) ...
    const generateQrMainButton = document.getElementById('generateQrMainButton');
    
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
        // ... (switchTool logic to show/hide inputs and update title) ...
        updateQRCodePreview();
    }
    
    // === MASTER UPDATE FUNCTION ===
    async function updateQRCodePreview(isAction = false) {
        // isAction is true ONLY when 'Generate' button is clicked
        const isDynamic = document.getElementById('makeQrDynamic').checked && currentTool === 'url';
        
        if (isDynamic && !auth.currentUser && isAction) {
            alert("Please log in to use the Dynamic QR feature.");
            return;
        }

        let dataForQr = getQrDataStringForInstance(isAction);
        if (dataForQr === null) { // Validation failed
             if(isAction) resetGenerateButton();
             return;
        }

        if (isAction) {
            if (generateQrMainButton) {
                generateQrMainButton.disabled = true;
                generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            }
        }
        
        await finalizeQrGeneration(dataForQr, isAction);
    }
    
    async function finalizeQrGeneration(dataForQr, withAnimationAndSound = false) {
        if (withAnimationAndSound) {
            if (document.getElementById('qrSound')) document.getElementById('qrSound').play().catch(e => {});
            if (document.getElementById('qrCanvasContainer')) {
                 document.getElementById('qrCanvasContainer').innerHTML = '';
                 document.getElementById('qrCanvasContainer').classList.add('generating');
            }
        }
        
        qrCodeInstance.update({ data: dataForQr, /*... options ...*/ });
        
        if (withAnimationAndSound || !document.getElementById('qrCanvasContainer').querySelector('svg')) {
           if (document.getElementById('qrCanvasContainer')) {
               if(!withAnimationAndSound) document.getElementById('qrCanvasContainer').innerHTML = '';
               qrCodeInstance.append(document.getElementById('qrCanvasContainer'));
           }
        }
        
        if (document.getElementById('qrDataDisplay')) document.getElementById('qrDataDisplay').textContent = dataForQr;

        if (withAnimationAndSound) {
            setTimeout(() => {
                if (document.getElementById('qrCanvasContainer')) document.getElementById('qrCanvasContainer').classList.remove('generating');
                resetGenerateButton();
            }, 1500);
        } else {
             if(generateQrMainButton) generateQrMainButton.disabled = false;
        }
    }
    
    function getQrDataStringForInstance(validate = false) {
        // ... (This function now only returns the string, no side-effects) ...
    }

    function resetGenerateButton() {
        const btn = document.getElementById('generateQrMainButton');
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
        }
    }
    
    // === EVENT LISTENERS ===
    document.querySelectorAll('.qr-type-button').forEach(button => button.addEventListener('click', () => switchTool(button.dataset.type)));
    
    // The ONLY place that triggers sound/animation
    if(generateQrMainButton) generateQrMainButton.addEventListener('click', () => {
        if(currentTool === 'pdf') {
            // Handle PDF separately
        } else {
            updateQRCodePreview(true); // TRUE means it's a main action
        }
    });

    // All other listeners for live preview (no sound/animation)
    document.querySelectorAll('.qr-input-group input, .qr-input-group select, .qr-input-group textarea').forEach(input => {
        input.addEventListener('input', () => updateQRCodePreview(false));
    });
     document.querySelectorAll('#dotColor, #backgroundColor, #dotStyle, #logoUpload, #makeQrDynamic').forEach(input => {
        if(input) input.addEventListener('change', () => updateQRCodePreview(false));
    });
    
    // ... (Save and Download logic will use getQrDataStringForInstance(true) for validation) ...
});