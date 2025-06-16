document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const updateQrButton = document.getElementById('updateQrButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer');
    const qrDataDisplay = document.getElementById('qrDataDisplay'); 

    // Tab specific input fields
    const qrDataUrlInput = document.getElementById('qrDataUrl');
    const qrDataTextInput = document.getElementById('qrDataText');

    // Tab Navigation Elements
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Check if essential elements are present
    if (!qrDataUrlInput || !qrDataTextInput ||!dotColorInput || !backgroundColorInput || !dotStyleSelect || !updateQrButton || !qrCanvasContainer || !qrDataDisplay || tabLinks.length === 0 || tabContents.length === 0) {
        console.error("One or more critical UI elements are missing. Qodeo cannot initialize properly.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: Critical UI elements missing. App cannot run.</p>";
        return; 
    }
    
    // Default active input field
    let activeQrDataInput = qrDataUrlInput; // URL tab is active by default

    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    let currentLogoBase64 = null;

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library is not loaded.");
        qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: QR Library not loaded. Check internet or script link.</p>";
        updateQrButton.disabled = true; 
        return;
    }

    const initialQrWidth = 280; 
    const initialQrHeight = 280; 

    const qrCodeInstance = new QRCodeStyling({
        width: initialQrWidth, 
        height: initialQrHeight, 
        type: 'svg', 
        data: activeQrDataInput.value || "https://qodeo.pro", // Use active input's value
        image: '',
        dotsOptions: {
            color: dotColorInput.value,
            type: dotStyleSelect.value
        },
        backgroundOptions: {
            color: backgroundColorInput.value,
        },
        imageOptions: {
            crossOrigin: 'anonymous',
            margin: 10,
            imageSize: 0.35,
            hideBackgroundDots: true
        },
        qrOptions: {
            errorCorrectionLevel: 'H'
        }
    });

    qrCodeInstance.append(qrCanvasContainer);

    // --- Tab Switching Logic ---
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));

            tab.classList.add('active');
            const targetTabContentId = tab.dataset.tab; 
            document.getElementById(targetTabContentId).classList.add('active');

            // Update activeQrDataInput based on the active tab
            if (targetTabContentId === 'urlTab') {
                activeQrDataInput = qrDataUrlInput;
            } else if (targetTabContentId === 'textTab') {
                activeQrDataInput = qrDataTextInput;
            }
            // Add more else if for other tabs later (Email, Wi-Fi, etc.)

            updateQRCodeView(); // Update QR when tab changes, using the new active input
        });
    });


    // --- Update QR Code Function ---
    async function updateQRCodeView() {
        if (!updateQrButton || !activeQrDataInput) { // Check activeQrDataInput
            console.error("Update button or active data input not found.");
            return;
        }

        updateQrButton.disabled = true;
        updateQrButton.textContent = 'Generating...';

        let currentData = activeQrDataInput.value;
        if (!currentData) { // Set default data based on active tab if input is empty
            if (activeQrDataInput.id === 'qrDataUrl') {
                currentData = "https://qodeo.pro";
            } else if (activeQrDataInput.id === 'qrDataText') {
                currentData = "Your Qodeo Text";
            } else {
                currentData = "Qodeo Default"; // Generic default
            }
        }

        const options = {
            data: currentData, 
            dotsOptions: {
                color: dotColorInput.value,
                type: dotStyleSelect.value
            },
            backgroundOptions: {
                color: backgroundColorInput.value,
            },
            image: currentLogoBase64 || '',
            width: initialQrWidth, 
            height: initialQrHeight,
            qrOptions: { 
                errorCorrectionLevel: 'H'
            },
            imageOptions: { 
                crossOrigin: 'anonymous',
                margin: 10,
                imageSize: 0.35,
                hideBackgroundDots: true
            }
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 50)); 
            qrCodeInstance.update(options);

            if (qrDataDisplay) {
                qrDataDisplay.textContent = currentData; 
            }

        } catch (error) {
            console.error("Error updating QR Code:", error);
            if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error updating QR. Please try again.</p>";
            if (qrDataDisplay) {
                qrDataDisplay.textContent = 'Error generating QR.'; 
            }
        } finally {
            updateQrButton.disabled = false;
            updateQrButton.textContent = 'Generate / Update QR Code';
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
                    if (logoPreview) {
                        logoPreview.src = e.target.result;
                        logoPreview.style.display = 'block';
                    }
                };
                reader.onerror = function() {
                    console.error("Error reading file for logo.");
                    alert("Could not load the logo file. Please try a different image.");
                };
                reader.readAsDataURL(file);
            } else {
                currentLogoBase64 = null;
                if (logoPreview) {
                    logoPreview.src = "#"; 
                    logoPreview.style.display = 'none';
                }
            }
        });
    }

    updateQrButton.addEventListener('click', updateQRCodeView);

    // --- Download Handlers ---
    if (downloadSvgButton) {
        downloadSvgButton.addEventListener('click', () => {
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    
    if (downloadPngButton) {
        downloadPngButton.addEventListener('click', async () => { 
            const highResWidth = 1024; 
            const highResHeight = 1024; 

            if (updateQrButton) { 
                updateQrButton.disabled = true; 
                updateQrButton.textContent = 'Preparing HD PNG...';
            }
            if (downloadSvgButton) downloadSvgButton.disabled = true;
            if (downloadPngButton) downloadPngButton.disabled = true;

            try {
                const currentOptions = qrCodeInstance._options;
                let dataForDownload = activeQrDataInput.value;
                 if (!dataForDownload) {
                    if (activeQrDataInput.id === 'qrDataUrl') dataForDownload = "https://qodeo.pro";
                    else if (activeQrDataInput.id === 'qrDataText') dataForDownload = "Your Qodeo Text";
                    else dataForDownload = "Qodeo Default";
                }

                const highResOptions = {
                    ...currentOptions, 
                    width: highResWidth,
                    height: highResHeight,
                    type: 'png', 
                    data: dataForDownload, 
                    image: currentLogoBase64 || '', 
                    dotsOptions: {
                        ...currentOptions.dotsOptions,
                        color: dotColorInput.value,
                        type: dotStyleSelect.value
                    },
                    backgroundOptions: {
                        ...currentOptions.backgroundOptions,
                        color: backgroundColorInput.value
                    },
                    imageOptions: { 
                        ...currentOptions.imageOptions,
                        hideBackgroundDots: true, 
                        margin: 10, // Ensure these are consistent
                        imageSize: 0.35
                    }
                };
                
                const tempQrInstance = new QRCodeStyling(highResOptions);
                await tempQrInstance.download({ 
                    name: `qodeo-qr-${highResWidth}x${highResHeight}`, 
                    extension: 'png' 
                });
            } catch (error) {
                console.error("Error during HD PNG download:", error);
                alert("Could not generate HD PNG. Please try again.");
            } finally {
                if (updateQrButton) {
                    updateQrButton.disabled = false;
                    updateQrButton.textContent = 'Generate / Update QR Code';
                }
                if (downloadSvgButton) downloadSvgButton.disabled = false;
                if (downloadPngButton) downloadPngButton.disabled = false;
            }
        });
    }

    updateQRCodeView(); // Initial QR code generation
});