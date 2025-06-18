document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements (Ensure all these IDs exist in your HTML)
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const generateQrMainButton = document.getElementById('generateQrMainButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay');
    const yearSpan = document.getElementById('year');
    const inputAreaTitle = document.getElementById('inputAreaTitle');

    const qrDataUrlInput = document.getElementById('qrDataUrl');
    const qrDataTextInput = document.getElementById('qrDataText');
    // Add other input field consts here when we implement them
    // const qrEmailToInput = document.getElementById('qrEmailTo'); 
    // ... etc.

    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');

    if (!qrDataUrlInput || !qrDataTextInput || !generateQrMainButton || qrTypeButtons.length === 0 || !qrCanvasContainer || !inputAreaTitle) {
        console.error("Critical UI elements for basic tabs are missing.");
        if (qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size: small;'>Error: Core UI elements missing.</p>";
        if (generateQrMainButton) generateQrMainButton.disabled = true;
        return;
    }

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url';
    let activeQrDataInput = qrDataUrlInput;

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded.");
        if (qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size:small;'>Error: QR Library missing.</p>";
        if (generateQrMainButton) generateQrMainButton.disabled = true;
        return;
    }

    const previewQrWidth = 250;
    const previewQrHeight = 250;
    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: "https://qodeo.pro", // Initial default data
        image: '',
        dotsOptions: { color: "#000000", type: "square" }, // Sensible defaults
        backgroundOptions: { color: "#ffffff" }, // Sensible defaults
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    qrCodeInstance.append(qrCanvasContainer);

    function switchQrType(selectedType) {
        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active')); // Hide all input groups

        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroupDiv = document.getElementById(`${selectedType}Inputs`); // The div e.g. urlInputs

        if (activeButton) activeButton.classList.add('active');
        
        let title = "Enter Data";
        currentQrType = selectedType; // Set the current type

        if (selectedType === 'url') {
            title = 'Enter your Website URL';
            activeQrDataInput = qrDataUrlInput;
            if (activeInputGroupDiv) activeInputGroupDiv.classList.add('active'); // Show URL inputs
        } else if (selectedType === 'text') {
            title = 'Enter your Text';
            activeQrDataInput = qrDataTextInput;
            if (activeInputGroupDiv) activeInputGroupDiv.classList.add('active'); // Show Text inputs
        } else {
            // For unimplemented types, show alert and fallback to URL view
            alert(selectedType.toUpperCase() + " QR type is not fully implemented yet in this script version. Showing URL input.");
            // Fallback to URL tab visuals and input
            const urlButton = document.querySelector(`.qr-type-button[data-type="url"]`);
            const urlInputGroupDiv = document.getElementById(`urlInputs`);
            if (urlButton) urlButton.classList.add('active');
            if (urlInputGroupDiv) urlInputGroupDiv.classList.add('active');
            title = 'Enter your Website URL';
            activeQrDataInput = qrDataUrlInput;
            currentQrType = 'url'; // Reset current type to URL
        }
        
        inputAreaTitle.textContent = title;
        // Generate a generic preview or last valid QR for the new type
        // For this basic script, let's just update with a placeholder if input is empty
        generateQRCodePreview(); 
    }

    qrTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchQrType(button.dataset.type);
        });
    });

    function getQrDataStringForInstance() {
        let dataString = "";
        if (!activeQrDataInput) return "https://qodeo.pro/error-no-input";

        switch (currentQrType) { // Use the globally tracked currentQrType
            case 'url':
                dataString = activeQrDataInput.value || "https://qodeo.pro";
                break;
            case 'text':
                dataString = activeQrDataInput.value || "Qodeo QR Text";
                break;
            default: // For unimplemented types, use a default or the active input's value
                dataString = activeQrDataInput.value || "https://qodeo.pro/default";
        }
        return dataString;
    }

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
            if (qrDataDisplay) qrDataDisplay.textContent = dataForQr.length > 70 ? dataForQr.substring(0, 67) + "..." : dataForQr;
        } catch (error) {
            console.error("Error updating QR Code:", error);
            if (qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size:small;'>Error updating QR.</p>";
            if (qrDataDisplay) qrDataDisplay.textContent = 'Error!';
        } finally {
            if (generateQrMainButton) { generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code'; }
        }
    }

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
        if (input) input.addEventListener('change', generateQRCodePreview); // Auto-generate on customization change
    });

    if (downloadSvgButton) {
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataStringForInstance();
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

    // Initialize the first tab (URL)
    if (qrTypeButtons.length > 0) {
        switchQrType('url'); // Default to URL tab
    }
});