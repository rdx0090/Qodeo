document.addEventListener('DOMContentLoaded', () => {

    // === FIREBASE SETUP (Bilkul wesa hi jesa pro.js mein hai) ===
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
    const db = firebase.firestore();

    // === PAGE ELEMENTS SELECTORS ===
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const vcardWrapper = document.getElementById('vcard-wrapper');

    // === CARD DATA ELEMENTS ===
    const coverPhoto = document.getElementById('cover-photo');
    const profilePhoto = document.getElementById('profile-photo');
    const cardName = document.getElementById('card-name');
    const cardHeadline = document.getElementById('card-headline');
    const cardBio = document.getElementById('card-bio');
    const saveContactBtn = document.getElementById('save-contact-btn');
    const phoneBtn = document.getElementById('phone-btn');
    const emailBtn = document.getElementById('email-btn');
    const socialLinksContainer = document.getElementById('social-links');

    // === DATA FETCH KARNE KA LOGIC ===
    const fetchCardData = async () => {
        try {
            // Step 1: URL se Card ki ID nikalein
            const params = new URLSearchParams(window.location.search);
            const cardId = params.get('id');

            if (!cardId) {
                throw new Error("Card ID not provided.");
            }

            // Step 2: Firebase se data fetch karein
            const docRef = db.collection("business_cards").doc(cardId);
            const doc = await docRef.get();

            if (doc.exists) {
                // Step 3: Agar data mil jaye, to page par dikhayein
                const cardData = doc.data();
                populateCardData(cardData);
                vcardWrapper.classList.add('visible');
            } else {
                throw new Error("Card not found.");
            }

        } catch (error) {
            console.error("Error fetching card:", error);
            errorMessage.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    };

    // === PAGE PAR DATA DIKHANE KA FUNCTION ===
    const populateCardData = (data) => {
        // Basic Info
        cardName.textContent = data.name || '';
        cardHeadline.textContent = data.headline || '';
        cardBio.textContent = data.bio || '';
        profilePhoto.src = data.profilePicUrl || 'images/default-avatar.png';
        if (data.coverPicUrl) {
            coverPhoto.src = data.coverPicUrl;
        }

        // Action Buttons
        if (data.phone) {
            phoneBtn.href = `tel:${data.phone}`;
            phoneBtn.classList.remove('hidden');
        }
        if (data.email) {
            emailBtn.href = `mailto:${data.email}`;
            emailBtn.classList.remove('hidden');
        }

        // Social Links
        const socialMap = {
            linkedin: 'fab fa-linkedin',
            github: 'fab fa-github',
            instagram: 'fab fa-instagram',
            twitter: 'fab fa-twitter',
            facebook: 'fab fa-facebook'
        };

        socialLinksContainer.innerHTML = ''; // Pehle se clear karein
        for (const key in data.socialLinks) {
            if (data.socialLinks[key] && socialMap[key]) {
                const link = document.createElement('a');
                link.href = data.socialLinks[key];
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'social-link';
                link.innerHTML = `<i class="${socialMap[key]}"></i>`;
                socialLinksContainer.appendChild(link);
            }
        }
        
        // "Save to Contacts" (.vcf file) ka logic
        createVcfFile(data);
    };
    
    // === .VCF FILE BANANE KA LOGIC ===
    const createVcfFile = (data) => {
        const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
N:${data.name.split(' ').pop()};${data.name.split(' ').slice(0, -1).join(' ')}
TITLE:${data.headline}
TEL;TYPE=CELL:${data.phone}
EMAIL:${data.email}
URL:${data.website}
END:VCARD`;

        const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        saveContactBtn.href = url;
        saveContactBtn.download = `${data.name.replace(' ', '_')}.vcf`;
    };

    // Page load hotay hi data fetch karein
    fetchCardData();

});