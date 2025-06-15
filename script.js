document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const qrDataInput = document.getElementById('qrData');
    const dotColorInput = document.getElementById('dotColor');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const dotStyleSelect = document.getElementById('dotStyle');
    const logoUploadInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview'); // Logo preview element
    const updateQrButton = document.getElementById('updateQrButton');
    const downloadSvgButton = document.getElementById('downloadSvgButton');
    const downloadPngButton = document.getElementById('downloadPngButton');
    const qrCanvasContainer = document.getElementById('qrCanvasContainer'); // The div where QR will be appended
    
    document.getElementById('year').textContent = new Date().getFullYear();

    let currentLogoBase64 = null; // To store logo data

    // Check if QRCodeStyling is available
    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library is not loaded. Make sure the script tag in HTML is correct.");
        qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: QR Library not loaded. Check internet connection or script link in HTML.</p>";
        return; // Stop execution if library not found
    }

    // Initialize QR Code Styling instance
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
            margin: 10, // Increased margin for logo
            imageSize: 0.35 // Slightly larger logo
        },
        qrOptions: {
            errorCorrectionLevel: 'H' 
        }
    });

    // Append the QR code to the designated div
    qrCodeInstance.append(qrCanvasContainer);

    // Function to update QR code with current settings from UI
    function updateQRCodeView() {
        if (!qrDataInput || !dotColorInput || !backgroundColorInput || !dotStyleSelect) {
            console.error("One or more UI elements not found for updating QR code.");
            return;
        }
        
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
            imageOptions: { // Ensure imageOptions are re-applied on update
                crossOrigin: 'anonymous',
                margin: 10,
                imageSize: 0.35,
                hideBackgroundDots: true // Hides QR dots behind the logo for clarity
            }
        };
        qrCodeInstance.update(options);
    }

    // Event Listener for Logo Upload
    if (logoUploadInput) {
        logoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentLogoBase64 = e.target.result; 
                    if(logoPreview) {
                        logoPreview.src = e.target.result; 
                        logoPreview.style.display = 'block';
                    }
                    // Uncomment if you want auto-update on logo select, otherwise user clicks button
                    // updateQRCodeView(); 
                };
                reader.onerror = function() {
                    console.error("Error reading file for logo.");
                    alert("Could not load the logo file.");
                };
                reader.readAsDataURL(file);
            } else {
                currentLogoBase64 = null; 
                if(logoPreview) {
                    logoPreview.src = "#";
                    logoPreview.style.display = 'none';
                }
                // updateQRCodeView(); 
            }
        });
    }


    // Event Listener for Update Button
    if (updateQrButton) {
        updateQrButton.addEventListener('click', updateQRCodeView);
    }

    // Download Handlers
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

    // Initial QR code generation on page load (if elements exist)
    if (qrDataInput && dotColorInput && backgroundColorInput && dotStyleSelect) {
         updateQRCodeView(); 
    } else {
        console.warn("Initial QR generation skipped as some UI elements are missing.");
    }
});