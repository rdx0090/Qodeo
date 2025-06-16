document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Common Customization Inputs
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    
    // Action Buttons & Display Areas
    const updateQrButton = document.getElementById('updateQrButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay'); 
    const yearSpan = document.getElementById('year');

    // Tab specific input fields
    const qrDataUrlInput = document.getElementById('qrDataUrl');
    const qrDataTextInput = document.getElementById('qrDataText');
    const qrEmailToInput = document.getElementById('qrEmailTo');
    const qrEmailSubjectInput = document.getElementById('qrEmailSubject');
    const qrEmailBodyInput = document.getElementById('qrEmailBody');
    const qrPhoneNumberInput = document.getElementById('qrPhoneNumber');

    // Tab Navigation Elements
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Appearance Options Heading (for dynamic icon)
    const appearanceHeading = document.querySelector('.customization-heading'); // Assuming it's the first h3 with this class

    // --- Initial Checks ---
    // Shortened the check for brevity, ensure all critical inputs are checked if necessary
    if (!qrDataUrlInput || !qrDataTextInput || !qrEmailToInput || !qrPhoneNumberInput || !updateQrButton ) {
        console.error("Critical UI elements missing. Qodeo cannot run.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: Critical UI elements missing.</p>";
        return; 
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let activeQrDataInput = qrDataUrlInput; // Default active input
    let activeTab = 'urlTab'; // Default active tab ID

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded.");
        qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: QR Library not loaded.</p>";
        if(updateQrButton) updateQrButton.disabled = true; 
        return;
    }

    const initialQrWidth = 280; 
    const initialQrHeight = 280; 

    const qrCodeInstance = new QRCodeStyling({
        width: initialQrWidth, height: initialQrHeight, type: 'svg',
        data: activeQrDataInput.value || "https://qodeo.pro",
        image: '',
        dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
        backgroundOptions: { color: backgroundColorInput.value },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    qrCodeInstance.append(qrCanvasContainer);

    // --- Tab Switching Logic ---
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));

            tab.classList.add('active');
            activeTab = tab.dataset.tab; // Store current active tab ID
            document.getElementById(activeTab).classList.add('active');

            // Update activeQrDataInput and placeholder icon for Appearance Options
            const iconClass = tab.dataset.icon || "fas fa-cog"; // Default icon
            if (appearanceHeading && appearanceHeading.firstChild.tagName === 'I') {
                appearanceHeading.firstChild.className = iconClass + " icon-label";
            } else if (appearanceHeading) {
                // Prepend icon if not exists (shouldn't happen if HTML is correct)
                // appearanceHeading.insertAdjacentHTML('afterbegin', `<i class="${iconClass} icon-label"></i> `);
            }


            switch (activeTab) {
                case 'urlTab':    activeQrDataInput = qrDataUrlInput; break;
                case 'textTab':   activeQrDataInput = qrDataTextInput; break;
                case 'emailTab':  activeQrDataInput = qrEmailToInput; break; // Main input for email is 'To'
                case 'phoneTab':  activeQrDataInput = qrPhoneNumberInput; break;
                // Add more cases for other tabs later
                default: activeQrDataInput = qrDataUrlInput; // Fallback
            }
            updateQRCodeView(); 
        });
    });
    
    // Function to prepare data string based on active tab
    function getQrDataString() {
        let dataString = "";
        switch (activeTab) {
            case 'urlTab':
                dataString = qrDataUrlInput.value || "https://qodeo.pro";
                break;
            case 'textTab':
                dataString = qrDataTextInput.value || "Your Qodeo Text";
                break;
            case 'emailTab':
                const to = qrEmailToInput.value;
                const subject = qrEmailSubjectInput.value;
                const body = qrEmailBodyInput.value;
                if (to) { // Email 'To' is mandatory for a valid mailto link
                    dataString = `mailto:${to}`;
                    if (subject) dataString += `?subject=${encodeURIComponent(subject)}`;
                    if (body) dataString += (subject ? '&' : '?') + `body=${encodeURIComponent(body)}`;
                } else {
                    dataString = "recipient@example.com"; // Default placeholder if 'To' is empty
                }
                break;
            case 'phoneTab':
                dataString = `tel:${qrPhoneNumberInput.value || "+1234567890"}`;
                break;
            // Add more cases later
            default:
                dataString = qrDataUrlInput.value || "https://qodeo.pro";
        }
        return dataString;
    }

    // --- Update QR Code Function ---
    async function updateQRCodeView() {
        if (!updateQrButton || !activeQrDataInput) return; 

        updateQrButton.disabled = true;
        updateQrButton.textContent = 'Generating...';

        const currentData = getQrDataString(); // Get formatted data string

        const options = {
            data: currentData, 
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            image: currentLogoBase64 || '',
            width: initialQrWidth, height: initialQrHeight,
            qrOptions: { errorCorrectionLevel: 'H' },
            imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true }
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 50)); 
            qrCodeInstance.update(options);
            if (qrDataDisplay) qrDataDisplay.textContent = currentData; 
        } catch (error) {
            console.error("Error updating QR Code:", error);
            if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error updating QR.</p>";
            if (qrDataDisplay) qrDataDisplay.textContent = 'Error generating QR.'; 
        } finally {
            updateQrButton.disabled = false;
            updateQrButton.textContent = 'Generate / Update QR Code';
        }
    }

    // --- Event Listeners for Controls (Logo Upload) ---
    if (logoUploadInput) {
        logoUploadInput.addEventListener('change', (event) => {
            // ... (logo upload logic waisa hi) ...
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentLogoBase64 = e.target.result;
                    if (logoPreview) {
                        logoPreview.src = e.target.result;
                        logoPreview.style.display = 'block';
                    }
                };
                reader.onerror = function() { console.error("Error reading file."); alert("Could not load logo."); };
                reader.readAsDataURL(file);
            } else {
                currentLogoBase64 = null;
                if (logoPreview) { logoPreview.src = "#"; logoPreview.style.display = 'none'; }
            }
        });
    }

    updateQrButton.addEventListener('click', updateQRCodeView);

    // --- Download Handlers ---
    if (downloadSvgButton) {
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataString();
            qrCodeInstance.update({data: dataForDownload}); // Ensure latest data is used
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    
    if (downloadPngButton) {
        downloadPngButton.addEventListener('click', async () => { 
            // ... (HD PNG download logic waisa hi, lekin data getQrDataString se lega) ...
            const highResWidth = 1024; const highResHeight = 1024; 
            if (updateQrButton) { updateQrButton.disabled = true; updateQrButton.textContent = 'Preparing HD PNG...';}
            if (downloadSvgButton) downloadSvgButton.disabled = true;
            if (downloadPngButton) downloadPngButton.disabled = true;

            try {
                const currentOptions = qrCodeInstance._options;
                const dataForDownload = getQrDataString(); // Get correctly formatted data

                const highResOptions = {
                    ...currentOptions, width: highResWidth, height: highResHeight, type: 'png', 
                    data: dataForDownload, image: currentLogoBase64 || '', 
                    dotsOptions: { ...currentOptions.dotsOptions, color: dotColorInput.value, type: dotStyleSelect.value },
                    backgroundOptions: { ...currentOptions.backgroundOptions, color: backgroundColorInput.value },
                    imageOptions: { ...currentOptions.imageOptions, hideBackgroundDots: true, margin: 10, imageSize: 0.35 }
                };
                const tempQrInstance = new QRCodeStyling(highResOptions);
                await tempQrInstance.download({ name: `qodeo-qr-${highResWidth}x${highResHeight}`, extension: 'png' });
            } catch (error) {
                console.error("Error during HD PNG download:", error); alert("Could not generate HD PNG.");
            } finally {
                if (updateQrButton) { updateQrButton.disabled = false; updateQrButton.textContent = 'Generate / Update QR Code';}
                if (downloadSvgButton) downloadSvgButton.disabled = false;
                if (downloadPngButton) downloadPngButton.disabled = false;
            }
        });
    }

    updateQRCodeView(); // Initial QR code generation
});