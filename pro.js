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
        data: "https://qodeo.pro",
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
            
            const toolInfo = {
                'pdf': { icon: 'fa-file-pdf', title: 'Upload a PDF File' },
                'app_store': { icon: 'fab fa-google-play', title: 'Create an App Store QR' },
                'audio': { icon: 'fa-music', title: 'Create an Audio QR' },
                'image_gallery': { icon: 'fa-images', title: 'Create an Image Gallery' }
            };

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

            if (currentTool === 'app_store') { handleAppStoreQR(); } 
            else if (currentTool === 'pdf') { handlePdfUpload(); } 
            else if (currentTool === 'audio') { handleAudioQR(); } 
            else if (currentTool === 'image_gallery') { handleImageGalleryQR(); }
        });
    }

    // === Tool-Specific Functions ===

    function handleAppStoreQR() {
        const appleUrl = document.getElementById('apple-store-url').value;
        const googleUrl = document.getElementById('google-store-url').value;
        if (!appleUrl || !googleUrl) { alert("Please provide both Apple and Google store links."); return; }
        const finalQrData = `https://onelink.to/qodeo?af_ios_url=${encodeURIComponent(appleUrl)}&af_android_url=${encodeURIComponent(googleUrl)}`;
        finalizeQrGeneration(finalQrData);
    }

    function handleAudioQR() {
        const audioUrl = document.getElementById('audio-url').value;
        if (!audioUrl) { alert("Please provide a valid audio file URL."); return; }
        try { new URL(audioUrl); } catch (_) { alert("The URL format is invalid."); return; }
        finalizeQrGeneration(audioUrl);
    }
    
    function handlePdfUpload() {
        // ... (PDF upload ka logic jesa pehle tha)
    }

    function handleImageGalleryQR() {
        const files = galleryUploadInput.files;
        if (files.length === 0) { alert("Please select at least one image."); return; }
        if (files.length > 10) { alert("You can upload a maximum of 10 images."); return; }

        generateButton.disabled = true;
        generateButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Uploading 0%...';

        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', `qodeo/${auth.currentUser.uid}/galleries`);
            
            return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST', body: formData
            }).then(response => response.json());
        });

        let uploadedCount = 0;
        uploadPromises.forEach(p => p.then(() => {
            uploadedCount++;
            const percentage = Math.round((uploadedCount / files.length) * 100);
            generateButton.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> Uploading ${percentage}%...`;
        }));
        
        Promise.all(uploadPromises)
            .then(results => {
                const imageUrls = results.map(result => result.secure_url ? encodeURIComponent(result.secure_url) : null).filter(Boolean);
                if (imageUrls.length !== files.length) { throw new Error("Some images failed to upload."); }
                
                const galleryBaseUrl = 'https://qodeo.vercel.app/gallery.html'; // **APNA DOMAIN YAHAN DAALEIN**
                const finalQrData = `${galleryBaseUrl}?images=${imageUrls.join(',')}`;

                generateButton.innerHTML = '<i class="fas fa-qrcode"></i> Generating QR...';
                finalizeQrGeneration(finalQrData);
            })
            .catch(error => {
                alert("Error uploading images: " + error.message);
                resetGenerateButton();
            });
    }

    // === Event Listeners for File Inputs ===
    if (pdfUploadLabel) pdfUploadLabel.addEventListener('click', () => pdfUploadInput.click());
    if (galleryUploadLabel) galleryUploadLabel.addEventListener('click', () => galleryUploadInput.click());
    
    if (galleryUploadInput && imagePreviewContainer) {
        galleryUploadInput.addEventListener('change', () => {
            imagePreviewContainer.innerHTML = ''; // Purana preview saaf karein
            if(galleryUploadInput.files.length > 10) {
                alert("You can only select up to 10 images.");
                galleryUploadInput.value = ""; // Selection clear karein
                return;
            }
            Array.from(galleryUploadInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '70px';
                    img.style.height = '70px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '5px';
                    imagePreviewContainer.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
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
        // ... progress bar reset logic ...
    }

    // ... (baqi customization aur save ke functions jese pehle thay) ...
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
            if (!qrData || qrData === "https://qodeo.pro") { alert("Please generate a QR code first before saving."); return; }
            let publicId = null;
            if (currentTool === 'pdf') {
                // PDF URL se public ID nikalne ka logic
                try {
                    publicId = qrData.split('/qodeo/')[1].split('.')[0];
                } catch(e) { console.log("Could not parse public ID for PDF."); }
            }
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
            customization: { dotColor: dotColorInput.value, backgroundColor: backgroundColorInput.value, dotStyle: dotStyleSelect.value, logo: currentLogoBase64 }
        };

        try {
            await db.collection("pro_qrcodes").add(qrRecord);
            alert('Pro QR Code saved successfully!');
            saveQrButton.querySelector('span').textContent = 'Saved!';
        } catch (error) {
            console.error("Error saving Pro QR: ", error);
            alert('Could not save the QR Code.');
        } finally {
            setTimeout(() => {
                saveQrButton.disabled = false;
                saveQrButton.querySelector('span').textContent = 'Save';
            }, 2000);
        }
    }
});