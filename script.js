document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    
    const generateQrMainButton = document.getElementById('generateQrMainButton'); // Using the new button ID
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay'); 
    const yearSpan = document.getElementById('year');
    const inputAreaTitle = document.getElementById('inputAreaTitle');

    // QR Type specific input fields (Only URL and Text for now)
    const qrDataUrlInput = document.getElementById('qrDataUrl');
    const qrDataTextInput = document.getElementById('qrDataText');

    // QR Type Selector Elements
    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');

    // --- Initial Checks & Setup ---
    if (!qrDataUrlInput || !qrDataTextInput || !generateQrMainButton || qrTypeButtons.length === 0 || !qrCanvasContainer || !inputAreaTitle) {
        console.error("Critical UI elements for basic tabs (URL/Text) are missing.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size: small;'>Error: Core UI elements missing.</p>";
        if(generateQrMainButton) generateQrMainButton.disabled = true;
        return; 
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; // Default active QR type
    let activeQrDataInput = qrDataUrlInput; // Default active input

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library is not loaded.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size:small;'>Error: QR Library missing.</p>";
        if(generateQrMainButton) generateQrMainButton.disabled = true; 
        return;
    }

    const previewQrWidth = 250; 
    const previewQrHeight = 250; 

    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: activeQrDataInput.value || "https://qodeo.pro", 
        image: '',
        dotsOptions: { color: dotColorInput.value || "#000000", type: dotStyleSelect.value || "square" }, // Added defaults
        backgroundOptions: { color: backgroundColorInput.value || "#ffffff" }, // Added defaults
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
        let title = "Enter Data";
        
        switch (selectedType) {
            case 'url':
                title = 'Enter your Website URL';
                activeQrDataInput = qrDataUrlInput;
                break;
            case 'text':
                title = 'Enter your Text';
                activeQrDataInput = qrDataTextInput;
                break;
            // Other types are not handled by this basic script yet
            default:
                title = 'Enter your Website URL'; // Fallback to URL
                activeQrDataInput = qrDataUrlInput;
                // Hide all other input groups except URL's if default is hit from an unknown type
                if (document.getElementById('urlInputs')) document.getElementById('urlInputs').classList.add('active');

        }
        inputAreaTitle.textContent = title;
        generateQRCodePreview(); // Generate QR for the new type with default/empty values
    }

    // --- Event Listeners for QR Type Buttons ---
    qrTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Only allow switching to implemented types for now
            const type = button.dataset.type;
            if (type === 'url' || type === 'text') {
                switchQrType(type);
            } else {
                alert(type.toUpperCase() + " QR type is not fully implemented yet in this script version.");
            }
        });
    });
    
    // --- Function to prepare data string based on active type ---
    function getQrDataStringForInstance() {
        let dataString = "";
        if (!activeQrDataInput) return "https://qodeo.pro/error"; // Safety check

        switch (currentQrType) {
            case 'url':
                dataString = activeQrDataInput.value || "https://qodeo.pro";
                break;
            case 'text':
                dataString = activeQrDataInput.value || "Qodeo QR Text";
                break;
            default:
                dataString = "https://qodeo.pro/default"; // Fallback data
        }
        return dataString;
    }

    // --- Update QR Code Function (Now called generateQRCodePreview) ---
    async function generateQRCodePreview() {
        if (!generateQrMainButton) return; 

        const dataForQr = getQrDataStringForInstance();
        
        generateQrMainButton.disabled = true; 
        generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        const options = {
            data: dataForQr, 
            width: previewQrWidth, height: previewQrHeight, 
            image: currentLogoBase64 || '',
            dotsOptions: { color: dotColorInput.value || "#000000", type: dotStyleSelect.value || "square" },
            backgroundOptions: { color: backgroundColorInput.value || "#ffffff" },
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
            if(generateQrMainButton) {generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';}
        }
    }

    // --- Event Listeners for Controls ---
    if (logoUploadInput) { 
        logoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) { currentLogoBase64 = e.target.result; if (logoPreview) { logoPreview.src = e.target.result; logoPreview.style.display = 'block'; }};
                reader.onerror = function() { console.error("Error reading file."); alert("Could not load logo."); };
                reader.readAsDataURL(file);
            } else { currentLogoBase64 = null; if (logoPreview) { logoPreview.src = "#"; logoPreview.style.display = 'none'; }}
        });
    }
    generateQrMainButton.addEventListener('click', generateQRCodePreview);
    [dotColorInput, backgroundColorInput, dotStyleSelect].forEach(input => {
        if (input) input.addEventListener('change', generateQRCodePreview);
    });

    // --- Download Handlers ---
    if (downloadSvgButton) { 
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataStringForInstance(); 
            // Ensure instance has latest data for download (especially important if preview doesn't auto-update on every input change)
            qrCodeInstance.update({ data: dataForDownload }); 
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) { 
        downloadPngButton.addEventListener('click', async () => { 
            const dataForDownload = getQrDataStringForInstance(); 
            const highResWidth = 1024; const highResHeight = 1024; 
            if (generateQrMainButton) { generateQrMainButton.disabled = true; generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing HD...'; }
            if (downloadSvgButton) downloadSvgButton.disabled = true; if (downloadPngButton) downloadPngButton.disabled = true;
            try {
                const currentOptions = qrCodeInstance._options;
                const highResOptions = { 
                    ...currentOptions, width: highResWidth, height: highResHeight, type: 'png', 
                    data: dataForDownload, image: currentLogoBase64 || '', 
                    dotsOptions: { ...currentOptions.dotsOptions, color: dotColorInput.value || "#000000", type: dotStyleSelect.value || "square" }, 
                    backgroundOptions: { ...currentOptions.backgroundOptions, color: backgroundColorInput.value || "#ffffff" }, 
                    imageOptions: { ...currentOptions.imageOptions, hideBackgroundDots: true } 
                };
                const tempQrInstance = new QRCodeStyling(highResOptions);
                await tempQrInstance.download({ name: `qodeo-qr-${highResWidth}x${highResHeight}`, extension: 'png' });
            } catch (error) { console.error("Error during HD PNG download:", error); alert("Could not generate HD PNG.");
            } finally {
                if (generateQrMainButton) { generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code'; }
                if (downloadSvgButton) downloadSvgButton.disabled = false; if (downloadPngButton) downloadPngButton.disabled = false;
            }
        });
    }

    // --- Initialize View ---
    // Activate the first tab (URL) by default if it exists
    if (qrTypeButtons.length > 0 && document.getElementById('urlInputs')) {
        switchQrType('url'); 
    } else if (qrTypeButtons.length > 0) { // Fallback if 'url' tab isn't the first one somehow
        switchQrType(qrTypeButtons[0].dataset.type);
    } else {
        console.error("No QR type buttons found to initialize default tab.");
    }
});