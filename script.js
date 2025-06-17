document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
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
    const yearSpan = document.getElementById('year');

    const qrDataUrlInput = document.getElementById('qrDataUrl');
    const qrDataTextInput = document.getElementById('qrDataText');
    const qrEmailToInput = document.getElementById('qrEmailTo');
    const qrEmailSubjectInput = document.getElementById('qrEmailSubject');
    const qrEmailBodyInput = document.getElementById('qrEmailBody');
    const qrPhoneNumberInput = document.getElementById('qrPhoneNumber');

    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!qrDataUrlInput || !qrDataTextInput || !qrEmailToInput || !qrPhoneNumberInput || !updateQrButton || tabLinks.length === 0 || tabContents.length === 0 || !qrCanvasContainer) {
        console.error("Critical UI elements missing.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: UI elements missing.</p>";
        return; 
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let activeQrDataInput = qrDataUrlInput; 
    let currentActiveTabId = 'urlTab'; 

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded.");
        if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red;'>Error: QR Library not loaded.</p>";
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

    function switchTab(targetTabId) {
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));

        const activeTabButton = document.querySelector(`.tab-link[data-tab="${targetTabId}"]`);
        const activeTabContent = document.getElementById(targetTabId);

        if (activeTabButton) activeTabButton.classList.add('active');
        if (activeTabContent) activeTabContent.classList.add('active');
        currentActiveTabId = targetTabId; 

        switch (currentActiveTabId) {
            case 'urlTab':    activeQrDataInput = qrDataUrlInput; break;
            case 'textTab':   activeQrDataInput = qrDataTextInput; break;
            case 'emailTab':  activeQrDataInput = qrEmailToInput; break; 
            case 'phoneTab':  activeQrDataInput = qrPhoneNumberInput; break;
            default: activeQrDataInput = qrDataUrlInput;
        }
        updateQRCodeView(); 
    }

    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
    
    function getQrDataString() {
        let dataString = "";
        switch (currentActiveTabId) { 
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
                if (to) { 
                    dataString = `mailto:${encodeURIComponent(to)}`; // Encode 'to' as well
                    if (subject) dataString += `?subject=${encodeURIComponent(subject)}`;
                    if (body) dataString += (subject ? '&' : '?') + `body=${encodeURIComponent(body)}`;
                } else { dataString = "recipient@example.com"; }
                break;
            case 'phoneTab':
                dataString = `tel:${qrPhoneNumberInput.value || "+1234567890"}`;
                break;
            default: dataString = qrDataUrlInput.value || "https://qodeo.pro";
        }
        return dataString;
    }

    async function updateQRCodeView() {
        if (!updateQrButton || !activeQrDataInput) return; 
        updateQrButton.disabled = true;
        updateQrButton.textContent = 'Generating...';
        const currentData = getQrDataString(); 
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

    if (logoUploadInput) { 
        logoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentLogoBase64 = e.target.result;
                    if (logoPreview) { logoPreview.src = e.target.result; logoPreview.style.display = 'block'; }
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

    if (downloadSvgButton) { 
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataString();
            qrCodeInstance.update({data: dataForDownload}); 
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) { 
        downloadPngButton.addEventListener('click', async () => { 
            const highResWidth = 1024; const highResHeight = 1024; 
            if (updateQrButton) { updateQrButton.disabled = true; updateQrButton.textContent = 'Preparing HD PNG...';}
            if (downloadSvgButton) downloadSvgButton.disabled = true;
            if (downloadPngButton) downloadPngButton.disabled = true;
            try {
                const currentOptions = qrCodeInstance._options;
                const dataForDownload = getQrDataString(); 
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

    switchTab(currentActiveTabId); 
});