const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const { chromium } = require("playwright");

let browser, context, page;

// Only run this Before hook for non-dealerspike tests
Before({ tags: "not @dealerspike" }, async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
});

After({ tags: "not @dealerspike" }, async function () {
  await browser.close();
});

Given("I am on the Amazon home page", async function () {
  await page.goto("https://www.amazon.in/");
});

When("I search for {string}", async function (product) {
  await page.fill('input#twotabsearchtextbox', product);
  await page.click('button[type="submit"]');
});

Then("I should see the search results displayed", async function () {
  const visible = await page.isVisible('div[data-component-type="s-search-result"]');
  expect(visible).toBeTruthy();
});
