

import { test, expect } from '@playwright/test';

import test from "../playwright.config"

test("New Item added", async ({ page }) => {
    const productpage = new ProductPage(page)
    await productpage.visit();

    await productpage.addProductToBasket();
    await page.pause();

})