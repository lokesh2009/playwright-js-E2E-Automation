export class AmazonHomePage {
    constructor(page) {
        this.page = page;
        this.searchBox = page.locator('#twotabsearchtextbox');
        this.searchButton = page.locator('#nav-search-submit-button');
    }   

    async open() {
        await this.page.goto('https://www.amazon.in');
        await this.page.waitForLoadState('networkidle');
    }
      async searchProduct(product) {
    await this.searchBox.fill(product);
    await this.searchButton.click();
    await this.page.waitForTimeout(3000); // wait for results to load
   }
     async isResultDisplayed() {
    return await this.results.first().isVisible();
  }
}

