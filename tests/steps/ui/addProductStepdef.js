    const { Given,When, Then, setDefaultTimeout } = require ("@cucumber/cucumber");
const { chromium } = require("@playwright/test");

    let browser;
    let page;
    let context;
         
        Given('I am on the {string} page', async function (string) {
           console.log("Given executed")
           browser = await chromium.launch({ headless: false })
           setDefaultTimeout(10 * 1000) // Set timeout to 60 seconds
           await page.goto('https://www.amazon.in/');

         });

          Given('I click on {string} in seach textbox', function (string) {
           console.log("Given2 executed");
         });
     
         Then('I enter the {string} in the search box', function (string) {
         console.log("Then executed");
         });

          Then('I click on Search button', function () {
              console.log("Then2 executed");
         });

             When('I scroll to the {string} button', function (string) {
           console.log("When executed");
         });
           
            When('I click on {string} description', function (string) {
           console.log("When2 executed");
         });