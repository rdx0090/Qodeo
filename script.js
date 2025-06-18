// script.js

    // ... (baaki saara code upar tak waisa hi) ...

    function getQrDataStringForInstance() {
        let dataString = "";
        // Har case ke andar hi uske specific inputs ko access karein aur validate karein
        switch (currentQrType) {
            case 'url':
                dataString = qrDataUrlInput.value || "https://qodeo.pro";
                break;
            case 'text':
                dataString = qrDataTextInput.value || "Qodeo QR Text";
                break;
            case 'email':
                const to = qrEmailToInput.value;
                // Default if all email fields are empty, otherwise validate 'to'
                if (!to && !qrEmailSubjectInput.value && !qrEmailBodyInput.value) { 
                    dataString = "mailto:info@example.com?subject=Inquiry&body=Hello"; 
                    break; 
                }
                if (!to) { 
                    // alert("Please enter 'To Email Address' for Email QR."); // Alert ko abhi generate button par rakhenge
                    console.warn("Email 'To' field is empty.");
                    return ""; // Return empty or a default, or null to indicate error
                }
                dataString = `mailto:${encodeURIComponent(to)}`;
                if (qrEmailSubjectInput.value) dataString += `?subject=${encodeURIComponent(qrEmailSubjectInput.value)}`;
                if (qrEmailBodyInput.value) dataString += (qrEmailSubjectInput.value ? '&' : '?') + `body=${encodeURIComponent(qrEmailBodyInput.value)}`;
                break;
            case 'phone':
                const phoneNum = qrPhoneNumberInput.value;
                if (!phoneNum) { 
                    // alert("Please enter a Phone Number for Phone QR."); 
                    console.warn("Phone number field is empty.");
                    return "";
                }
                dataString = `tel:${phoneNum}`; break;
            case 'sms':
                const smsNum = qrSmsNumberInput.value;
                if (!smsNum && !qrSmsMessageInput.value) { dataString = "smsto:12345?body=Hello"; break; }
                if (!smsNum) { 
                    // alert("Please enter Phone Number for SMS QR."); 
                    console.warn("SMS number field is empty.");
                    return "";
                }
                dataString = `smsto:${smsNum}`;
                if (qrSmsMessageInput.value) dataString += `:${encodeURIComponent(qrSmsMessageInput.value)}`;
                break;
            case 'wifi':
                const ssid = qrWifiSsidInput.value;
                if (!ssid) { 
                    // alert("Please enter Network Name (SSID) for Wi-Fi QR."); 
                    console.warn("Wi-Fi SSID field is empty.");
                    return "";
                }
                const password = qrWifiPasswordInput.value;
                const encryption = qrWifiEncryptionSelect.value;
                const hidden = qrWifiHiddenCheckbox.checked ? 'true' : 'false';
                dataString = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};;`; break;
            case 'vcard':
                const fn = vcardFormattedNameInput.value; 
                // IMPORTANT: This validation should only run when vCard is the *intended* type for generation,
                // not just because it's the current tab when switching TO another tab.
                // The alert will be moved to the generateQRCodePreview function.
                if (!fn && generateQrMainButton.disabled) { // Check if it's during an actual generation attempt
                    // This condition might be too broad. Let's handle validation in generateQRCodePreview.
                }
                dataString = "BEGIN:VCARD\nVERSION:3.0\n";
                dataString += `N:${vcardLastNameInput.value || ''};${vcardFirstNameInput.value || ''}\n`;
                dataString += `FN:${fn || (vcardFirstNameInput.value + " " + vcardLastNameInput.value).trim() || 'No Name'}\n`; // Fallback for FN
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
                if (!lat || !lon) { 
                    // alert("Please enter Latitude and Longitude."); 
                    console.warn("Location lat/lon fields are empty.");
                    return "";
                }
                const query = qrLocationQueryInput.value;
                dataString = `geo:${lat},${lon}`;
                if (query) dataString += `?q=${encodeURIComponent(query)}`;
                break;
            case 'event':
                const summary = qrEventSummaryInput.value;
                const dtstart = qrEventDtStartInput.value;
                const dtend = qrEventDtEndInput.value;
                if (!summary || !dtstart || !dtend) { 
                    // alert("Please fill Event Summary, Start, and End Date/Time."); 
                    console.warn("Event fields are empty.");
                    return ""; // Return empty or default, validation at generation.
                }
                const formatDateTime = (datetime) => datetime ? datetime.replace(/[-:]/g, '').replace('T', 'T') + '00' : '';
                dataString = "BEGIN:VEVENT\n";
                dataString += `SUMMARY:${summary}\n`;
                dataString += `DTSTART:${formatDateTime(dtstart)}\n`;
                dataString += `DTEND:${formatDateTime(dtend)}\n`;
                if (qrEventLocationInput.value) dataString += `LOCATION:${qrEventLocationInput.value}\n`;
                if (qrEventDescriptionInput.value) dataString += `DESCRIPTION:${qrEventDescriptionInput.value}\n`;
                dataString += "END:VEVENT";
                break;
            default: dataString = qrDataUrlInput.value || "https://qodeo.pro";
        }
        return dataString;
    }

    // --- Update QR Code Function (generateQRCodePreview) ---
    async function generateQRCodePreview() {
        if (!generateQrMainButton) return; 

        // VALIDATION MOVED HERE - specific to the currentQrType
        if (currentQrType === 'vcard' && !vcardFormattedNameInput.value) {
            alert("Please enter 'Display Name' for vCard.");
            return; // Stop if validation fails
        }
        if (currentQrType === 'email' && !qrEmailToInput.value) {
            alert("Please enter 'To Email Address' for Email QR.");
            return;
        }
        if (currentQrType === 'phone' && !qrPhoneNumberInput.value) {
            alert("Please enter a Phone Number for Phone QR.");
            return;
        }
        if (currentQrType === 'sms' && !qrSmsNumberInput.value) {
            alert("Please enter Phone Number for SMS QR.");
            return;
        }
        if (currentQrType === 'wifi' && !qrWifiSsidInput.value) {
            alert("Please enter Network Name (SSID) for Wi-Fi QR.");
            return;
        }
        if (currentQrType === 'location' && (!qrLocationLatitudeInput.value || !qrLocationLongitudeInput.value)) {
            alert("Please enter Latitude and Longitude for Location QR.");
            return;
        }
        if (currentQrType === 'event' && (!qrEventSummaryInput.value || !qrEventDtStartInput.value || !qrEventDtEndInput.value)) {
            alert("Please fill Event Summary, Start, and End Date/Time for Event QR.");
            return;
        }
        // Add more validations for other types as needed


        const dataForQr = getQrDataStringForInstance();
        // The null check from getQrDataStringForInstance might still be useful for very basic checks,
        // but primary validation is now above.
        if (dataForQr === null || dataForQr === "") { 
            // This condition might now only catch cases where getQrDataStringForInstance returns empty for non-validated types
            // or if a non-validated type somehow has no default and returns ""
            console.warn("Data for QR is empty or null after validation pass, using default for preview.");
            // generateQrMainButton.disabled = false; // Button state handled in finally
            // generateQrMainButton.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
            // qrCodeInstance.update({ data: "https://qodeo.pro/error-default" }); // Update with a default/error QR
            // if (qrDataDisplay) qrDataDisplay.textContent = "Please fill required fields.";
            // return;
        }


        generateQrMainButton.disabled = true; 
        generateQrMainButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        // ... (options object and rest of the try-catch-finally block remains the same) ...
        const options = {
            data: dataForQr || "https://qodeo.pro/empty-data", // Fallback if dataForQr is still empty
            width: previewQrWidth, height: previewQrHeight, image: currentLogoBase64 || '',
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
    
    // In switchQrType function, remove the direct call to generateQRCodePreview
    // and instead just set up the UI. The preview will be generated when user clicks the main button.
    // OR, if you want preview on tab switch, ensure generateQRCodePreview doesn't run strict validation then.

    // Revised switchQrType for clarity
    function switchQrType(selectedType) {
        qrTypeButtons.forEach(btn => btn.classList.remove('active'));
        qrInputGroups.forEach(group => group.classList.remove('active'));

        const activeButton = document.querySelector(`.qr-type-button[data-type="${selectedType}"]`);
        const activeInputGroup = document.getElementById(`${selectedType}Inputs`);

        if (activeButton) activeButton.classList.add('active');
        if (activeInputGroup) activeInputGroup.classList.add('active');
        
        currentQrType = selectedType;
        let title = "Enter Data"; // Default title
        const selectedButtonSpan = activeButton ? activeButton.querySelector('span') : null;
        if (selectedButtonSpan) {
            title = `Enter details for ${selectedButtonSpan.textContent} QR`;
        }
        inputAreaTitle.textContent = title;

        // OPTION 1: Generate a placeholder/default QR when tab switches (without strict validation)
        let placeholderData = "https://qodeo.pro"; // Generic placeholder
        // You could set more specific placeholders per type if desired
        qrCodeInstance.update({ data: placeholderData });
        if(qrDataDisplay) qrDataDisplay.textContent = `Switched to ${selectedType.toUpperCase()}. Enter details and click Generate.`;


        // OPTION 2: Don't auto-generate on tab switch. User must click "Generate QR Code".
        // In this case, remove the qrCodeInstance.update() call above.
        // The generateQRCodePreview() function (which has validation) will be called by the main button.
    }


    // Initial setup
    if (qrTypeButtons.length > 0) {
        switchQrType(qrTypeButtons[0].dataset.type); // Activate the first tab (URL)
    } else {
        console.error("No QR type buttons found to initialize.");
    }
    // The initial call to generateQRCodePreview() at the end of DOMContentLoaded might also trigger validation
    // We should ensure it uses a safe default or that validation is only for explicit generation.
    // generateQRCodePreview(); // Initial call on page load (now handled by switchQrType)
    
    // ... (baaki saara code neeche tak (download handlers etc.) waisa hi) ...
});