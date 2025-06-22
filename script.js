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
            }
        }
    });

    // =================================================================
    // PART 2: QR CODE SCRIPT (Aapka original code yahan hai)
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
    // ... baqi vCard aur doosre inputs
    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');
    const downloadModalOverlay = document.getElementById('download-modal-overlay');
    const closeDownloadModalButton = document.getElementById('close-download-modal-button');
    const qualityButtons = document.querySelectorAll('.quality-btn');

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

    if (dynamicQrCheckbox) {
        dynamicQrCheckbox.addEventListener('change', (event) => {
            if (event.target.checked && !auth.currentUser) {
                event.target.checked = false;
                alert("Please log in to create a Dynamic QR Code.");
                if (loginModalOverlay) { loginModalOverlay.classList.remove('hidden'); }
            } else {
                generateQRCodePreview(false, currentTool);
            }
        });
    }
    
    // ... baqi event listeners ...

    if (generateQrMainButton) generateQrMainButton.addEventListener('click', () => {
        if (qrSound) { qrSound.currentTime = 0; qrSound.play().catch(e => {}); }
        generateQRCodePreview(true, currentTool);
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

    // === DOWNLOAD & SAVE LOGIC ===
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
        // ... (initiateDownload ka poora code jaisa pehle tha)
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
        // ... (saveQrButton ka poora logic jaisa pehle tha)
        if (!auth.currentUser) {
            alert("Please log in to save your QR Code.");
            loginModalOverlay.classList.remove('hidden');
            return;
        }
        const isDynamic = dynamicQrCheckbox.checked;
        const originalData = getQrDataStringForInstance(true, currentTool);
        if (originalData === null) {
            alert("Please ensure all required fields are filled correctly before saving.");
            return;
        }
        saveQrButton.disabled = true;
        saveQrButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        try {
            if (isDynamic) {
                const shortId = generateShortId();
                const dynamicLinkRef = db.collection('links').doc(shortId);
                await dynamicLinkRef.set({
                    userId: auth.currentUser.uid,
                    originalUrl: originalData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    scanCount: 0,
                    customization: { dotColor: dotColorInput.value, backgroundColor: backgroundColorInput.value, dotStyle: dotStyleSelect.value, logo: currentLogoBase64 }
                });
                const dynamicUrl = `https://qodeo.vercel.app/api/redirect?slug=${shortId}`; // **NOTE: Yeh URL abhi Vercel par nahi chalega, lekin hum isko future ke liye save kar rahe hain**
                await finalizeQrGeneration(dynamicUrl);
                alert(`Dynamic QR Code Created successfully!`);
            } else {
                const staticQrRecord = {
                    userId: auth.currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    type: 'static',
                    qrDataType: currentTool,
                    targetData: originalData,
                    customization: { dotColor: dotColorInput.value, backgroundColor: backgroundColorInput.value, dotStyle: dotStyleSelect.value, logo: currentLogoBase64 }
                };
                await db.collection("static_qrcodes").add(staticQrRecord);
                alert('Static QR Code saved successfully!');
            }
            saveQrButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        } catch (error) {
            console.error("Error saving QR Code: ", error);
            alert("Could not save QR Code. Please try again.");
        } finally {
            setTimeout(() => {
                saveQrButton.disabled = false;
                saveQrButton.innerHTML = '<i class="fas fa-cloud-arrow-up"></i><span>Save</span>';
            }, 2000);
        }
    });

    // === HELPER FUNCTIONS ===
    function generateShortId(length = 7) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    async function generateQRCodePreview(shouldValidate, tool) {
        const dataForQr = getQrDataStringForInstance(shouldValidate, tool);
        if (dataForQr) await finalizeQrGeneration(dataForQr);
    }
    
    async function finalizeQrGeneration(dataForQr) {
        // ... (finalizeQrGeneration ka poora code jaisa pehle tha)
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
        }, 1500);
    }

    function getQrDataStringForInstance(validate = false, tool = currentTool) {
        // ... (getQrDataStringForInstance ka poora code jaisa pehle tha)
        let dataString = "";
        const showAlert = (message) => { if (validate) alert(message); return null; };
        switch (tool) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email': const to = qrEmailToInput.value; if (!to && validate) { return showAlert("Please enter 'To Email Address'."); } dataString = `mailto:${encodeURIComponent(to)}`; if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`; if (qrEmailBodyInput.value) dataString += `${dataString.includes('?') ? '&' : '?'}body=${encodeURIComponent(qrEmailBodyInput.value)}`; break;
            case 'phone': const phoneNum = qrPhoneNumberInput.value; if (!phoneNum && validate) { return showAlert("Please enter a Phone Number."); } dataString = `tel:${phoneNum}`; break;
            default: dataString = "https://qodeo.pro";
        }
        return dataString;
    }

    // =========================================================================
    // === NAYA VISITOR COUNTER KA LOGIC (FIRECRACKER EFFECT KE SAATH)         ===
    // =========================================================================
    const visitorCountElement = document.getElementById('visitor-count');
    
    if (visitorCountElement) {
        const visitorRef = db.collection('stats').doc('visitors');

        function launchConfetti() {
            // Check karein ke confetti library loaded hai ya nahi
            if (typeof confetti === 'undefined') {
                console.log("Confetti library not loaded.");
                return;
            }
            const duration = 2 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }

        function animateCount(element, finalCount) {
            let currentCount = 0;
            const duration = 1500;
            const stepTime = Math.max(1, Math.floor(duration / (finalCount || 1)));
            
            const timer = setInterval(() => {
                currentCount++;
                element.textContent = currentCount.toLocaleString();
                if (currentCount >= finalCount) {
                    clearInterval(timer);
                    element.textContent = finalCount.toLocaleString();
                }
            }, stepTime);
        }

        const increment = firebase.firestore.FieldValue.increment(1);

        if (!sessionStorage.getItem('hasVisited')) {
            visitorRef.set({ total: increment }, { merge: true })
                .then(() => visitorRef.get())
                .then(doc => {
                    if (doc.exists) {
                        const totalVisitors = doc.data().total;
                        animateCount(visitorCountElement, totalVisitors);
                        launchConfetti(); 
                    }
                    sessionStorage.setItem('hasVisited', 'true');
                })
                .catch(error => console.error("Could not update visitor count:", error));
        } else {
            visitorRef.get().then(doc => {
                if (doc.exists) {
                    visitorCountElement.textContent = doc.data().total.toLocaleString();
                }
            });
        }
    }
});