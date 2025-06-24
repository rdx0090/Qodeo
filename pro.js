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
    const storage = firebase.storage(); // Firebase Storage ko bhi initialize karein
    const CLOUD_NAME = 'drork8wvy'; // Aapka Cloudinary Name
    const UPLOAD_PRESET = 'qodeo_uploads'; // Aapka Cloudinary Preset

    // ==============================================================
    // === PAGE ELEMENT SELECTORS                                 ===
    // ==============================================================
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    const proFeatureCards = document.querySelectorAll('.pro-feature-card');
    const qrSound = document.getElementById('qrSound');

    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const githubLoginButton = document.getElementById('github-login-button');

    const proGeneratorSection = document.getElementById('pro-generator-section');
    const proPreviewSection = document.getElementById('pro-preview-section');
    const inputTitle = document.getElementById('inputAreaTitle');
    const generateButton = document.getElementById('generateQrMainButton');
    const saveQrButton = document.getElementById('saveQrButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay');

    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    let currentLogoBase64 = null;

    // Tool Specific Inputs
    const pdfUploadInput = document.getElementById('pdfUpload');
    const pdfUploadLabel = document.querySelector('label[for="pdfUpload"]');
    const pdfFileName = document.getElementById('pdfFileName');
    const pdfUploadProgress = document.getElementById('pdfUploadProgress');

    const galleryUploadInput = document.getElementById('galleryUpload');
    const galleryUploadLabel = document.querySelector('label[for="galleryUpload"]');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    // === VCARD PLUS (DIGITAL BUSINESS CARD) KE NAYE SELECTORS ===
    const vcardProfileUpload = document.getElementById('vcardProfileUpload');
    const vcardCoverUpload = document.getElementById('vcardCoverUpload');
    const vcardProfilePreview = document.getElementById('vcardProfilePreview');
    const vcardCoverPreview = document.getElementById('vcardCoverPreview');
    // =============================================================

    // ==============================================================
    // === AUTHENTICATION LOGIC (Koi Tabdeeli Nahi)               ===
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
            if(proGeneratorSection) proGeneratorSection.style.display = 'none';
            if(proPreviewSection) proPreviewSection.style.display = 'none';
        }
    });

    // ==============================================================
    // === PRO QR GENERATOR LOGIC                                 ===
    // ==============================================================
    let currentTool = null;

    const qrCodeInstance = new QRCodeStyling({
        width: 250, height: 250, type: 'svg',
        data: "https://qodeo.app", // Aapki Website ka link
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: 'anonymous', margin: 10 }
    });
    if(qrCanvasContainer) qrCodeInstance.append(qrCanvasContainer);

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
        proPreviewSection.style.display = 'flex';

        const toolIconElement = document.getElementById('toolIcon');
        const toolTitleElement = document.getElementById('inputAreaTitle');
        const titleWrapper = document.querySelector('.pro-tool-title-wrapper');

        document.querySelectorAll('.qr-input-group').forEach(group => group.style.display = 'none');

        const activeGroup = document.getElementById(tool + 'Inputs');
        if (activeGroup) {
            activeGroup.style.display = 'flex';

            // === NAYE TOOL KI INFO ADD KI GAYI HAI ===
            const toolInfo = {
                'pdf': { icon: 'fa-file-pdf', title: 'Upload a PDF File' },
                'app_store': { icon: 'fab fa-google-play', title: 'Create an App Store QR' },
                'audio': { icon: 'fa-music', title: 'Create an Audio QR' },
                'image_gallery': { icon: 'fa-images', title: 'Create an Image Gallery' },
                'vcard_plus': { icon: 'fa-id-card-alt', title: 'Create Your Digital Business Card' }
            };
            // ==========================================

            if (toolInfo[tool]) {
                toolIconElement.className = `fas ${toolInfo[tool].icon}`;
                toolTitleElement.textContent = toolInfo[tool].title;
                const cardIcon = document.querySelector(`.pro-feature-card[data-tool="${tool}"] i`);
                if(cardIcon) toolIconElement.style.color = cardIcon.style.color;
            }

            titleWrapper.classList.remove('animate-title');
            setTimeout(() => { titleWrapper.classList.add('animate-title'); }, 10);

            proGeneratorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    if (generateButton) {
        generateButton.addEventListener('click', () => {
            if (qrSound) { qrSound.currentTime = 0; qrSound.play().catch(e => {}); }

            // === NAYE TOOL KA HANDLER ADD KIYA GAYA HAI ===
            if (currentTool === 'app_store') { handleAppStoreQR(); } 
            else if (currentTool === 'pdf') { handlePdfUpload(); } 
            else if (currentTool === 'audio') { handleAudioQR(); } 
            else if (currentTool === 'image_gallery') { handleImageGalleryQR(); }
            else if (currentTool === 'vcard_plus') { handleVCardPlusQR(); } // Naya Handler
            // ===============================================
        });
    }

    // ==============================================================
    // === TOOL-SPECIFIC FUNCTIONS (NAYA FEATURE ADDED)           ===
    // ==============================================================

    function handleAppStoreQR() { /* ... (Koi Tabdeeli Nahi) ... */ }
    function handleAudioQR() { /* ... (Koi Tabdeeli Nahi) ... */ }
    function handlePdfUpload() { /* ... (Koi Tabdeeli Nahi) ... */ }
    function handleImageGalleryQR() { /* ... (Koi Tabdeeli Nahi) ... */ }


    // === NAYA FUNCTION: DIGITAL BUSINESS CARD KE LIYE ===
    async function handleVCardPlusQR() {
        const name = document.getElementById('vcardName').value.trim();
        const headline = document.getElementById('vcardHeadline').value.trim();
        if (!name || !headline) {
            alert("Please fill in your Name and Headline.");
            return;
        }

        const profileFile = vcardProfileUpload.files[0];
        const coverFile = vcardCoverUpload.files[0];

        if (!profileFile) {
            alert("Profile Picture is required.");
            return;
        }

        generateButton.disabled = true;
        generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';

        try {
            // Step 1: Images upload karein
            const uploadPromises = [];
            uploadPromises.push(uploadImageToCloudinary(profileFile, 'profile_pictures'));
            if (coverFile) {
                uploadPromises.push(uploadImageToCloudinary(coverFile, 'cover_photos'));
            }

            generateButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Uploading Images...';
            const uploadResults = await Promise.all(uploadPromises);

            const profilePicUrl = uploadResults[0].secure_url;
            const coverPicUrl = coverFile ? uploadResults[1].secure_url : null;

            // Step 2: Form ka sara data इकट्ठा karein
            const cardData = {
                userId: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                name: name,
                headline: headline,
                bio: document.getElementById('vcardBio').value.trim(),
                phone: document.getElementById('vcardPhone').value.trim(),
                email: document.getElementById('vcardEmail').value.trim(),
                website: document.getElementById('vcardWebsite').value.trim(),
                profilePicUrl: profilePicUrl,
                coverPicUrl: coverPicUrl,
                socialLinks: {
                    linkedin: document.getElementById('vcardLinkedin').value.trim(),
                    github: document.getElementById('vcardGithub').value.trim(),
                    instagram: document.getElementById('vcardInstagram').value.trim(),
                    twitter: document.getElementById('vcardTwitter').value.trim(),
                    facebook: document.getElementById('vcardFacebook').value.trim(),
                }
            };

            // Step 3: Data ko Firestore mein save karein
            generateButton.innerHTML = '<i class="fas fa-save"></i> Saving Card...';
            const docRef = await db.collection("business_cards").add(cardData);

            // Step 4: QR Code ke liye final URL banayein
            const cardUrl = `https://qodeo.vercel.app/card.html?id=${docRef.id}`;
            finalizeQrGeneration(cardUrl);
            alert("Digital Business Card created successfully!");

        } catch (error) {
            console.error("Error creating Digital Business Card: ", error);
            alert("An error occurred. Please try again. " + error.message);
            resetGenerateButton();
        }
    }

    // Helper function to upload image to Cloudinary
    function uploadImageToCloudinary(file, folderName) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', `qodeo/${auth.currentUser.uid}/${folderName}`);

        return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Image upload failed: ${response.statusText}`);
            }
            return response.json();
        });
    }
    // ==============================================================

    // === Event Listeners for File Inputs ===
    if (pdfUploadLabel) pdfUploadLabel.addEventListener('click', () => pdfUploadInput.click());
    if (galleryUploadLabel) galleryUploadLabel.addEventListener('click', () => galleryUploadInput.click());

    if (galleryUploadInput && imagePreviewContainer) { /* ... (Koi Tabdeeli Nahi) ... */ }

    // === NAYE EVENT LISTENERS: VCARD IMAGE PREVIEW KE LIYE ===
    if(vcardProfileUpload) vcardProfileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file && vcardProfilePreview) {
            const reader = new FileReader();
            reader.onload = (event) => { vcardProfilePreview.src = event.target.result; vcardProfilePreview.style.display = 'block'; };
            reader.readAsDataURL(file);
        }
    });

    if(vcardCoverUpload) vcardCoverUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file && vcardCoverPreview) {
            const reader = new FileReader();
            reader.onload = (event) => { vcardCoverPreview.src = event.target.result; vcardCoverPreview.style.display = 'block'; };
            reader.readAsDataURL(file);
        }
    });
    // ========================================================


    // === QR Generation, Customization & Save Functions ===
    function finalizeQrGeneration(dataForQr) {
        qrCodeInstance.update({ 
            data: dataForQr,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
        });
        if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.substring(0, 70) + (dataForQr.length > 70 ? "..." : "");
        resetGenerateButton();
    }

    function resetGenerateButton() {
        generateButton.disabled = false;
        generateButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate Pro QR';
        // ... (progress bar reset logic yahan add karein agar zaroorat ho) ...
    }

    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if(input) input.addEventListener('change', () => qrCodeInstance.update({ 
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value }
        }));
    });

    if (logoUploadInput) { /* ... (Koi Tabdeeli Nahi) ... */ }

    if (saveQrButton) { /* ... (Yahan tabdeeli ki zaroorat par sakti hai vcard ke liye, فی الحال wese hi rakhein) ... */ }
    
    async function saveProQrToFirestore(toolType, url, publicId) { /* ... (Koi Tabdeeli Nahi) ... */ }
});