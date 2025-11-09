
module.exports = {
    scrollToElement,
    clickWhenVisible,
    typeText,
    waitForNetworkIdle
};

async function scrollToElement(page, selector) {
    const element = await page.locator(selector);
    await element.scrollIntoViewIfNeeded();
}


async function clickWhenVisible(page, selector) {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
    await element.click();
}


async function typeText(page, selector, text) {
    const element = page.locator(selector);
    await element.fill('');
    await element.type(text);
}


async function waitForNetworkIdle(page, timeout = 3000) {
    await page.waitForLoadState('networkidle', { timeout });
}


