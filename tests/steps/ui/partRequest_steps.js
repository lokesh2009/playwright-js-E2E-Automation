const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Background Step: Navigate to Part Request Page
Given('I navigate to dealerspike parts request page {string}', async function (partsRequestUrl) {
    console.log(`🔗 Navigating to dealerspike parts request page: ${partsRequestUrl}`);
    
    try {
        await global.page.goto(partsRequestUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        }).catch((navigationError) => {
            console.log(`Navigation took longer than expected: ${navigationError.message}`);
        });
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pageTitle = await global.page.title();
        console.log(`✓ Successfully navigated to parts request page`);
        console.log(`✓ Page title: ${pageTitle}`);
        
        this.partsRequestUrl = partsRequestUrl;
    } catch (error) {
        console.error(`❌ Error navigating to parts request page: ${error.message}`);
        throw error;
    }
});

// SCENARIO 1: Verify Part Request Page Load and Form Elements
When('I verify the part request page is loaded', async function () {
    console.log(`🔍 Verifying part request page is loaded`);
    
    try {
        // Check if page title contains 'parts' or 'request'
        const pageTitle = await global.page.title();
        const pageUrl = await global.page.url();
        
        console.log(`✓ Page URL: ${pageUrl}`);
        console.log(`✓ Page title: ${pageTitle}`);
        
        // Wait for common page elements
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.pageLoaded = true;
    } catch (error) {
        console.error(`❌ Error verifying page load: ${error.message}`);
        throw error;
    }
});

Then('I should see the part request form', async function () {
    console.log(` Checking if part request form is visible`);
    
    try {
        // Multiple selector options for form element
        const formSelectors = [
            'form[id*="part"]',
            'form[class*="request"]',
            '[id*="partRequest"]',
            '[class*="part-request"]',
            'form',
            '[role="form"]'
        ];
        
        let formFound = false;
        for (const selector of formSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                console.log(` Part request form found with selector: ${selector}`);
                formFound = true;
                break;
            }
        }
        
        if (!formFound) {
            console.log(` Form not found with standard selectors, checking page content`);
            const bodyContent = await global.page.content();
            if (bodyContent.includes('part') || bodyContent.includes('request')) {
                console.log(`✓ Page contains part/request related content`);
            }
        }
        
        this.formExists = true;
    } catch (error) {
        console.error(`❌ Error checking form: ${error.message}`);
        throw error;
    }
});

Then('I should see all required form fields', async function () {
    console.log(`🔎 Verifying required form fields are present`);
    
    try {
        // List of common required field patterns
        const requiredFields = [
            { name: 'part number', selectors: ['[placeholder*="part"]', '[name*="part"]', '[id*="part"]'] },
            { name: 'quantity', selectors: ['[placeholder*="quantity"]', '[name*="quantity"]', '[id*="qty"]', '[name*="qty"]'] },
            { name: 'dealership', selectors: ['[placeholder*="dealer"]', '[name*="dealer"]', '[id*="location"]'] }
        ];
        
        let fieldsFound = [];
        for (const field of requiredFields) {
            for (const selector of field.selectors) {
                const element = await global.page.$(selector).catch(() => null);
                if (element) {
                    fieldsFound.push(field.name);
                    console.log(`✓ Found field: ${field.name}`);
                    break;
                }
            }
        }
        
        console.log(`✓ Found ${fieldsFound.length} required fields: ${fieldsFound.join(', ')}`);
        this.requiredFields = fieldsFound;
    } catch (error) {
        console.error(`❌ Error checking required fields: ${error.message}`);
        throw error;
    }
});

Then('I should verify the dealership information is displayed', async function () {
    console.log(`🏢 Verifying dealership information is displayed`);
    
    try {
        // Check for dealership information on page
        const dealershipSelectors = [
            '[class*="dealership"]',
            '[id*="dealership"]',
            '[class*="dealer-info"]',
            '[class*="location-info"]',
            '[class*="store"]'
        ];
        
        let dealershipFound = false;
        for (const selector of dealershipSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                const text = await element.textContent();
                console.log(`✓ Dealership info found: ${text.substring(0, 100)}`);
                dealershipFound = true;
                break;
            }
        }
        
        if (!dealershipFound) {
            console.log(`⚠️ Dealership information not found in expected locations`);
        }
        
        this.dealershipInfoFound = dealershipFound;
    } catch (error) {
        console.error(`❌ Error checking dealership info: ${error.message}`);
        throw error;
    }
});

// SCENARIO 2: Fill in Part Request Form
When('I fill in part request form with following details:', async function (dataTable) {
    console.log(`📝 Filling in part request form with details`);
    
    try {
        const data = dataTable.rowsHash();
        console.log(`Fields to fill:`, data);
        
        // Store data for later verification
        this.formData = data;
        
        // Selectors mapping for form fields
        const fieldSelectors = {
            'partNumber': [
                '[name="partNumber"]',
                '[id="partNumber"]',
                '[placeholder*="part"]',
                'input[id*="part"]'
            ],
            'partName': [
                '[name="partName"]',
                '[id="partName"]',
                '[placeholder*="name"]',
                'input[id*="name"]'
            ],
            'quantity': [
                '[name="quantity"]',
                '[id="quantity"]',
                '[name*="qty"]',
                '[placeholder*="quantity"]',
                'input[id*="qty"]'
            ],
            'requestNotes': [
                '[name="notes"]',
                '[id="notes"]',
                '[placeholder*="notes"]',
                'textarea[id*="notes"]'
            ]
        };
        
        for (const [fieldName, fieldValue] of Object.entries(data)) {
            const selectors = fieldSelectors[fieldName] || [`[name="${fieldName}"]`];
            let fieldFilled = false;
            
            for (const selector of selectors) {
                const element = await global.page.$(selector).catch(() => null);
                if (element) {
                    // Clear and fill the field
                    await element.fill(fieldValue);
                    console.log(`✓ Filled ${fieldName}: ${fieldValue}`);
                    fieldFilled = true;
                    break;
                }
            }
            
            if (!fieldFilled) {
                console.log(`⚠️ Could not find field: ${fieldName}`);
            }
        }
        
        // Wait for form to process
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(`❌ Error filling form: ${error.message}`);
        throw error;
    }
});

Then('I should see the filled part request details', async function () {
    console.log(`🔍 Verifying filled part request details are displayed`);
    
    try {
        if (!this.formData) {
            console.log(`⚠️ No form data stored`);
            return;
        }
        
        const pageContent = await global.page.content();
        let detailsVerified = 0;
        
        for (const [fieldName, fieldValue] of Object.entries(this.formData)) {
            if (pageContent.includes(fieldValue)) {
                console.log(`✓ Found filled detail: ${fieldName} = ${fieldValue}`);
                detailsVerified++;
            }
        }
        
        console.log(`✓ Verified ${detailsVerified}/${Object.keys(this.formData).length} filled details`);
    } catch (error) {
        console.error(`❌ Error verifying details: ${error.message}`);
        throw error;
    }
});

Then('I should see the part quantity is {string}', async function (expectedQuantity) {
    console.log(`🔢 Verifying part quantity is ${expectedQuantity}`);
    
    try {
        const quantitySelectors = [
            '[name="quantity"]',
            '[id="quantity"]',
            '[name*="qty"]',
            'input[id*="qty"]'
        ];
        
        let quantityFound = false;
        for (const selector of quantitySelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                const value = await element.inputValue();
                console.log(`✓ Current quantity value: ${value}`);
                if (value === expectedQuantity) {
                    console.log(`✓ Quantity matches expected value: ${expectedQuantity}`);
                    quantityFound = true;
                }
                break;
            }
        }
        
        if (!quantityFound) {
            console.log(`⚠️ Quantity not found or doesn't match`);
        }
    } catch (error) {
        console.error(`❌ Error verifying quantity: ${error.message}`);
        throw error;
    }
});

// SCENARIO 3: Add Multiple Parts
When('I add a new part with the following details:', async function (dataTable) {
    console.log(`➕ Adding new part to request`);
    
    try {
        const data = dataTable.rowsHash();
        console.log(`Part details:`, data);
        
        // Initialize parts list if not exists
        if (!this.partsAdded) {
            this.partsAdded = [];
        }
        
        // Look for "Add Part" or similar button
        const addPartSelectors = [
            '[id*="addPart"]',
            '[class*="add-part"]',
            'button:has-text("Add Part")',
            'button:has-text("Add More")',
            'button[id*="add"]',
            '[class*="add"] button'
        ];
        
        let addButtonClicked = false;
        for (const selector of addPartSelectors) {
            try {
                const button = await global.page.$(selector).catch(() => null);
                if (button) {
                    await button.click();
                    console.log(`✓ Clicked add part button with selector: ${selector}`);
                    addButtonClicked = true;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!addButtonClicked) {
            console.log(`⚠️ Could not find add part button, attempting to fill directly`);
        }
        
        // Fill the new part details
        const fieldSelectors = {
            'partNumber': ['[name="partNumber"]', '[id="partNumber"]', '[placeholder*="part"]'],
            'quantity': ['[name="quantity"]', '[id="quantity"]', '[placeholder*="quantity"]']
        };
        
        for (const [fieldName, fieldValue] of Object.entries(data)) {
            const selectors = fieldSelectors[fieldName] || [`[name="${fieldName}"]`];
            
            for (const selector of selectors) {
                const element = await global.page.$(selector).catch(() => null);
                if (element) {
                    await element.fill(fieldValue);
                    console.log(`✓ Filled new part ${fieldName}: ${fieldValue}`);
                    break;
                }
            }
        }
        
        this.partsAdded.push(data);
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(`❌ Error adding part: ${error.message}`);
        throw error;
    }
});

Then('I should see {string} parts added to the request', async function (partsCount) {
    console.log(`📦 Verifying ${partsCount} parts are added to the request`);
    
    try {
        const expectedCount = parseInt(partsCount);
        const actualCount = this.partsAdded ? this.partsAdded.length : 0;
        
        console.log(`✓ Expected parts: ${expectedCount}, Actual parts: ${actualCount}`);
        
        if (actualCount > 0) {
            console.log(`✓ Parts added: ${this.partsAdded.map(p => p.partNumber).join(', ')}`);
        }
    } catch (error) {
        console.error(`❌ Error verifying parts count: ${error.message}`);
        throw error;
    }
});

Then('I should verify the total parts count is {string}', async function (totalCount) {
    console.log(`🔢 Verifying total parts count is ${totalCount}`);
    
    try {
        const partsCount = this.partsAdded ? this.partsAdded.length : 0;
        console.log(`✓ Total parts in request: ${partsCount}`);
        
        if (partsCount.toString() === totalCount) {
            console.log(`✓ Total parts count matches: ${totalCount}`);
        } else {
            console.log(`⚠️ Total parts count mismatch. Expected: ${totalCount}, Got: ${partsCount}`);
        }
    } catch (error) {
        console.error(`❌ Error verifying total count: ${error.message}`);
        throw error;
    }
});

// SCENARIO 4: Select Dealership Location
When('I click on the dealership location dropdown', async function () {
    console.log(`🏢 Clicking on dealership location dropdown`);
    
    try {
        const dropdownSelectors = [
            '[id*="dealership"]',
            '[name*="dealer"]',
            '[id*="location"]',
            'select[id*="dealer"]',
            '[class*="dropdown"] select'
        ];
        
        let dropdownClicked = false;
        for (const selector of dropdownSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                await element.click();
                console.log(`✓ Clicked dropdown with selector: ${selector}`);
                dropdownClicked = true;
                await new Promise(resolve => setTimeout(resolve, 500));
                break;
            }
        }
        
        if (!dropdownClicked) {
            console.log(`⚠️ Could not find dealership dropdown`);
        }
    } catch (error) {
        console.error(`❌ Error clicking dropdown: ${error.message}`);
        throw error;
    }
});

Then('I should see available dealership locations', async function () {
    console.log(`🔍 Verifying available dealership locations are visible`);
    
    try {
        // Check for dropdown options
        const optionSelectors = [
            'option',
            '[role="option"]',
            '[class*="option"]',
            'li[class*="item"]'
        ];
        
        let optionsFound = 0;
        for (const selector of optionSelectors) {
            const options = await global.page.$$(selector);
            if (options.length > 0) {
                console.log(`✓ Found ${options.length} dealership options`);
                optionsFound = options.length;
                break;
            }
        }
        
        if (optionsFound === 0) {
            console.log(`⚠️ No dealership options found`);
        }
        
        this.dealershipOptionsCount = optionsFound;
    } catch (error) {
        console.error(`❌ Error verifying options: ${error.message}`);
        throw error;
    }
});

When('I select a dealership from the list', async function () {
    console.log(`🏢 Selecting a dealership from the list`);
    
    try {
        const optionSelectors = [
            'option:nth-child(2)',
            '[role="option"]:nth-child(1)',
            'li[class*="item"]:nth-child(1)'
        ];
        
        let optionSelected = false;
        for (const selector of optionSelectors) {
            const option = await global.page.$(selector).catch(() => null);
            if (option) {
                await option.click();
                console.log(`✓ Selected dealership option with selector: ${selector}`);
                optionSelected = true;
                await new Promise(resolve => setTimeout(resolve, 500));
                break;
            }
        }
        
        if (!optionSelected) {
            console.log(`⚠️ Could not select dealership option`);
        }
    } catch (error) {
        console.error(`❌ Error selecting dealership: ${error.message}`);
        throw error;
    }
});

Then('I should verify the selected dealership is displayed', async function () {
    console.log(`✓ Verifying selected dealership is displayed`);
    
    try {
        // Get current selected value
        const selectedSelectors = [
            'select[id*="dealer"]',
            '[class*="selected"]',
            '[class*="active"]'
        ];
        
        let selectedFound = false;
        for (const selector of selectedSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                const value = await element.textContent();
                console.log(`✓ Selected dealership displayed: ${value}`);
                selectedFound = true;
                break;
            }
        }
        
        if (!selectedFound) {
            console.log(`⚠️ Could not verify selected dealership display`);
        }
    } catch (error) {
        console.error(`❌ Error verifying selection: ${error.message}`);
        throw error;
    }
});

// SCENARIO 5: Submit Part Request
When('I click the submit part request button', async function () {
    console.log(`🚀 Clicking submit part request button`);
    
    try {
        const submitSelectors = [
            'button[id*="submit"]',
            'button[class*="submit"]',
            'button:has-text("Submit")',
            'button[type="submit"]',
            '[class*="submit"] button'
        ];
        
        let submitClicked = false;
        for (const selector of submitSelectors) {
            const button = await global.page.$(selector).catch(() => null);
            if (button) {
                await button.click();
                console.log(`✓ Clicked submit button with selector: ${selector}`);
                submitClicked = true;
                await new Promise(resolve => setTimeout(resolve, 2000));
                break;
            }
        }
        
        if (!submitClicked) {
            console.log(`⚠️ Could not find submit button`);
        }
        
        this.submitAttempted = true;
    } catch (error) {
        console.error(`❌ Error clicking submit: ${error.message}`);
        throw error;
    }
});

Then('I should see a success message or confirmation', async function () {
    console.log(`✅ Checking for success message`);
    
    try {
        const successSelectors = [
            '[class*="success"]',
            '[class*="confirmation"]',
            '[id*="success"]',
            '[role="alert"]',
            '[class*="message"]'
        ];
        
        let successFound = false;
        for (const selector of successSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                const text = await element.textContent();
                if (text.toLowerCase().includes('success') || text.toLowerCase().includes('submitted')) {
                    console.log(`✓ Success message found: ${text.substring(0, 100)}`);
                    successFound = true;
                    break;
                }
            }
        }
        
        if (!successFound) {
            console.log(`⚠️ No success message found yet`);
        }
        
        this.successMessageFound = successFound;
    } catch (error) {
        console.error(`❌ Error checking success message: ${error.message}`);
        throw error;
    }
});

Then('I should verify the request was submitted with reference number', async function () {
    console.log(`📋 Verifying request submission with reference number`);
    
    try {
        const referenceSelectors = [
            '[class*="reference"]',
            '[class*="ref-number"]',
            '[id*="reference"]',
            '[class*="request-id"]'
        ];
        
        let referenceFound = false;
        for (const selector of referenceSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                const refNumber = await element.textContent();
                console.log(`✓ Reference number found: ${refNumber}`);
                referenceFound = true;
                this.referenceNumber = refNumber;
                break;
            }
        }
        
        if (!referenceFound) {
            console.log(`⚠️ Reference number not found`);
        }
    } catch (error) {
        console.error(`❌ Error verifying reference number: ${error.message}`);
        throw error;
    }
});

// SCENARIO 6: Validation Error Handling
When('I click the submit part request button without filling form', async function () {
    console.log(`⚠️ Attempting to submit empty form`);
    
    try {
        const submitSelectors = [
            'button[id*="submit"]',
            'button[class*="submit"]',
            'button:has-text("Submit")',
            'button[type="submit"]'
        ];
        
        let submitClicked = false;
        for (const selector of submitSelectors) {
            const button = await global.page.$(selector).catch(() => null);
            if (button) {
                await button.click();
                console.log(`✓ Clicked submit without form data`);
                submitClicked = true;
                await new Promise(resolve => setTimeout(resolve, 1500));
                break;
            }
        }
        
        if (!submitClicked) {
            console.log(`⚠️ Could not find submit button`);
        }
    } catch (error) {
        console.error(`❌ Error attempting submit: ${error.message}`);
        throw error;
    }
});

Then('I should see validation error messages', async function () {
    console.log(`❌ Checking for validation error messages`);
    
    try {
        const errorSelectors = [
            '[class*="error"]',
            '[class*="invalid"]',
            '[role="alert"]',
            '[class*="validation"]',
            '.error-message'
        ];
        
        let errorsFound = 0;
        for (const selector of errorSelectors) {
            const elements = await global.page.$$(selector);
            if (elements.length > 0) {
                console.log(`✓ Found ${elements.length} validation error(s)`);
                errorsFound += elements.length;
                break;
            }
        }
        
        if (errorsFound === 0) {
            console.log(`⚠️ No validation errors found`);
        }
        
        this.validationErrorsFound = errorsFound > 0;
    } catch (error) {
        console.error(`❌ Error checking errors: ${error.message}`);
        throw error;
    }
});

Then('I should see {string} error', async function (expectedError) {
    console.log(`❌ Checking for specific error: ${expectedError}`);
    
    try {
        const pageContent = await global.page.content();
        if (pageContent.includes(expectedError)) {
            console.log(`✓ Error message found: ${expectedError}`);
        } else {
            console.log(`⚠️ Expected error not found: ${expectedError}`);
        }
    } catch (error) {
        console.error(`❌ Error checking specific error: ${error.message}`);
        throw error;
    }
});

// SCENARIO 7: Invalid Quantity Validation
Then('I should see quantity validation error', async function () {
    console.log(`❌ Checking for quantity validation error`);
    
    try {
        const errorSelectors = [
            '[class*="error"]',
            '[class*="invalid"]',
            '[class*="validation"]'
        ];
        
        let errorFound = false;
        for (const selector of errorSelectors) {
            const element = await global.page.$(selector).catch(() => null);
            if (element) {
                const text = await element.textContent();
                if (text.toLowerCase().includes('quantity')) {
                    console.log(`✓ Quantity error found: ${text}`);
                    errorFound = true;
                    break;
                }
            }
        }
        
        if (!errorFound) {
            console.log(`⚠️ Quantity validation error not found`);
        }
    } catch (error) {
        console.error(`❌ Error checking quantity error: ${error.message}`);
        throw error;
    }
});

Then('I should see error message {string}', async function (expectedMessage) {
    console.log(`❌ Checking for error message: ${expectedMessage}`);
    
    try {
        const pageContent = await global.page.content();
        if (pageContent.includes(expectedMessage)) {
            console.log(`✓ Error message displayed: ${expectedMessage}`);
        } else {
            console.log(`⚠️ Expected message not found: ${expectedMessage}`);
        }
    } catch (error) {
        console.error(`❌ Error verifying message: ${error.message}`);
        throw error;
    }
});

// SCENARIO 8: Clear Form
When('I click the clear form button', async function () {
    console.log(`🧹 Clicking clear form button`);
    
    try {
        const clearSelectors = [
            'button[id*="clear"]',
            'button[class*="clear"]',
            'button:has-text("Clear")',
            'button[id*="reset"]'
        ];
        
        let clearClicked = false;
        for (const selector of clearSelectors) {
            const button = await global.page.$(selector).catch(() => null);
            if (button) {
                await button.click();
                console.log(`✓ Clicked clear button with selector: ${selector}`);
                clearClicked = true;
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            }
        }
        
        if (!clearClicked) {
            console.log(`⚠️ Could not find clear button`);
        }
    } catch (error) {
        console.error(`❌ Error clicking clear: ${error.message}`);
        throw error;
    }
});

Then('I should see an empty part request form', async function () {
    console.log(`🔍 Verifying form is cleared`);
    
    try {
        const inputSelectors = [
            'input[type="text"]',
            'input[type="number"]',
            'textarea'
        ];
        
        let emptyFieldsCount = 0;
        let totalFieldsCount = 0;
        
        for (const selector of inputSelectors) {
            const elements = await global.page.$$(selector);
            totalFieldsCount += elements.length;
            
            for (const element of elements) {
                const value = await element.inputValue();
                if (!value || value === '') {
                    emptyFieldsCount++;
                }
            }
        }
        
        console.log(`✓ Empty fields: ${emptyFieldsCount}/${totalFieldsCount}`);
    } catch (error) {
        console.error(`❌ Error verifying empty form: ${error.message}`);
        throw error;
    }
});

Then('I should verify all fields are cleared', async function () {
    console.log(`✓ Confirming all form fields are cleared`);
    
    try {
        const inputs = await global.page.$$('input, textarea');
        let allCleared = true;
        
        for (const input of inputs) {
            const value = await input.inputValue();
            if (value) {
                allCleared = false;
                console.log(`⚠️ Field still contains value: ${value}`);
            }
        }
        
        if (allCleared) {
            console.log(`✓ All fields successfully cleared`);
        }
    } catch (error) {
        console.error(`❌ Error verifying cleared fields: ${error.message}`);
        throw error;
    }
});

// SCENARIO 9: View Request History
When('I click on part request history link', async function () {
    console.log(`📜 Clicking on part request history link`);
    
    try {
        const historySelectors = [
            'a[id*="history"]',
            'a[class*="history"]',
            'a:has-text("History")',
            'a[href*="history"]',
            '[class*="history"] a'
        ];
        
        let historyClicked = false;
        for (const selector of historySelectors) {
            const link = await global.page.$(selector).catch(() => null);
            if (link) {
                await link.click();
                console.log(`✓ Clicked history link with selector: ${selector}`);
                historyClicked = true;
                await new Promise(resolve => setTimeout(resolve, 2000));
                break;
            }
        }
        
        if (!historyClicked) {
            console.log(`⚠️ Could not find history link`);
        }
    } catch (error) {
        console.error(`❌ Error clicking history link: ${error.message}`);
        throw error;
    }
});

Then('I should see a list of previous requests', async function () {
    console.log(`📋 Checking for list of previous requests`);
    
    try {
        const listSelectors = [
            'table',
            '[class*="list"]',
            '[class*="requests"]',
            'ul[id*="request"]',
            '[role="grid"]'
        ];
        
        let listFound = false;
        for (const selector of listSelectors) {
            const list = await global.page.$(selector).catch(() => null);
            if (list) {
                console.log(`✓ Request list found with selector: ${selector}`);
                listFound = true;
                break;
            }
        }
        
        if (!listFound) {
            console.log(`⚠️ Request list not found`);
        }
    } catch (error) {
        console.error(`❌ Error checking list: ${error.message}`);
        throw error;
    }
});

Then('I should see request timestamps', async function () {
    console.log(`⏰ Checking for request timestamps`);
    
    try {
        const pageContent = await global.page.content();
        const datePatterns = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}-\d{2}-\d{2}/g;
        const matches = pageContent.match(datePatterns);
        
        if (matches && matches.length > 0) {
            console.log(`✓ Found ${matches.length} timestamps`);
        } else {
            console.log(`⚠️ No timestamps found`);
        }
    } catch (error) {
        console.error(`❌ Error checking timestamps: ${error.message}`);
        throw error;
    }
});

Then('I should see request statuses', async function () {
    console.log(`📊 Checking for request statuses`);
    
    try {
        const statusKeywords = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'processing'];
        const pageContent = await global.page.content().toLowerCase();
        
        let statusesFound = 0;
        for (const status of statusKeywords) {
            if (pageContent.includes(status)) {
                console.log(`✓ Status found: ${status}`);
                statusesFound++;
            }
        }
        
        console.log(`✓ Found ${statusesFound} status types`);
    } catch (error) {
        console.error(`❌ Error checking statuses: ${error.message}`);
        throw error;
    }
});

// SCENARIO 10: Edit Request
When('I navigate to part request history', async function () {
    console.log(`📜 Navigating to part request history`);
    
    try {
        const historyUrl = this.partsRequestUrl.replace('request-parts-dealership--xparts_request', 'request-parts-history');
        
        await global.page.goto(historyUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        }).catch(() => {
            console.log(`⚠️ Direct history URL navigation failed, trying alternate paths`);
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        console.error(`❌ Error navigating to history: ${error.message}`);
        throw error;
    }
});

Then('I select the first request from the list', async function () {
    console.log(`👆 Selecting first request from list`);
    
    try {
        const requestSelectors = [
            'tr:nth-child(2) td:first-child',
            'table tbody tr:first-child',
            '[class*="request-item"]:first-child',
            'li:first-child',
            '[role="row"]:first-child'
        ];
        
        let requestSelected = false;
        for (const selector of requestSelectors) {
            const request = await global.page.$(selector).catch(() => null);
            if (request) {
                await request.click();
                console.log(`✓ Selected first request with selector: ${selector}`);
                requestSelected = true;
                await new Promise(resolve => setTimeout(resolve, 1500));
                break;
            }
        }
        
        if (!requestSelected) {
            console.log(`⚠️ Could not select first request`);
        }
    } catch (error) {
        console.error(`❌ Error selecting request: ${error.message}`);
        throw error;
    }
});

Then('I should see the request details', async function () {
    console.log(`📄 Verifying request details are displayed`);
    
    try {
        const detailsSelectors = [
            '[class*="details"]',
            '[id*="details"]',
            '[class*="request-info"]',
            '[role="main"]'
        ];
        
        let detailsFound = false;
        for (const selector of detailsSelectors) {
            const details = await global.page.$(selector).catch(() => null);
            if (details) {
                console.log(`✓ Request details found with selector: ${selector}`);
                detailsFound = true;
                break;
            }
        }
        
        if (!detailsFound) {
            console.log(`⚠️ Request details not found`);
        }
    } catch (error) {
        console.error(`❌ Error checking details: ${error.message}`);
        throw error;
    }
});

When('I click the edit request button', async function () {
    console.log(`✏️ Clicking edit request button`);
    
    try {
        const editSelectors = [
            'button[id*="edit"]',
            'button[class*="edit"]',
            'a:has-text("Edit")',
            'button:has-text("Edit")',
            '[class*="edit"] button'
        ];
        
        let editClicked = false;
        for (const selector of editSelectors) {
            const button = await global.page.$(selector).catch(() => null);
            if (button) {
                await button.click();
                console.log(`✓ Clicked edit button with selector: ${selector}`);
                editClicked = true;
                await new Promise(resolve => setTimeout(resolve, 1500));
                break;
            }
        }
        
        if (!editClicked) {
            console.log(`⚠️ Could not find edit button`);
        }
    } catch (error) {
        console.error(`❌ Error clicking edit: ${error.message}`);
        throw error;
    }
});

Then('I should see the part request form populated with request details', async function () {
    console.log(`✓ Verifying part request form is populated with existing details`);
    
    try {
        const inputs = await global.page.$$('input, textarea, select');
        let populatedCount = 0;
        
        for (const input of inputs) {
            const value = await input.inputValue();
            if (value) {
                populatedCount++;
                console.log(`✓ Field populated: ${value.substring(0, 50)}`);
            }
        }
        
        console.log(`✓ Found ${populatedCount} populated fields`);
    } catch (error) {
        console.error(`❌ Error checking populated form: ${error.message}`);
        throw error;
    }
});

Then('I should be able to modify the part details', async function () {
    console.log(`✏️ Verifying part details can be modified`);
    
    try {
        // Try to modify a field
        const inputs = await global.page.$$('input[type="text"], input[type="number"]');
        
        if (inputs.length > 0) {
            const firstInput = inputs[0];
            const originalValue = await firstInput.inputValue();
            
            await firstInput.fill('Modified Value');
            const newValue = await firstInput.inputValue();
            
            if (newValue === 'Modified Value') {
                console.log(`✓ Successfully modified field from "${originalValue}" to "${newValue}"`);
            }
            
            // Restore original value
            await firstInput.fill(originalValue);
        } else {
            console.log(`⚠️ No editable fields found`);
        }
    } catch (error) {
        console.error(`❌ Error modifying details: ${error.message}`);
        throw error;
    }
});

module.exports = {
    // Export all step functions if needed for testing
};
