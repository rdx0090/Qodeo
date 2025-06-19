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
// === DASHBOARD MAIN LOGIC                                   ===
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Authentication Check and UI Update ---
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfileDiv = document.getElementById('user-profile');
    const userAvatarImg = document.getElementById('user-avatar');

    auth.onAuthStateChanged(user => {
        if (user) {
            if(loginButton) loginButton.classList.add('hidden');
            if(userProfileDiv) userProfileDiv.classList.remove('hidden');
            if(userAvatarImg) userAvatarImg.src = user.photoURL || 'images/default-avatar.png';
            loadUserQRCodes(user.uid);
        } else {
            console.log("No user found, redirecting to home.");
            const qrList = document.getElementById('qr-list');
            if(qrList) qrList.innerHTML = `<p class="dashboard-loader">Please log in to see your dashboard.</p>`;
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    });

    if (logoutButton) logoutButton.addEventListener('click', () => auth.signOut());

    const qrListContainer = document.getElementById('qr-list');
    const loader = document.getElementById('loader');
    const noQrMessage = document.getElementById('no-qr-message');

    // --- Function to fetch and display QR codes ---
    async function loadUserQRCodes(userId) {
        if (!qrListContainer || !loader) return;
        loader.classList.remove('hidden');
        qrListContainer.innerHTML = '';

        try {
            const querySnapshot = await db.collection("qrcodes")
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")
                .get();

            loader.classList.add('hidden');

            if (querySnapshot.empty) {
                if(noQrMessage) noQrMessage.classList.remove('hidden');
            } else {
                querySnapshot.forEach(doc => {
                    const qrData = doc.data();
                    const qrId = doc.id;
                    const card = createQRCard(qrId, qrData);
                    qrListContainer.appendChild(card);
                });
            }

        } catch (error) {
            // === YAHAN PAR BADLAAV KIYA GAYA HAI ===
            console.error("Error fetching QR codes: ", error);
            alert("Firebase Error: " + error.message); // <-- Yeh line error dikhayegi
            loader.textContent = "Error loading your QR codes. Check alert for details.";
            // === BADLAAV KHATAM ===
        }
    }

    function createQRCard(qrId, qrData) {
        const card = document.createElement('div');
        card.className = 'qr-card';
        card.dataset.id = qrId;
        const cardImage = document.createElement('div');
        cardImage.className = 'qr-card-image';
        const qrCodeInstance = new QRCodeStyling({
            width: 180, height: 180, type: 'svg',
            data: qrData.qrTextData,
            dotsOptions: qrData.design.dotsOptions || { color: qrData.design.dotColor, type: qrData.design.dotStyle },
            backgroundOptions: qrData.design.backgroundOptions || { color: qrData.design.backgroundColor },
            image: qrData.design.logo || ''
        });
        qrCodeInstance.append(cardImage);
        const date = qrData.createdAt ? qrData.createdAt.toDate().toLocaleDateString() : 'N/A';
        const cardInfo = document.createElement('div');
        cardInfo.className = 'qr-card-info';
        cardInfo.innerHTML = `<h3>${qrData.qrName || qrData.type + ' QR'}</h3><p>${(qrData.qrTextData.length > 50 ? qrData.qrTextData.substring(0, 47) + "..." : qrData.qrTextData)}</p><small>Saved on: ${date}</small>`;
        const cardActions = document.createElement('div');
        cardActions.className = 'qr-card-actions';
        cardActions.innerHTML = `<button class="icon-btn download-btn" title="Download"><i class="fas fa-download"></i></button><button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
        const deleteBtn = cardActions.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteQRCode(qrId, card));
        const downloadBtn = cardActions.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => qrCodeInstance.download({ name: 'qodeo-saved-qr', extension: 'png'}) );
        card.appendChild(cardImage);
        card.appendChild(cardInfo);
        card.appendChild(cardActions);
        return card;
    }

    async function deleteQRCode(qrId, cardElement) {
        if (!confirm("Are you sure you want to delete this QR code permanently?")) return;
        try {
            await db.collection("qrcodes").doc(qrId).delete();
            cardElement.remove();
            console.log("Document successfully deleted!");
            if (qrListContainer.children.length === 0) {
                noQrMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error removing document: ", error);
            alert("Could not delete the QR code. Please try again.");
        }
    }
});