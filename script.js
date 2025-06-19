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

    // PART 1: AUTHENTICATION
    // (Aapka poora working authentication code)
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    // ... all other auth elements

    // Auth logic here... it is all working fine...

    auth.onAuthStateChanged(user => { /* Your auth state logic */ });
    
    // =================================================================
    // PART 2: QR CODE SCRIPT (With FINAL DYNAMIC QR LOGIC)
    // =================================================================
    // (Aapke saare QR generator ke const elements yahan hain)
    const dynamicQrCheckbox = document.getElementById('makeQrDynamic');
    
    // UPDATE a little bit in your switchQrType function
    function switchQrType(selectedType) {
        const dynamicToggleContainer = document.querySelector('.dynamic-qr-toggle-container');
        if (selectedType === 'url') {
            dynamicToggleContainer.style.display = 'flex';
        } else {
            dynamicToggleContainer.style.display = 'none';
            dynamicQrCheckbox.checked = false; // Uncheck it when switching away
        }
        // ... rest of your switchQrType function
    }

    // Your getQrDataStringForInstance() is fine, no changes needed
    function getQrDataStringForInstance() { /* ... */ }

    // Your generateQRCodePreview() is fine, no changes needed
    async function generateQRCodePreview() { /* ... */ }


    // === FINAL UPDATE: SAVE BUTTON LOGIC FOR DYNAMIC QR ===
    const saveQrButton = document.getElementById('saveQrButton');
    if (saveQrButton) {
        saveQrButton.addEventListener('click', async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                loginModalOverlay.classList.remove('hidden');
                return;
            }

            const isDynamic = dynamicQrCheckbox.checked && currentQrType === 'url';
            
            // ... (Button "Saving..." state logic)
            saveQrButton.disabled = true;

            let qrCodeData;
            
            try {
                if (isDynamic) {
                    // DYNAMIC QR LOGIC
                    const originalUrl = qrDataUrlInput.value;
                    if (!originalUrl || !originalUrl.startsWith('http')) {
                        throw new Error('Please enter a valid URL (starting with http or https).');
                    }
                    
                    const newLinkRef = db.collection("links").doc();
                    await newLinkRef.set({
                        originalUrl: originalUrl,
                        userId: currentUser.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        scans: 0,
                    });

                    const shortId = newLinkRef.id;
                    const shortUrl = `https://qodeo.vercel.app/qr/${shortId}`;
                    
                    qrCodeData = {
                        userId: currentUser.uid,
                        qrTextData: shortUrl, // The QR code will point to YOUR site's redirect link
                        isDynamic: true,
                        linkId: shortId,
                        originalUrl: originalUrl,
                        qrName: `Dynamic: ${originalUrl.slice(0, 30)}...`,
                        design: { /*... your design object ...*/ },
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        type: 'url'
                    };
                    
                } else {
                    // STATIC QR LOGIC (As it was before)
                    qrCodeData = {
                        userId: currentUser.uid,
                        qrTextData: getQrDataStringForInstance(),
                        isDynamic: false,
                        design: { /*... your design object ...*/ },
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        qrName: `${currentQrType} QR`,
                        type: currentQrType
                    };
                }

                // Finally, add the prepared data to 'qrcodes' collection
                await db.collection("qrcodes").add(qrCodeData);
                
                // ... (Show "Saved!" success message)
                
            } catch (error) {
                console.error("Save QR Error: ", error);
                alert(error.message || "Could not save QR code.");
                // ... (Reset button on error)
            }
        });
    }

    // ... All your other original event listeners (`download`, `qrTypeButtons`, etc.) are here
});