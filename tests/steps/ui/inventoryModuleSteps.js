const {Given,When,Then} = require("@cucumber/cucumber");
const {expect}=require("@playwright/test")

// const InventoryModulePage=require("../../Pages/InventoryModulePage.js");
// const buildInventoryUrl= require("../../Utility/util.js");

let inventoryModule;

Given("User opens {string} site", async function (site) {

  const url = buildInventoryUrl(site);

  console.log("Opening:", url);

  await this.page.goto(url);

  inventoryPage = new InventoryPage(this.page);

});

When("User clicks on Inventory page", async function () {

  await inventoryPage.clickInventory();

});

