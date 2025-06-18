document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // (Saare DOM element const declarations waise hi rahenge jaise pichle "vCard add karne wale" script mein the)
    // Ensure all input field IDs used below are declared here
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
    const qrEmailToInput = document.getElementById('qrEmailTo');
    const qrEmailSubjectInput = document.getElementById('qrEmailSubject');
    const qrEmailBodyInput = document.getElementById('qrEmailBody');
    const qrPhoneNumberInput = document.getElementById('qrPhoneNumber');
    const qrSmsNumberInput = document.getElementById('qrSmsNumber');
    const qrSmsMessageInput = document.getElementById('qrSmsMessage');
    const qrWifiSsidInput = document.getElementById('qrWifiSsid');
    const qrWifiPasswordInput = document.getElementById('qrWifiPassword');
    const qrWifiEncryptionSelect = document.getElementById('qrWifiEncryption');
    const qrWifiHiddenCheckbox = document.getElementById('qrWifiHidden');
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
    const qrLocationLatitudeInput = document.getElementById('qrLocationLatitude');
    const qrLocationLongitudeInput = document.getElementById('qrLocationLongitude');
    const qrLocationQueryInput = document.getElementById('qrLocationQuery');
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

    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling library not loaded."); if(generateQrMainButton) generateQrMainButton.disabled = true; return;
    }

    const previewQrWidth = 250; const previewQrHeight = 250; 
    const qrCodeInstance = new QRCodeStyling({ /* ... (Instance options same) ... */
        width: previewQrWidth, height: previewQrHeight, type: 'svg',
        data: "https://qodeo.pro", image: '',
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.35, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' }
    });
    qrCodeInstance.append(qrCanvasContainer);

    // --- Function to switch QR type and display relevant inputs ---
    function switchQrType(selectedType) {
        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active')); 

        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroupDiv = document.getElementById(`${selectedType}Inputs`);

        if (activeButton) activeButton.classList.add('active');
        if (activeInputGroupDiv) {
            activeInputGroupDiv.classList.add('active');
        } else {
            console.warn(`Input group for type "${selectedType}" not found. Defaulting to URL.`);
            document.getElementById('urlInputs').classList.add('active'); // Fallback
            selectedType = 'url'; // Reset selected type
            const urlButton = document.querySelector(`.qr-type-button[data-type="url"]`);
            if (urlButton) urlButton.classList.add('active'); // Also activate URL button
        }
        
        currentQrType = selectedType; // Set the current type

        // Update title based on selected type
        let title = "Enter Data"; 
        const selectedButtonSpan = activeButton ? activeButton.querySelector('span') : null;
        if (selectedButtonSpan) {
            title = `Enter details for ${selectedButtonSpan.textContent} QR`;
        } else if (selectedType === 'url') { // Fallback titles if span not found
             title = 'Enter your Website URL';
        } // Add more else if for other titles if needed

        inputAreaTitle.textContent = title;
        
        // Generate a placeholder/default QR when tab switches
        let placeholderData = "https://qodeo.pro"; // Generic placeholder
        // You can set more specific placeholders per type here if desired
        if (selectedType === 'text') placeholderData = "Your sample text";
        else if (selectedType === 'email') placeholderData = "mailto:test@example.com";
        // ... and so on for other types

        qrCodeInstance.update({ data: placeholderData }); // Update preview with placeholder
        if(qrDataDisplay) qrDataDisplay.textContent = `Switched to ${selectedType.toUpperCase()}. Enter details and click Generate.`;
    }

    qrTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchQrType(button.dataset.type);
        });
    });
    
    // --- Function to prepare data string based on active type ---
    function getQrDataStringForInstance() {
        let dataString = "";
        // Ensure all input consts are defined at the top of the script
        switch (currentQrType) {
            case 'url': dataString = qrDataUrlInput.value || "https://qodeo.pro"; break;
            case 'text': dataString = qrDataTextInput.value || "Qodeo QR Text"; break;
            case 'email':
                const to = qrEmailToInput.value;
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
                if (!smsNum) { alert("Please enter Phone Number for SMS."); return null; }
                dataString = `smsto:${smsNum}`;
                if (qrSmsMessageInput.value) dataString += `:${encodeURIComponent(qrSmsMessageInput.value)}`;
                break;
            case 'wifi':
                const ssid = qrWifiSsidInput.value;
                if (!ssid) { alert("Please enter Network Name (SSID)."); return null; }
                const password = qrWifiPasswordInput.value;
                const encryption = qrWifiEncryptionSelect.value;
                const hidden = qrWifiHiddenCheckbox.checked ? 'true' : 'false';
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
                if (!lat || !lon) { alert("Please enter Latitude and Longitude."); return null; }
                const query = qrLocationQueryInput.value;
                dataString = `geo:${lat},${lon}`;
                if (query) dataString += `?q=${encodeURIComponent(query)}`;
                break;
            case 'event':
                const summary = qrEventSummaryInput.value;
                const dtstart = qrEventDtStartInput.value;
                const dtend = qrEventDtEndInput.value;
                if (!summary || !dtstart || !dtend) { alert("Please fill Event Summary, Start, and End Date/Time."); return null; }
                const formatDateTime = (datetime) => datetime ? datetime.replace(/[-:]/g, '').replace('T', 'T') + '00' : '';
                dataString = "BEGIN:VEVENT\n";
                dataString += `SUMMARY:${summary}\n`;
                dataString += `DTSTART:${formatDateTime(dtstart)}\n`;
                dataString += `DTEND:${formatDateTime(dtend)}\n`;
                if (qrEventLocationInput.value) dataString += `LOCATION:${qrEventLocationInput.value}\n`;
                if (qrEventDescriptionInput.value) dataString += `DESCRIPTION:${qrEventDescriptionInput.value}\n`;
                dataString += "END:VEVENT";
                break;
            default: dataString = "https://qodeo.pro"; // Fallback
        }
        return dataString;
    }

    async function generateQRCodePreview() {
        if (!generateQrMainButton) return; 
        
        // Perform validation for the current active type BEFORE getting data string
        let validationPassed = true;
        switch (currentQrType) {
            case 'email': if (!qrEmailToInput.value) { alert("Please enter 'To Email Address'."); validationPassed = false; } break;
            case 'phone': if (!qrPhoneNumberInput.value) { alert("Please enter a Phone Number."); validationPassed = false; } break;
            case 'sms': if (!qrSmsNumberInput.value) { alert("Please enter Phone Number for SMS."); validationPassed = false; } break;
            case 'wifi': if (!qrWifiSsidInput.value) { alert("Please enter Network Name (SSID)."); validationPassed = false; } break;
            case 'vcard': if (!vcardFormattedNameInput.value) { alert("Please enter 'Display Name' for vCard."); validationPassed = false; } break;
            case 'location': if (!qrLocationLatitudeInput.value || !qrLocationLongitudeInput.value) { alert("Please enter Latitude and Longitude."); validationPassed = false; } break;
            case 'event': if (!qrEventSummaryInput.value || !qrEventDtStartInput.value || !qrEventDtEndInput.value) { alert("Please fill Event Summary, Start, and End Date/Time."); validationPassed = false; } break;
        }
        if (!validationPassed) return; // Stop if validation fails

        const dataForQr = getQrDataStringForInstance();
        // dataForQr should not be null here if validation passed.
        // if (dataForQr === null) { ... this part can be removed or simplified }

        generateQrMainButton.disabled = true; generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        const options = { /* ... (options object is same) ... */
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
        } catch (error) { /* ... (error handling same) ... */
            console.error("Error updating QR Code:", error);
            if(qrCanvasContainer) qrCanvasContainer.innerHTML = "<p style='color:red; font-size:small;'>Error updating QR.</p>";
            if (qrDataDisplay) qrDataDisplay.textContent = 'Error!'; 
        } finally { /* ... (finally block same) ... */
            if(generateQrMainButton) {generateQrMainButton.disabled = false; generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';}
        }
    }

    if (logoUploadInput) { /* ... (logo upload logic same) ... */ 
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

    if (downloadSvgButton) { /* ... (SVG download logic same, ensure dataForDownload is validated) ... */ 
        downloadSvgButton.addEventListener('click', () => {
            const dataForDownload = getQrDataStringForInstance(); if (dataForDownload === null) return;
            qrCodeInstance.update({data: dataForDownload}); 
            qrCodeInstance.download({ name: 'qodeo-qr', extension: 'svg' });
        });
    }
    if (downloadPngButton) { /* ... (PNG download logic same, ensure dataForDownload is validated) ... */ 
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
    
    // Initialize the first tab (URL) on page load
    if (qrTypeButtons.length > 0) {
        switchQrType('url'); 
    }
});