document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
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
    // vCard Inputs
    const vcardFirstNameInput = document.getElementById('vcardFirstName');
    const vcardLastNameInput = document.getElementById('vcardLastName');
    const vcardFormattedNameInput = document.getElementById('vcardFormattedName');
    const vcardPhoneMobileInput = document.getElementById('vcardPhoneMobile');
    const vcardPhoneWorkInput = document.getElementById('vcardPhoneWork');
    const vcardEmailInput = document.getElementById('vcardEmail');
    const vcardWebsiteInput = document.getElementById('vcardWebsite');
    const vcardOrganizationInput = document.getElementById('vcardOrganization');
    const vcardJobTitleInput = document.getElementById('vcardJobTitle');
    const vcardAdrStreetInput = document.getElementById('vcardAdrStreet');
    const vcardAdrCityInput = document.getElementById('vcardAdrCity');
    const vcardAdrRegionInput = document.getElementById('vcardAdrRegion');
    const vcardAdrPostcodeInput = document.getElementById('vcardAdrPostcode');
    const vcardAdrCountryInput = document.getElementById('vcardAdrCountry');
    const vcardNoteInput = document.getElementById('vcardNote');

    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');

    if (!qrDataUrlInput || !generateQrMainButton || qrTypeButtons.length === 0 || !qrCanvasContainer || !inputAreaTitle) {
        console.error("Core UI elements missing.");
        if(generateQrMainButton) generateQrMainButton.disabled = true; return; 
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; 
    let currentQrDataInputs = { main: qrDataUrlInput };

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded.");
        if(generateQrMainButton) generateQrMainButton.disabled = true; return;
    }

    const previewQrWidth = 250; const previewQrHeight = 250; 
    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: currentQrDataInputs.main.value || "https://qodeo.pro", image: '',
        dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value },
        backgroundOptions: { color: backgroundColorInput.value },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    qrCodeInstance.append(qrCanvasContainer);

    function switchQrType(selectedType) {
        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active'));
        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroup = document.getElementById(`${selectedType}Inputs`);
        if (activeButton) activeButton.classList.add('active');
        if (activeInputGroup) activeInputGroup.classList.add('active');
        currentQrType = selectedType;
        let title = "Enter your Data";
        switch (selectedType) {
            case 'url': title = 'Enter your Website URL'; currentQrDataInputs = { main: qrDataUrlInput }; break;
            case 'text': title = 'Enter your Text'; currentQrDataInputs = { main: qrDataTextInput }; break;
            case 'email': title = 'Create an Email QR Code'; currentQrDataInputs = { to: qrEmailToInput, subject: qrEmailSubjectInput, body: qrEmailBodyInput }; break;
            case 'phone': title = 'Enter Phone Number'; currentQrDataInputs = { main: qrPhoneNumberInput }; break;
            case 'sms': title = 'Create an SMS QR Code'; currentQrDataInputs = { number: qrSmsNumberInput, message: qrSmsMessageInput }; break;
            case 'wifi': title = 'Setup Wi-Fi Access QR'; currentQrDataInputs = { ssid: qrWifiSsidInput, password: qrWifiPasswordInput, encryption: qrWifiEncryptionSelect }; break;
            case 'vcard': title = 'Create a Contact Card (vCard)'; currentQrDataInputs = { /* Will be set by specific vCard fields */ formattedName: vcardFormattedNameInput, firstName: vcardFirstNameInput, lastName: vcardLastNameInput, phoneMobile: vcardPhoneMobileInput, phoneWork: vcardPhoneWorkInput, email: vcardEmailInput, website: vcardWebsiteInput, organization: vcardOrganizationInput, jobTitle: vcardJobTitleInput, adrStreet: vcardAdrStreetInput, adrCity: vcardAdrCityInput, adrRegion: vcardAdrRegionInput, adrPostcode: vcardAdrPostcodeInput, adrCountry: vcardAdrCountryInput, note: vcardNoteInput }; break;
            // Add cases for location etc.
            default: title = 'Enter your Website URL'; currentQrDataInputs = { main: qrDataUrlInput };
        }
        inputAreaTitle.textContent = title;
        // generateQRCodePreview(); // Update QR with default/empty values for new type
    }

    qrTypeButtons.forEach(button => {
        button.addEventListener('click', () => { switchQrType(button.dataset.type); });
    });
    
    function getQrDataStringForInstance() {
        let dataString = "";
        switch (currentQrType) {
            case 'url': dataString = currentQrDataInputs.main.value || "https://qodeo.pro"; break;
            case 'text': dataString = currentQrDataInputs.main.value || "Qodeo QR Text"; break;
            case 'email':
                const to = currentQrDataInputs.to.value;
                if (!to && !currentQrDataInputs.subject.value && !currentQrDataInputs.body.value) { dataString = "mailto:info@example.com?subject=Inquiry&body=Hello"; break; } // Default if all empty
                if (!to) { alert("Please enter 'To Email Address' for Email QR."); return null; }
                dataString = `mailto:${encodeURIComponent(to)}`;
                if (currentQrDataInputs.subject.value) dataString += `?subject=${encodeURIComponent(currentQrDataInputs.subject.value)}`;
                if (currentQrDataInputs.body.value) dataString += (currentQrDataInputs.subject.value ? '&' : '?') + `body=${encodeURIComponent(currentQrDataInputs.body.value)}`;
                break;
            case 'phone':
                const phoneNum = currentQrDataInputs.main.value;
                if (!phoneNum) { alert("Please enter a Phone Number for Phone QR."); return null; }
                dataString = `tel:${phoneNum}`; break;
            case 'sms':
                const smsNum = currentQrDataInputs.number.value;
                if (!smsNum && !currentQrDataInputs.message.value) { dataString = "smsto:12345?body=Hello"; break; }
                if (!smsNum) { alert("Please enter Phone Number for SMS QR."); return null; }
                dataString = `smsto:${smsNum}`;
                if (currentQrDataInputs.message.value) dataString += `:${encodeURIComponent(currentQrDataInputs.message.value)}`;
                break;
            case 'wifi':
                const ssid = currentQrDataInputs.ssid.value;
                const password = currentQrDataInputs.password.value;
                const encryption = currentQrDataInputs.encryption.value;
                if (!ssid) { alert("Please enter Network Name (SSID) for Wi-Fi QR."); return null; }
                dataString = `WIFI:T:${encryption};S:${ssid};P:${password};;`; break;
            case 'vcard':
                const fn = vcardFormattedNameInput.value; // Formatted Name is usually N and FN
                if (!fn) { alert("Please enter 'Display Name' for vCard."); return null; }
                dataString = "BEGIN:VCARD\nVERSION:3.0\n";
                dataString += `N:${vcardLastNameInput.value || ''};${vcardFirstNameInput.value || ''}\n`;
                dataString += `FN:${fn}\n`;
                if (vcardOrganizationInput.value) dataString += `ORG:${vcardOrganizationInput.value}\n`;
                if (vcardJobTitleInput.value) dataString += `TITLE:${vcardJobTitleInput.value}\n`;
                if (vcardPhoneMobileInput.value) dataString += `TEL;TYPE=CELL:${vcardPhoneMobileInput.value}\n`;
                if (vcardPhoneWorkInput.value) dataString += `TEL;TYPE=WORK:${vcardPhoneWorkInput.value}\n`;
                if (vcardEmailInput.value) dataString += `EMAIL:${vcardEmailInput.value}\n`;
                if (vcardWebsiteInput.value) dataString += `URL:${vcardWebsiteInput.value}\n`;
                if (vcardAdrStreetInput.value || vcardAdrCityInput.value || vcardAdrRegionInput.value || vcardAdrPostcodeInput.value || vcardAdrCountryInput.value) {
                    dataString += `ADR;TYPE=HOME:;;${vcardAdrStreetInput.value || ''};${vcardAdrCityInput.value || ''};${vcardAdrRegionInput.value || ''};${vcardAdrPostcodeInput.value || ''};${vcardAdrCountryInput.value || ''}\n`;
                }
                if (vcardNoteInput.value) dataString += `NOTE:${vcardNoteInput.value}\n`;
                dataString += "END:VCARD";
                break;
            default: dataString = "https://qodeo.pro";
        }
        return dataString;
    }

    async function generateQRCodePreview() {
        if (!generateQrMainButton) return; 
        const dataForQr = getQrDataStringForInstance();
        if (dataForQr === null) {
            if(generateQrMainButton) {generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';}
            return;
        }
        generateQrMainButton.disabled = true; generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        const options = {
            data: dataForQr, width: previewQrWidth, height: previewQrHeight, image: currentLogoBase64 || '',
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
            if(generateQrMainButton) {generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';}
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
        if (input) input.addEventListener('change', generateQRCodePreview);
    });

    if (downloadSvgButton) { 
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataStringForInstance(); if (dataForDownload === null) return;
            const currentPreviewOptions = { data: dataForDownload, dotsOptions: { color: dotColorInput.value, type: dotStyleSelect.value }, backgroundOptions: { color: backgroundColorInput.value }, image: currentLogoBase64 || '', imageOptions: qrCodeInstance._options.imageOptions, qrOptions: qrCodeInstance._options.qrOptions };
            qrCodeInstance.update(currentPreviewOptions);
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) { 
        downloadPngButton.addEventListener('click', async () => { 
            const dataForDownload = getQrDataStringForInstance(); if (dataForDownload === null) return;
            const highResWidth = 1024; const highResHeight = 1024; 
            if (generateQrMainButton) { generateQrMainButton.disabled = true; generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing HD...'; }
            if (downloadSvgButton) downloadSvgButton.disabled = true; if (downloadPngButton) downloadPngButton.disabled = true;
            try {
                const currentOptions = qrCodeInstance._options;
                const highResOptions = { ...currentOptions, width: highResWidth, height: highResHeight, type: 'png', data: dataForDownload, image: currentLogoBase64 || '', dotsOptions: { ...currentOptions.dotsOptions, color: dotColorInput.value, type: dotStyleSelect.value }, backgroundOptions: { ...currentOptions.backgroundOptions, color: backgroundColorInput.value }, imageOptions: { ...currentOptions.imageOptions, hideBackgroundDots: true } };
                const tempQrInstance = new QRCodeStyling(highResOptions);
                await tempQrInstance.download({ name: `qodeo-qr-${highResWidth}x${highResHeight}`, extension: 'png' });
            } catch (error) { console.error("Error during HD PNG download:", error); alert("Could not generate HD PNG.");
            } finally {
                if (generateQrMainButton) { generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code'; }
                if (downloadSvgButton) downloadSvgButton.disabled = false; if (downloadPngButton) downloadPngButton.disabled = false;
            }
        });
    }
    switchQrType(currentQrType); 
});