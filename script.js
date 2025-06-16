document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const qrDataInput = document.getElementById('qrData');
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

    // Check if essential elements are present
    if (!qrDataInput || !dotColorInput || !backgroundColorInput || !dotStyleSelect || !updateQrButton || !qrCanvasContainer || !qrDataDisplay) {
        console.error("One or more critical UI elements are missing. Qodeo cannot initialize properly.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: Critical UI elements missing. App cannot run.</p>";
        return; 
    }

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

    const initialQrWidth = 280; // Define initial/preview width
    const initialQrHeight = 280; // Define initial/preview height

    const qrCodeInstance = new QRCodeStyling({
        width: initialQrWidth, 
        height: initialQrHeight, 
        type: 'svg', // Start with SVG for crisp preview
        data: qrDataInput.value || "https://qodeo.pro",
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

    async function updateQRCodeView() {
        if (!updateQrButton) return; 

        updateQrButton.disabled = true;
        updateQrButton.textContent = 'Generating...';

        const currentData = qrDataInput.value || "https://qodeo.pro"; 

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
            // Ensure width and height are for preview if not specifically downloading
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
                qrDataDisplay.textContent = currentData === "https://qodeo.pro" && qrDataInput.value === "" ? "Default: https://qodeo.pro" : currentData;
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
                    alert("Could not load the logo file. Please try a different image or check file permissions.");
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

    if (downloadSvgButton) {
        downloadSvgButton.addEventListener('click', () => {
            // For SVG, current instance settings (including preview size) are usually fine
            // as SVG is scalable. If a specific size is needed for SVG's viewBox,
            // similar logic to PNG download could be applied, but it's less common.
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }

    // UPDATED PNG DOWNLOAD LISTENER
    if (downloadPngButton) {
        downloadPngButton.addEventListener('click', async () => { 
            const highResWidth = 1024; 
            const highResHeight = 1024; 

            console.log("Preparing HD PNG download...");
            if (updateQrButton) { // Disable button if it exists
                updateQrButton.disabled = true; 
                updateQrButton.textContent = 'Preparing HD PNG...';
            }
            if (downloadSvgButton) downloadSvgButton.disabled = true;
            if (downloadPngButton) downloadPngButton.disabled = true;


            try {
                // Get all current options to re-apply with new dimensions
                const currentOptions = qrCodeInstance._options; // Access internal options (use with caution or check official API)
                                                                // Or rebuild options object as in updateQRCodeView
                
                const highResOptions = {
                    ...currentOptions, // Spread existing options
                    width: highResWidth,
                    height: highResHeight,
                    type: 'png', // Ensure type is png for this operation
                    data: qrDataInput.value || "https://qodeo.pro", // Make sure data is current
                    image: currentLogoBase64 || '', // Make sure image is current
                    dotsOptions: {
                        ...currentOptions.dotsOptions,
                        color: dotColorInput.value,
                        type: dotStyleSelect.value
                    },
                    backgroundOptions: {
                        ...currentOptions.backgroundOptions,
                        color: backgroundColorInput.value
                    },
                    imageOptions: { // Make sure image options are current
                        ...currentOptions.imageOptions,
                        hideBackgroundDots: true, // Ensure this is set
                        margin: 10,
                        imageSize: 0.35
                    }
                };
                
                // Create a new temporary instance for HD download to avoid messing with preview instance directly before download
                const tempQrInstance = new QRCodeStyling(highResOptions);
                
                // Small delay may not be needed if download is direct from new instance
                // await new Promise(resolve => setTimeout(resolve, 100));

                await tempQrInstance.download({ 
                    name: `qodeo-qr-${highResWidth}x${highResHeight}`, 
                    extension: 'png' 
                });

                console.log("HD PNG Download triggered.");

            } catch (error) {
                console.error("Error during HD PNG download:", error);
                alert("Could not generate HD PNG. Please try again.");
            } finally {
                // No need to revert instance if we used a temporary one.
                // Re-enable buttons
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