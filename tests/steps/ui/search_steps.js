import { Given, When, Then, Before, After } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { chromium } from "playwright";
import { AmazonHomePage } from "../../pages/AmazonHomePage.js";

let browser, context, page, amazon;

Before(async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
  amazon = new AmazonHomePage(page);
});

After(async function () {
  await browser.close();
});

Given("I am on the Amazon home page", async function () {
  await amazon.open();
});

When("I search for {string}", async function (product) {
  await amazon.searchProduct(product);
});

Then("I should see the search results displayed", async function () {
  const visible = await amazon.isResultDisplayed();
  expect(visible).toBeTruthy();
});
