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

    // PART 1: AUTHENTICATION (Working Perfectly)
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    // ... all other auth elements...

    // All Auth Event Listeners are here and are correct...

    auth.onAuthStateChanged(user => { /* All your logic here is correct */ });

    // =================================================================
    // PART 2: QR CODE SCRIPT (FINAL, POLISHED, CORRECTED VERSION)
    // =================================================================
    const dotColorInput = document.getElementById('dotColor');
    //... (all other const declarations for QR generator)
    const dynamicQrCheckbox = document.getElementById('makeQrDynamic');

    //... (Your qrCodeInstance initialization is here)
    const qrCodeInstance = new QRCodeStyling({ /* ... */ });
    
    // --- THIS FUNCTION GETS DATA, IT HAS ALERTS ---
    function getQrDataAndValidate() {
        // This is your full, original getQrDataStringForInstance() function
        let dataString = "";
        switch (currentQrType) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email': const to = qrEmailToInput.value; if (!to) { alert("Please enter 'To Email Address'."); return null; }
                        dataString = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(qrEmailSubjectInput.value || '')}&body=${encodeURIComponent(qrEmailBodyInput.value || '')}`; break;
            //... (ALL your other cases with `alert` are here)
        }
        return dataString;
    }

    // --- THIS FUNCTION UPDATES THE PREVIEW, WITH NO ALERTS ---
    async function updatePreview() {
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
        
        let dataForPreview;
        if(isDynamic) {
            dataForPreview = `https://qodeo.vercel.app/qr/preview`;
        } else {
            // Get data string WITHOUT validation for the live preview
            switch (currentQrType) {
                case 'url': dataForPreview = qrDataUrlInput.value || "https://qodeo.pro"; break;
                //... all other cases, but without any `alert`
                default: dataForPreview = "https://qodeo.pro";
            }
        }
        
        await qrCodeInstance.update({ 
            data: dataForPreview,
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
        });

        if (qrDataDisplay) qrDataDisplay.textContent = dataForPreview.length > 70 ? dataForPreview.substring(0, 67) + "..." : dataForPreview;
    }
    
    function switchQrType(selectedType) {
        // ... (your logic to show/hide dynamic toggle)
        // ... (your logic to switch active button and input groups)
        currentQrType = selectedType;
        if(inputAreaTitle) inputAreaTitle.textContent = `Enter details for ${selectedType.toUpperCase()} QR`;
        
        // This will now update the preview instantly and smoothly
        updatePreview();
    }
    
    // --- THE GENERATE BUTTON - THE GUARDIAN WITH THE LOCK ---
    async function handleGenerateClick() {
        const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
        const currentUser = auth.currentUser;
        
        // ** THE LOCK IS HERE **
        if (isDynamic && !currentUser) {
            alert("Please log in to generate a Dynamic QR Code.");
            loginModalOverlay.classList.remove('hidden');
            return;
        }

        // Now, we validate. This will show alerts if needed.
        const finalData = getQrDataAndValidate();
        if(finalData === null) {
            // If validation failed, just stop. The alert has been shown.
            return;
        }
        
        // If validation passed, just a final update to be safe
        updatePreview();
        console.log("Validation Passed! QR is ready to be saved or downloaded.");
    }
    
    // --- FINAL EVENT LISTENERS ---
    
    // QR Type buttons only switch the view
    if (qrTypeButtons) qrTypeButtons.forEach(button => button.addEventListener('click', () => switchQrType(button.dataset.type)));
    
    // The "Generate" button is ONLY for final validation and locking
    if (generateQrMainButton) generateQrMainButton.addEventListener('click', handleGenerateClick);
    
    // All real-time inputs just update the visual preview
    document.querySelectorAll('.qr-input-group input, .qr-input-group textarea, .qr-input-group select').forEach(input => {
        if(input.type !== 'file') input.addEventListener('input', updatePreview);
    });
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if(input) input.addEventListener('change', updatePreview);
    });
    
    // Other listeners remain the same
    if(logoUploadInput) { /* your listener that calls updatePreview() */ }
    if(downloadSvgButton) { /* your listener that calls getQrDataAndValidate() */ }
    if(downloadPngButton) { /* your listener that calls getQrDataAndValidate() */ }
    if(saveQrButton) { /* your listener that has its own logic and calls getQrDataAndValidate() */ }
    
    // Initial call
    if (qrTypeButtons.length > 0) switchQrType('url');
});