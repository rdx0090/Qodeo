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
    // === ELEMENT SELECTORS (from your dashboard.html)           ===
    // ==============================================================
    // Header elements
    const loginButton = document.getElementById('login-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');
    const logoutButton = document.getElementById('logout-button');
    
    // Main content elements
    const loader = document.getElementById('loader');
    const qrListContainer = document.getElementById('qr-list');
    const noQrMessage = document.getElementById('no-qr-message');
    
    // Footer element
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();


    // ==============================================================
    // === AUTHENTICATION LOGIC                                   ===
    // ==============================================================
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            loginButton.classList.add('hidden');
            userProfileDiv.classList.remove('hidden');
            userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
            logoutButton.addEventListener('click', () => auth.signOut());

            // Fetch and display QR codes for this user
            loadAndDisplayQRCodes(user.uid);
        } else {
            // No user is signed in, redirect to home page
            console.log("User not logged in. Redirecting to login page.");
            window.location.href = 'index.html';
        }
    });

    // ==============================================================
    // === MAIN DASHBOARD FUNCTIONALITY                           ===
    // ==============================================================
    
    /**
     * Fetches QR codes from Firestore and displays them on the page.
     * @param {string} userId The UID of the logged-in user.
     */
    async function loadAndDisplayQRCodes(userId) {
        loader.style.display = 'block'; // Show loader
        qrListContainer.innerHTML = ''; // Clear any existing content
        noQrMessage.classList.add('hidden'); // Hide "no QR" message initially

        try {
            const querySnapshot = await db.collection("qrcodes")
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")
                .get();

            if (querySnapshot.empty) {
                // No codes found for this user
                noQrMessage.classList.remove('hidden');
            } else {
                // Loop through each document and create a card
                querySnapshot.forEach(doc => {
                    const qrData = doc.data();
                    const qrId = doc.id;
                    const card = createQrCard(qrData, qrId);
                    qrListContainer.appendChild(card);
                });
            }
        } catch (error) {
            console.error("Error fetching QR codes:", error);
            noQrMessage.textContent = "Error loading your codes. Please try again.";
            noQrMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none'; // Hide loader
        }
    }

    /**
     * Creates an HTML card element for a single QR code.
     * @param {object} qrData The data object from Firestore for one QR code.
     * @param {string} qrId The document ID from Firestore.
     * @returns {HTMLElement} The complete card element.
     */
    function createQrCard(qrData, qrId) {
        const card = document.createElement('div');
        card.className = 'qr-card';
        card.dataset.id = qrId; // Store the ID on the element

        const imageDiv = document.createElement('div');
        imageDiv.className = 'qr-card-image';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'qr-card-info';
        
        let targetDisplay = qrData.targetData || 'No Data';
        if (targetDisplay.length > 30) {
            targetDisplay = targetDisplay.substring(0, 27) + '...';
        }

        infoDiv.innerHTML = `
            <h3>${qrData.qrDataType || 'QR Code'}</h3>
            <p title="${qrData.targetData}">${targetDisplay}</p>
            <small>Saved on: ${qrData.createdAt?.toDate().toLocaleDateString() || 'N/A'}</small>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'qr-card-actions';

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'icon-btn';
        downloadBtn.title = 'Download QR';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.title = 'Delete QR';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        
        actionsDiv.appendChild(downloadBtn);
        actionsDiv.appendChild(deleteBtn);

        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        card.appendChild(actionsDiv);

        // --- THE FIX IS HERE ---
        // We use default values if qrData.customization is missing or incomplete
        const qrCodeInstance = new QRCodeStyling({
            width: 180,
            height: 180,
            type: 'svg',
            data: qrData.type === 'dynamic' ? `https://qodeo.vercel.app/qr/${qrId}` : qrData.targetData,
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

        qrCodeInstance.append(imageDiv);

        // Add event listeners for the buttons
        downloadBtn.addEventListener('click', () => {
            qrCodeInstance.download({ name: `qodeo-${qrData.qrDataType || 'qr'}-${qrId}`, extension: 'png' });
        });

        deleteBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this QR Code? This cannot be undone.')) {
                try {
                    await db.collection('qrcodes').doc(qrId).delete();
                    card.remove(); // Remove the card from the UI instantly
                    // Check if this was the last card
                    if (qrListContainer.children.length === 0) {
                         noQrMessage.classList.remove('hidden');
                    }
                } catch (error) {
                    console.error("Error deleting document: ", error);
                    alert('Could not delete the QR code. Please try again.');
                }
            }
        });

        return card;
    }
});