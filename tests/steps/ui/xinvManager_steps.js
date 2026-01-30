const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const XInvManagerPage = require('../../../Pages/XInvManagerPage');

Given('I open the XInv Manager page', async function () {
    const page = global.page;
    this.xinv = new XInvManagerPage(page);
    await this.xinv.navigate();
});

When('I perform inventory search for {string}', async function (text) {
    await this.xinv.search(text);
});

Then('I should see results containing {string}', async function (expected) {
    const firstText = await this.xinv.getFirstRowText();
    assert.ok(firstText.includes(expected), `Expected "${expected}" in first row but got "${firstText}"`);
});

When('I create a new item with name {string} and description {string}', async function (name, description) {
    await this.xinv.createItem({ name, description });
    await this.xinv.search(name);
});

When('I edit the first item to have name {string}', async function (newName) {
    await this.xinv.editFirstItem(newName);
    await this.xinv.search(newName);
});

When('I delete the first item', async function () {
    this.deletedFirstText = await this.xinv.getFirstRowText();
    await this.xinv.deleteFirstItem();
    await this.xinv.page.waitForTimeout(500);
});

Then('the first row should no longer contain {string}', async function (text) {
    const firstText = await this.xinv.getFirstRowText();
    assert.ok(!firstText.includes(text), `Did not expect "${text}" in first row but got "${firstText}"`);
});
