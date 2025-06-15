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

    // Check if essential elements are present
    if (!qrDataInput || !dotColorInput || !backgroundColorInput || !dotStyleSelect || !updateQrButton || !qrCanvasContainer) {
        console.error("One or more critical UI elements are missing. Qodeo cannot initialize properly.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: Critical UI elements missing. App cannot run.</p>";
        return; // Stop execution
    }

    // Set current year in footer
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

    const qrCodeInstance = new QRCodeStyling({
        width: 280, 
        height: 280, 
        type: 'svg',
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

        const options = {
            data: qrDataInput.value || "https://qodeo.pro",
            dotsOptions: {
                color: dotColorInput.value,
                type: dotStyleSelect.value
            },
            backgroundOptions: {
                color: backgroundColorInput.value,
            },
            image: currentLogoBase64 || '',
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
        } catch (error) {
            console.error("Error updating QR Code:", error);
            if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error updating QR. Please try again.</p>";
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
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) {
        downloadPngButton.addEventListener('click', () => {
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'png' });
        });
    }

    updateQRCodeView();
});