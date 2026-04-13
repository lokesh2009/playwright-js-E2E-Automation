class InventoryModulePage {

constructor(page){

this.page = page;

this.inventoryMenu = page.locator("a[href*='for-sale']");
this.categoryFilter = page.locator("#category");
this.makeFilter = page.locator("#make");
this.yearFilter = page.locator("#year");

}

async clickInventory(){

await this.inventoryMenu.first().click();

}

async getCategoryDefault(){

return await this.categoryFilter.textContent();

}

async getMakeDefault(){

return await this.makeFilter.textContent();

}

async getYearDefault(){

return await this.yearFilter.textContent();

}

async selectCategory(category){

await this.categoryFilter.selectOption({ label: category });

}

}

module.exports = InventoryModulePage;