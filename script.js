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
    const qrWifiHiddenCheckbox = document.getElementById('qrWifiHidden'); // New for Wi-Fi
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
    // Location Inputs
    const qrLocationLatitudeInput = document.getElementById('qrLocationLatitude');
    const qrLocationLongitudeInput = document.getElementById('qrLocationLongitude');
    const qrLocationQueryInput = document.getElementById('qrLocationQuery');
    // Event Inputs
    const qrEventSummaryInput = document.getElementById('qrEventSummary');
    const qrEventLocationInput = document.getElementById('qrEventLocation');
    const qrEventDtStartInput = document.getElementById('qrEventDtStart');
    const qrEventDtEndInput = document.getElementById('qrEventDtEnd');
    const qrEventDescriptionInput = document.getElementById('qrEventDescription');

    const qrTypeButtons = document.querySelectorAll('.qr-type-button');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');

    if (!qrDataUrlInput || !generateQrMainButton || qrTypeButtons.length === 0 || !qrCanvasContainer || !inputAreaTitle) {
        console.error("Core UI elements missing."); if(generateQrMainButton) generateQrMainButton.disabled = true; return; 
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    let currentLogoBase64 = null;
    let currentQrType = 'url'; 
    // No need for currentQrDataInputs object anymore, we'll get values directly

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded."); if(generateQrMainButton) generateQrMainButton.disabled = true; return;
    }

    const previewQrWidth = 250; const previewQrHeight = 250; 
    const qrCodeInstance = new QRCodeStyling({
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: qrDataUrlInput.value || "https://qodeo.pro", image: '',
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
        // Set title based on selected type
        const selectedButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        if (selectedButton && selectedButton.querySelector('span')) {
            title = `Enter details for ${selectedButton.querySelector('span').textContent} QR`;
        } else { // Fallback titles
            switch (selectedType) {
                case 'url': title = 'Enter your Website URL'; break;
                case 'text': title = 'Enter your Text'; break;
                case 'email': title = 'Create an Email QR Code'; break;
                case 'phone': title = 'Enter Phone Number'; break;
                case 'sms': title = 'Create an SMS QR Code'; break;
                case 'wifi': title = 'Setup Wi-Fi Access QR'; break;
                case 'vcard': title = 'Create a Contact Card (vCard)'; break;
                case 'location': title = 'Enter Geolocation Coordinates'; break;
                case 'event': title = 'Create a Calendar Event QR'; break;
                default: title = 'Enter your Data';
            }
        }
        inputAreaTitle.textContent = title;
        generateQRCodePreview(); // Update QR with default/empty values for new type
    }

    qrTypeButtons.forEach(button => {
        button.addEventListener('click', () => { switchQrType(button.dataset.type); });
    });
    
    function getQrDataStringForInstance() {
        let dataString = "";
        switch (currentQrType) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email':
                const to = qrEmailToInput.value;
                if (!to && !qrEmailSubjectInput.value && !qrEmailBodyInput.value) { dataString = "mailto:info@example.com?subject=Inquiry&body=Hello"; break; }
                if (!to) { alert("Please enter 'To Email Address'."); return null; }
                dataString = `mailto:${encodeURIComponent(to)}`;
                if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`;
                if (qrEmailBodyInput.value) dataString += (qrEmailSubjectInput.value ? '&' : '?') + `body=${encodeURIComponent(qrEmailBodyInput.value)}`;
                break;
            case 'phone':
                const phoneNum = qrPhoneNumberInput.value;
                if (!phoneNum) { alert("Please enter a Phone Number."); return null; }
                dataString = `tel:${phoneNum}`; break;
            case 'sms':
                const smsNum = qrSmsNumberInput.value;
                if (!smsNum && !qrSmsMessageInput.value) { dataString = "smsto:12345?body=Hello"; break; }
                if (!smsNum) { alert("Please enter Phone Number for SMS."); return null; }
                dataString = `smsto:${smsNum}`;
                if (qrSmsMessageInput.value) dataString += `:${encodeURIComponent(qrSmsMessageInput.value)}`;
                break;
            case 'wifi':
                const ssid = qrWifiSsidInput.value;
                const password = qrWifiPasswordInput.value;
                const encryption = qrWifiEncryptionSelect.value;
                const hidden = qrWifiHiddenCheckbox.checked ? 'true' : 'false';
                if (!ssid) { alert("Please enter Network Name (SSID)."); return null; }
                dataString = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};;`; break;
            case 'vcard':
                const fn = vcardFormattedNameInput.value; 
                if (!fn) { alert("Please enter 'Display Name' for vCard."); return null; }
                dataString = "BEGIN:VCARD\nVERSION:3.0\n";
                dataString += `N:${vcardLastNameInput.value || ''};${vcardFirstNameInput.value || ''}\n`;
                dataString += `FN:${fn}\n`;
                if (vcardOrganizationInput.value) dataString += `ORG:${vcardOrganizationInput.value}\n`;
                if (vcardJobTitleInput.value) dataString += `TITLE:${vcardJobTitleInput.value}\n`;
                if (vcardPhoneMobileInput.value) dataString += `TEL;TYPE=CELL,VOICE:${vcardPhoneMobileInput.value}\n`;
                if (vcardPhoneWorkInput.value) dataString += `TEL;TYPE=WORK,VOICE:${vcardPhoneWorkInput.value}\n`;
                if (vcardEmailInput.value) dataString += `EMAIL:${vcardEmailInput.value}\n`;
                if (vcardWebsiteInput.value) dataString += `URL:${vcardWebsiteInput.value}\n`;
                if (vcardAdrStreetInput.value || vcardAdrCityInput.value || vcardAdrRegionInput.value || vcardAdrPostcodeInput.value || vcardAdrCountryInput.value) {
                    dataString += `ADR;TYPE=HOME:;;${vcardAdrStreetInput.value || ''};${vcardAdrCityInput.value || ''};${vcardAdrRegionInput.value || ''};${vcardAdrPostcodeInput.value || ''};${vcardAdrCountryInput.value || ''}\n`;
                }
                if (vcardNoteInput.value) dataString += `NOTE:${vcardNoteInput.value}\n`;
                dataString += "END:VCARD";
                break;
            case 'location':
                const lat = qrLocationLatitudeInput.value;
                const lon = qrLocationLongitudeInput.value;
                const query = qrLocationQueryInput.value;
                if (!lat || !lon) { alert("Please enter Latitude and Longitude."); return null; }
                dataString = `geo:${lat},${lon}`;
                if (query) dataString += `?q=${encodeURIComponent(query)}`;
                break;
            case 'event':
                const summary = qrEventSummaryInput.value;
                const dtstart = qrEventDtStartInput.value;
                const dtend = qrEventDtEndInput.value;
                if (!summary || !dtstart || !dtend) { alert("Please fill Event Summary, Start, and End Date/Time."); return null; }
                // Convert yyyy-MM-ddThh:mm to yyyyMMddThhmmssZ (UTC) or without Z for local
                // For simplicity, we'll assume local time. Proper UTC conversion is more complex.
                const formatDateTime = (datetime) => datetime ? datetime.replace(/[-:]/g, '').replace('T', 'T') + '00' : '';
                dataString = "BEGIN:VEVENT\n";
                dataString += `SUMMARY:${summary}\n`;
                dataString += `DTSTART:${formatDateTime(dtstart)}\n`;
                dataString += `DTEND:${formatDateTime(dtend)}\n`;
                if (qrEventLocationInput.value) dataString += `LOCATION:${qrEventLocationInput.value}\n`;
                if (qrEventDescriptionInput.value) dataString += `DESCRIPTION:${qrEventDescriptionInput.value}\n`;
                dataString += "END:VEVENT";
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