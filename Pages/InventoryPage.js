class InventoryPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.searchInput = page.locator('#txtSearch');
    this.searchButton = page.locator('#btnSearch');
    this.inventoryItems = page.locator('.inventory-item');
    this.sortDropdown = page.locator('#sortoptions');
  
    this.categoryFilter = page.locator('#InvCategories');
    this.makeFilter= page.locator('#InvMakes'); 
    this.yearFilter=page.locator('#InvYears');
    this.sortBytext=page.locator(".sortoptions").getByRole('option');
    //this.categoryFilter = page.locator('#ddlCategory');
    //this.makeFilter = page.locator('#ddlMake');
    //this.yearFilter = page.locator('#ddlYear');

    this.priceLocator = page.locator('.price');    
  }

  async searchInventory(text) {
    await this.searchInput.fill(text);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getInventoryCount() {
    return await this.inventoryItems.count();
  }

  async sortBy(option) {
    await this.sortDropdown.selectOption({ label: option });
    await this.page.waitForLoadState('networkidle');
  }

  async getAllPrices() {
    const prices = [];
    const count = await this.priceLocator.count();

    for (let i = 0; i < count; i++) {
      const priceText = await this.priceLocator.nth(i).innerText();
      prices.push(Number(priceText.replace(/[^0-9]/g, '')));
    }
    return prices;
  }

  async selectCategory(category) {
    await this.categoryFilter.selectOption({ label: category });
    await this.page.waitForLoadState('networkidle');
  }

  async selectMake(make) {
    await this.makeFilter.selectOption({ label: make });
    await this.page.waitForLoadState('networkidle');
  }

  async selectYear(year) {
    await this.yearFilter.selectOption({ label: year });
    await this.page.waitForLoadState('networkidle');
  }

  async verifyFilterApplied(expectedValue) {
    const count = await this.inventoryItems.count();

    for (let i = 0; i < count; i++) {
      await expect(this.inventoryItems.nth(i)).toContainText(expectedValue);
    }
  }


  async applysort(label){
    // Case 1: Dropdown-based sort
    if (await this.sortDropdown.count()) {
      await this.sortDropdown.first().selectOption({ label }).catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return true;
    }

    // Case 2: Button-based sort
    if (await this.sortButton(label).count()) {
      await this.sortButton(label).click().catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return true;
    }

    // Case 3: Text / link-based sort
    if (await this.sortText(label).count()) {
      await this.sortText(label).click().catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return true;
    }

    return false;
  
  }

  async captureInventoryOrder(){
      const order = [];
    const items = await this.resultsList.all();

    for (const item of items) {
      try {
        const id = await item.getAttribute('data-unit-id');
        if (id) order.push(id);
      } catch (e) {}
    }
    return order;
  }
}

module.exports = InventoryPage;
