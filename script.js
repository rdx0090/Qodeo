document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Common Customization Inputs
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    
    // Action Buttons & Display Areas
    const generateQrMainButton = document.getElementById('generateQrMainButton'); // Changed from updateQrButton
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay'); 
    const yearSpan = document.getElementById('year');
    const inputAreaTitle = document.getElementById('inputAreaTitle');


    // QR Type specific input fields
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
    // Add vCard and Location inputs when implemented

    // QR Type Selector Elements
    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');

    // --- Initial Checks & Setup ---
    if (!qrDataUrlInput || !generateQrMainButton || qrTypeButtons.length === 0 || !qrCanvasContainer || !inputAreaTitle) {
        console.error("Critical UI elements for Qodeo are missing. App cannot initialize.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size: small;'>Error: Core UI elements missing. Cannot run.</p>";
        if(generateQrMainButton) generateQrMainButton.disabled = true;
        return; 
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; // Default active QR type
    let currentQrDataInputs = { // Object to hold references to current active inputs
        main: qrDataUrlInput // Default
    };


    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size:small;'>Error: QR Library missing.</p>";
        if(generateQrMainButton) generateQrMainButton.disabled = true; 
        return;
    }

    const previewQrWidth = 250; // Size for the preview canvas
    const previewQrHeight = 250; 

    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: qrDataUrlInput.value || "https://qodeo.pro", // Initial data from default active tab
        image: '',
        dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
        backgroundOptions: { color: backgroundColorInput.value },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    qrCodeInstance.append(qrCanvasContainer);

    // --- Function to switch QR type and display relevant inputs ---
    function switchQrType(selectedType) {
        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active'));

        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroup = document.getElementById(`${selectedType}Inputs`);

        if (activeButton) activeButton.classList.add('active');
        if (activeInputGroup) activeInputGroup.classList.add('active');

        currentQrType = selectedType;

        // Update title and set currentQrDataInputs references
        switch (selectedType) {
            case 'url':
                inputAreaTitle.textContent = 'Enter your Website URL';
                currentQrDataInputs = { main: qrDataUrlInput };
                break;
            case 'text':
                inputAreaTitle.textContent = 'Enter your Text';
                currentQrDataInputs = { main: qrDataTextInput };
                break;
            case 'email':
                inputAreaTitle.textContent = 'Create an Email QR Code';
                currentQrDataInputs = { 
                    to: qrEmailToInput, 
                    subject: qrEmailSubjectInput, 
                    body: qrEmailBodyInput 
                };
                break;
            case 'phone':
                inputAreaTitle.textContent = 'Enter Phone Number';
                currentQrDataInputs = { main: qrPhoneNumberInput };
                break;
            case 'sms':
                inputAreaTitle.textContent = 'Create an SMS QR Code';
                currentQrDataInputs = { 
                    number: qrSmsNumberInput, 
                    message: qrSmsMessageInput 
                };
                break;
            case 'wifi':
                inputAreaTitle.textContent = 'Setup Wi-Fi Access QR';
                currentQrDataInputs = { 
                    ssid: qrWifiSsidInput, 
                    password: qrWifiPasswordInput, 
                    encryption: qrWifiEncryptionSelect 
                };
                break;
            // Add cases for vcard, location etc.
            default:
                inputAreaTitle.textContent = 'Enter your Data';
                currentQrDataInputs = { main: qrDataUrlInput }; // Fallback
        }
        // updateQRCodePreview(); // Generate QR for the new type with default/empty values
    }

    // --- Event Listeners for QR Type Buttons ---
    qrTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchQrType(button.dataset.type);
        });
    });
    
    // --- Function to prepare data string based on active type ---
    function getQrDataStringForInstance() {
        let dataString = "";
        // Use currentQrDataInputs to get values
        switch (currentQrType) {
            case 'url':
                dataString = currentQrDataInputs.main.value || "https://qodeo.pro";
                break;
            case 'text':
                dataString = currentQrDataInputs.main.value || "Qodeo QR Text";
                break;
            case 'email':
                const to = currentQrDataInputs.to.value;
                if (!to) { alert("Please enter 'To Email Address'"); return null; }
                dataString = `mailto:${encodeURIComponent(to)}`;
                if (currentQrDataInputs.subject.value) dataString += `?subject=${encodeURIComponent(currentQrDataInputs.subject.value)}`;
                if (currentQrDataInputs.body.value) dataString += (currentQrDataInputs.subject.value ? '&' : '?') + `body=${encodeURIComponent(currentQrDataInputs.body.value)}`;
                break;
            case 'phone':
                const phoneNum = currentQrDataInputs.main.value;
                if (!phoneNum) { alert("Please enter a Phone Number"); return null; }
                dataString = `tel:${phoneNum}`;
                break;
            case 'sms':
                const smsNum = currentQrDataInputs.number.value;
                if (!smsNum) { alert("Please enter Phone Number for SMS"); return null; }
                dataString = `smsto:${smsNum}`;
                if (currentQrDataInputs.message.value) dataString += `:${encodeURIComponent(currentQrDataInputs.message.value)}`;
                break;
            case 'wifi':
                const ssid = currentQrDataInputs.ssid.value;
                const password = currentQrDataInputs.password.value;
                const encryption = currentQrDataInputs.encryption.value;
                if (!ssid) { alert("Please enter Network Name (SSID)"); return null; }
                dataString = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
                break;
            // Add vCard and location later
            default:
                dataString = "https://qodeo.pro"; // Fallback
        }
        return dataString;
    }

    // --- Update QR Code Function (Now called generateQRCodePreview) ---
    async function generateQRCodePreview() {
        if (!generateQrMainButton) return; 

        const dataForQr = getQrDataStringForInstance();
        if (dataForQr === null) { // If validation failed in getQrDataStringForInstance
            generateQrMainButton.disabled = false;
            generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
            return;
        }

        generateQrMainButton.disabled = true;
        generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        const options = {
            data: dataForQr, 
            width: previewQrWidth, height: previewQrHeight,
            image: currentLogoBase64 || '',
            dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: backgroundColorInput.value },
            imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
            qrOptions: { errorCorrectionLevel: 'H' }
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 50)); 
            qrCodeInstance.update(options);
            if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.length > 70 ? dataForQr.substring(0,67)+"..." : dataForQr ; 
        } catch (error) {
            console.error("Error updating QR Code:", error);
            if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size:small;'>Error updating QR.</p>";
            if (qrDataDisplay) qrDataDisplay.textContent = 'Error!'; 
        } finally {
            generateQrMainButton.disabled = false;
            generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
        }
    }

    // --- Event Listeners for Controls ---
    if (logoUploadInput) { 
        logoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentLogoBase64 = e.target.result;
                    if (logoPreview) { logoPreview.src = e.target.result; logoPreview.style.display = 'block'; }
                    // generateQRCodePreview(); // Optional: Auto-update on logo change
                };
                reader.onerror = function() { console.error("Error reading file."); alert("Could not load logo."); };
                reader.readAsDataURL(file);
            } else {
                currentLogoBase64 = null;
                if (logoPreview) { logoPreview.src = "#"; logoPreview.style.display = 'none'; }
                // generateQRCodePreview(); // Optional: Auto-update if logo is cleared
            }
        });
    }
    // Listener for the main generate button
    generateQrMainButton.addEventListener('click', generateQRCodePreview);

    // Add listeners to common customization options to auto-update preview
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', generateQRCodePreview);
    });


    // --- Download Handlers ---
    if (downloadSvgButton) { 
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataStringForInstance();
            if (dataForDownload === null) return;
            // Update instance with latest customization before SVG download
            const currentPreviewOptions = {
                data: dataForDownload,
                dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
                backgroundOptions: { color: backgroundColorInput.value },
                image: currentLogoBase64 || '',
                imageOptions: qrCodeInstance._options.imageOptions, // Keep existing imageOptions
                qrOptions: qrCodeInstance._options.qrOptions       // Keep existing qrOptions
            };
            qrCodeInstance.update(currentPreviewOptions);
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) { 
        downloadPngButton.addEventListener('click', async () => { 
            const dataForDownload = getQrDataStringForInstance();
            if (dataForDownload === null) return;

            const highResWidth = 1024; const highResHeight = 1024; 
            
            // Disable buttons
            if (generateQrMainButton) { generateQrMainButton.disabled = true; generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing HD...'; }
            if (downloadSvgButton) downloadSvgButton.disabled = true;
            if (downloadPngButton) downloadPngButton.disabled = true;

            try {
                const currentOptions = qrCodeInstance._options;
                const highResOptions = {
                    ...currentOptions, width: highResWidth, height: highResHeight, type: 'png', 
                    data: dataForDownload, image: currentLogoBase64 || '', 
                    dotsOptions: { ...currentOptions.dotsOptions, color: dotColorInput.value, type: dotStyleSelect.value },
                    backgroundOptions: { ...currentOptions.backgroundOptions, color: backgroundColorInput.value },
                    imageOptions: { ...currentOptions.imageOptions, hideBackgroundDots: true } // Ensure all imageOptions are passed
                };
                const tempQrInstance = new QRCodeStyling(highResOptions);
                await tempQrInstance.download({ name: `qodeo-qr-${highResWidth}x${highResHeight}`, extension: 'png' });
            } catch (error) {
                console.error("Error during HD PNG download:", error); alert("Could not generate HD PNG.");
            } finally {
                // Re-enable buttons
                if (generateQrMainButton) { generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code'; }
                if (downloadSvgButton) downloadSvgButton.disabled = false;
                if (downloadPngButton) downloadPngButton.disabled = false;
            }
        });
    }

    // --- Initialize View ---
    switchQrType(currentQrType); // Set initial active tab and QR code
});