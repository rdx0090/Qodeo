// Is poore code ko copy karke apni dashboard.js file mein paste kar dein

document.addEventListener('DOMContentLoaded', () => {

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

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ==============================================================
    // === ELEMENT SELECTORS                                      ===
    // ==============================================================
    const loginButton = document.getElementById('login-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    const logoutButton = document.getElementById('logout-button');
    const loader = document.getElementById('loader');
    const qrListContainer = document.getElementById('qr-list');
    const noQrMessage = document.getElementById('no-qr-message');
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ==============================================================
    // === AUTHENTICATION LOGIC                                   ===
    // ==============================================================
    auth.onAuthStateChanged(user => {
        if (user) {
            loginButton.classList.add('hidden');
            userProfileDiv.classList.remove('hidden');
            userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
            logoutButton.addEventListener('click', () => auth.signOut());
            loadAndDisplayQRCodes(user.uid);
        } else {
            window.location.href = 'index.html';
        }
    });

    // ==============================================================
    // === MAIN DASHBOARD FUNCTIONALITY (NAYA AUR BEHTAR CODE)      ===
    // ==============================================================
    async function loadAndDisplayQRCodes(userId) {
        loader.style.display = 'block';
        qrListContainer.innerHTML = '';
        noQrMessage.classList.add('hidden');

        try {
            // 1. DYNAMIC QR CODES FETCH KAREIN ('links' collection se)
            const dynamicPromise = db.collection("links")
                .where("userId", "==", userId)
                .get();

            // 2. STATIC QR CODES FETCH KAREIN ('static_qrcodes' collection se)
            const staticPromise = db.collection("static_qrcodes")
                .where("userId", "==", userId)
                .get();

            // Dono requests ko ek saath bhejein
            const [dynamicSnapshot, staticSnapshot] = await Promise.all([dynamicPromise, staticPromise]);

            let allCodes = [];

            // Dynamic codes ko list mein add karein
            dynamicSnapshot.forEach(doc => {
                allCodes.push({ id: doc.id, data: doc.data(), type: 'dynamic' });
            });

            // Static codes ko list mein add karein
            staticSnapshot.forEach(doc => {
                allCodes.push({ id: doc.id, data: doc.data(), type: 'static' });
            });
            
            // 3. TAMAM CODES KO DATE KE HISAB SE SORT KAREIN (naye sab se upar)
            allCodes.sort((a, b) => b.data.createdAt.seconds - a.data.createdAt.seconds);

            if (allCodes.length === 0) {
                noQrMessage.classList.remove('hidden');
            } else {
                allCodes.forEach(item => {
                    const card = createQrCard(item.data, item.id, item.type);
                    qrListContainer.appendChild(card);
                });
            }

        } catch (error) {
            console.error("Error fetching QR codes:", error);
            noQrMessage.textContent = "Error loading your codes. Please try again.";
            noQrMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none';
        }
    }
    
    /**
     * Creates an HTML card for a single QR code.
     * @param {object} qrData The data object from Firestore.
     * @param {string} qrId The document ID.
     * @param {string} qrType 'dynamic' or 'static'.
     * @returns {HTMLElement} The complete card element.
     */
    function createQrCard(qrData, qrId, qrType) {
        const card = document.createElement('div');
        card.className = 'qr-card';
        card.dataset.id = qrId;

        // --- Data to display ---
        // Agar dynamic hai to 'originalUrl', agar static hai to 'targetData'
        const destinationUrl = qrType === 'dynamic' ? qrData.originalUrl : qrData.targetData;
        const qrDataTypeDisplay = qrType === 'dynamic' ? 'URL (Dynamic)' : qrData.qrDataType || 'Static';
        let targetDisplay = destinationUrl || 'No Data';
        if (targetDisplay.length > 30) {
            targetDisplay = targetDisplay.substring(0, 27) + '...';
        }

        // --- QR Code Data ---
        // Dynamic ke liye Vercel ka link, static ke liye asal data
        const dataForQrCode = qrType === 'dynamic' 
            ? `https://qodeo.vercel.app/api/redirect?slug=${qrId}` 
            : destinationUrl;

        card.innerHTML = `
            <div class="qr-card-image" id="qr-image-${qrId}"></div>
            <div class="qr-card-info">
                <h3>${qrDataTypeDisplay}</h3>
                <p title="${destinationUrl}">${targetDisplay}</p>
                <small>Saved on: ${qrData.createdAt?.toDate().toLocaleDateString() || 'N/A'}</small>
            </div>
            <div class="qr-card-actions">
                <button class="icon-btn download-btn" title="Download QR"><i class="fas fa-download"></i></button>
                <button class="icon-btn delete-btn" title="Delete QR"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Generate and append the QR code image
        const qrCodeInstance = new QRCodeStyling({
            width: 180,
            height: 180,
            type: 'svg',
            data: dataForQrCode,
            image: qrData.customization?.logo || '',
            dotsOptions: {
                color: qrData.customization?.dotColor || '#000000',
                type: qrData.customization?.dotStyle || 'square'
            },
            backgroundOptions: {
                color: qrData.customization?.backgroundColor || '#ffffff'
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 5
            }
        });
        qrCodeInstance.append(card.querySelector(`#qr-image-${qrId}`));
        
        // --- Add Event Listeners ---
        card.querySelector('.download-btn').addEventListener('click', () => {
            qrCodeInstance.download({ name: `qodeo-${qrId}`, extension: 'png' });
        });

        card.querySelector('.delete-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this QR Code?')) {
                // Sahi collection se delete karein
                const collectionName = qrType === 'dynamic' ? 'links' : 'static_qrcodes';
                try {
                    await db.collection(collectionName).doc(qrId).delete();
                    card.remove();
                    if (qrListContainer.children.length === 0) {
                        noQrMessage.classList.remove('hidden');
                    }
                } catch (error) {
                    console.error("Error deleting document:", error);
                    alert('Could not delete the QR code. Please try again.');
                }
            }
        });

        return card;
    }
});