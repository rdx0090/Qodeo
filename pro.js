document.addEventListener('DOMContentLoaded', () => {

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
    // === PAGE ELEMENT SELECTORS                                 ===
    // ==============================================================
    // General Page Elements
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    const proFeatureCards = document.querySelectorAll('.pro-feature-card');
    const qrSound = document.getElementById('qrSound');

    // Header & Login Elements
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const githubLoginButton = document.getElementById('github-login-button');

    // Generator & Preview Sections
    const proGeneratorSection = document.getElementById('pro-generator-section');
    const proPreviewSection = document.getElementById('pro-preview-section');
    const inputTitle = document.getElementById('inputAreaTitle');
    const generateButton = document.getElementById('generateQrMainButton');
    const saveQrButton = document.getElementById('saveQrButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay');

    // Customization Inputs
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    let currentLogoBase64 = null;

    // Tool Specific Inputs
    const pdfUploadInput = document.getElementById('pdfUpload');
    const pdfUploadLabel = document.querySelector('.file-upload-label');
    const pdfFileName = document.getElementById('pdfFileName');
    const pdfUploadProgress = document.getElementById('pdfUploadProgress');

    // ==============================================================
    // === AUTHENTICATION LOGIC                                   ===
    // ==============================================================
    if(logoutButton) logoutButton.addEventListener('click', () => auth.signOut());
    if(closeModalButton) closeModalButton.addEventListener('click', () => loginModalOverlay.classList.add('hidden'));
    if(loginModalOverlay) loginModalOverlay.addEventListener('click', (event) => {
        if (event.target === loginModalOverlay) loginModalOverlay.classList.add('hidden');
    });
    const signInWithProvider = (provider) => auth.signInWithPopup(provider).catch(error => console.error("Authentication Error:", error));
    if(googleLoginButton) googleLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GoogleAuthProvider()));
    if(githubLoginButton) githubLoginButton.addEventListener('click', () => signInWithProvider(new firebase.auth.GithubAuthProvider()));

    auth.onAuthStateChanged(user => {
        if (user) {
            if(loginModalOverlay) loginModalOverlay.classList.add('hidden');
            if(loginButton) loginButton.style.display = 'none';
            if(userProfileDiv) {
                userProfileDiv.style.display = 'flex';
                userProfileDiv.classList.remove('hidden');
            }
            if(userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
        } else {
            if(loginButton) loginButton.style.display = 'block';
            if(userProfileDiv) {
                userProfileDiv.style.display = 'none';
                userProfileDiv.classList.add('hidden');
            }
            // Agar user logout ho jaye aur generator khula ho, to usay chupa do
            if(proGeneratorSection) proGeneratorSection.style.display = 'none';
            if(proPreviewSection) proPreviewSection.style.display = 'none';
        }
    });

    // ==============================================================
    // === PRO QR GENERATOR LOGIC                                 ===
    // ==============================================================
    let currentTool = null;

    // QR Code Instance Setup
    const qrCodeInstance = new QRCodeStyling({
        width: 250, height: 250, type: 'svg',
        data: "https://qodeo.pro",
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: 'anonymous', margin: 10 }
    });
    if(qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);

    // Jab kisi Pro Feature Card par click ho
    proFeatureCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            if (auth.currentUser) {
                currentTool = card.dataset.tool;
                showGeneratorFor(currentTool);
            } else {
                loginModalOverlay.classList.remove('hidden');
            }
        });
    });

    function showGeneratorFor(tool) {
        proGeneratorSection.style.display = 'block';
        proPreviewSection.style.display = 'flex'; // Use flex for proper alignment

        // Sab input groups ko chupa do
        document.querySelectorAll('.qr-input-group').forEach(group => group.style.display = 'none');
        
        // Sirf zaroori wala dikhao
        const activeGroup = document.getElementById(tool + 'Inputs');
        if (activeGroup) {
            activeGroup.style.display = 'flex';
            const toolName = tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            inputTitle.textContent = `Create a ${toolName} QR Code`;
            // Page ko generator tak scroll karo
            proGeneratorSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Main "Generate" button ka logic
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            if (qrSound) { qrSound.currentTime = 0; qrSound.play().catch(e => {}); }

            if (currentTool === 'app_store') {
                handleAppStoreQR();
            } else if (currentTool === 'pdf') {
                handlePdfUpload();
            }
            // Yahan baqi tools ke liye 'else if' aayega
        });
    }

    // === Tool-Specific Functions ===

    // App Store QR ke liye function
    function handleAppStoreQR() {
        const appleUrl = document.getElementById('apple-store-url').value;
        const googleUrl = document.getElementById('google-store-url').value;
        if (!appleUrl || !googleUrl) {
            alert("Please provide both Apple and Google store links.");
            return;
        }
        // onelink.to ka smart link
        const finalQrData = `https://onelink.to/qodeo?af_ios_url=${encodeURIComponent(appleUrl)}&af_android_url=${encodeURIComponent(googleUrl)}`;
        finalizeQrGeneration(finalQrData);
    }

    // PDF QR ke liye function
    function handlePdfUpload() {
        const file = pdfUploadInput.files[0];
        if (!file) { alert('Please select a PDF file.'); return; }
        generateButton.disabled = true;
        generateButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Uploading...';
        
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
                generateButton.innerHTML = '<i class="fas fa-qrcode"></i> Generating QR...';
                finalizeQrGeneration(data.secure_url);
            } else { throw new Error(data.error.message || 'Upload failed'); }
        })
        .catch(error => {
            alert("PDF upload failed: " + error.message);
            resetGenerateButton();
        });
    }
    
    // === QR Generation, Customization & Save Functions ===
    function finalizeQrGeneration(dataForQr) {
        qrCodeInstance.update({ 
            data: dataForQr,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
        });
        if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.substring(0, 70) + "...";
        resetGenerateButton();
    }
    
    function resetGenerateButton() {
        generateButton.disabled = false;
        generateButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate Pro QR';
        if (pdfUploadProgress) { /* ... progress bar reset logic ... */ }
    }

    // Customization inputs ke liye event listeners
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if(input) input.addEventListener('change', () => qrCodeInstance.update({ 
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value }
        }));
    });
    if (logoUploadInput) logoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) { currentLogoBase64 = null; if (logoPreview) logoPreview.style.display = 'none'; }
        else {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentLogoBase64 = e.target.result;
                qrCodeInstance.update({ image: currentLogoBase64 });
                if (logoPreview) { logoPreview.src = currentLogoBase64; logoPreview.style.display = 'block'; }
            };
            reader.readAsDataURL(file);
        }
    });

    if (saveQrButton) {
        saveQrButton.addEventListener('click', async () => {
            const qrData = qrCodeInstance._options.data;
            if (!qrData || qrData === "https://qodeo.pro") {
                alert("Please generate a QR code first before saving.");
                return;
            }
            const publicId = (currentTool === 'pdf') ? qrData.split('/').pop().split('.')[0] : null;
            await saveProQrToFirestore(currentTool, qrData, publicId);
        });
    }

    async function saveProQrToFirestore(toolType, url, publicId) {
        if (!auth.currentUser) return;
        saveQrButton.disabled = true;
        saveQrButton.querySelector('span').textContent = 'Saving...';
        
        const qrRecord = {
            userId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'pro',
            qrDataType: toolType,
            targetData: url,
            cloudinaryPublicId: publicId || null,
            scanCount: 0,
            customization: { 
                dotColor: dotColorInput.value, 
                backgroundColor: backgroundColorInput.value, 
                dotStyle: dotStyleSelect.value, 
                logo: currentLogoBase64 
            }
        };

        try {
            await db.collection("pro_qrcodes").add(qrRecord);
            alert('Pro QR Code saved successfully to your dashboard!');
            saveQrButton.querySelector('span').textContent = 'Saved!';
        } catch (error) {
            console.error("Error saving Pro QR to Firestore: ", error);
            alert('Could not save the QR Code.');
        } finally {
            setTimeout(() => {
                saveQrButton.disabled = false;
                saveQrButton.querySelector('span').textContent = 'Save';
            }, 2000);
        }
    }
});