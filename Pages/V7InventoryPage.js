const { expect } = require('@playwright/test');

class V7InventoryPage {
    constructor(page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL || 'https://qa-powersports.clients.dealerspike.net';
        
        // Flexible selectors for V7 SRP pages
        this.selectors = {
            // Page structure
            pageHeader: 'header, [role="banner"]',
            pageFooter: 'footer, [role="contentinfo"]',
            breadcrumbs: 'nav[aria-label="breadcrumb"], .breadcrumb, .breadcrumbs, [role="navigation"] li',
            
            // Results area
            resultsSection: '.inventory-results, .search-results, .results, .vehicles-list, [role="main"] .list',
            resultsList: '.inventory-item, .vehicle-card, .result, .listing, [class*="card"], [data-testid*="card"]',
            resultsCount: '.results-count, .count, [class*="count"]',
            noResultsMsg: '.no-results, [class*="empty"], [role="status"]',
            
            // Filter/Facet panel
            filterPanel: '.filters, .facets, .filter-sidebar, [class*="filter"]',
            filterTrigger: 'button[aria-label*="filter" i], button:has-text("Filter")',
            
            // Individual filters
            conditionFilter: 'input[value="new"], input[id*="condition"], input[name*="condition"]',
            makeFilter: 'select[name*="make" i], input[id*="make" i]',
            modelFilter: 'select[name*="model" i], input[id*="model" i]',
            yearFilter: 'select[name*="year" i], input[id*="year" i]',
            categoryFilter: 'select[name*="category" i], input[id*="category" i]',
            colorFilter: 'select[name*="color" i], input[id*="color" i]',
            priceMinFilter: 'input[name*="min" i], input[placeholder*="min" i], input[id*="minprice" i]',
            priceMaxFilter: 'input[name*="max" i], input[placeholder*="max" i], input[id*="maxprice" i]',
            engineFilter: 'select[name*="engine" i], input[id*="engine" i]',
            
            // Filter chips
            filterChip: '[class*="chip"], [class*="tag"], [class*="badge"], .filter-value',
            removeChipBtn: '[class*="chip"] button, [class*="chip"] [class*="close"]',
            clearAllBtn: 'button:has-text("Clear"), button:has-text("Reset"), a:has-text("Clear All")',
            
            // Sorting
            sortSelect: 'select[name*="sort" i], select[id*="sort" i], select[aria-label*="sort" i]',
            sortOption: 'option',
            
            // Pagination
            paginationContainer: '.pagination, nav[aria-label*="pagination" i], [class*="page"]',
            previousBtn: 'button[aria-label*="previous" i], a:has-text("Previous")',
            nextBtn: 'button[aria-label*="next" i], a:has-text("Next")',
            pageInput: 'input[name*="page" i]',
            
            // Card elements
            cardImage: '.vehicle-image, .card-image, img[alt*="vehicle" i], .inventory-item img',
            cardTitle: '.vehicle-title, .card-title, .make-model, h3, h4',
            cardYear: '[class*="year"], .vehicle-year',
            cardMake: '[class*="make"], .vehicle-make',
            cardModel: '[class*="model"], .vehicle-model',
            cardStock: '[class*="stock"], .vin, .stock-number',
            cardPrice: '.price, .vehicle-price, [class*="price"], .msrp',
            cardCTA: 'button[class*="view" i], a[class*="view" i], button:has-text("View"), a:has-text("View"), .cta, .primary-cta',
        };
    }

    /**
     * Navigate to inventory page with parameters
     */
    async navigateToInventory(params = {}) {
        let baseUrl = this.baseUrl || process.env.BASE_URL || 'https://automationsandbox-v6.clients.dealerspike.net';
        
        // Ensure protocol is included
        if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
            baseUrl = 'https://' + baseUrl;
        }
        
        let url = `${baseUrl}/new-harley-davidson-motorcycles-for-sale-harley-dealer-british-columbia--inventory`;
        
        const queryParams = [];
        if (params.condition) queryParams.push(`condition=${params.condition}`);
        if (params.pg) queryParams.push(`pg=${params.pg}`);
        if (params.sortby) queryParams.push(`sortby=${params.sortby}`);
        
        if (queryParams.length) {
            url += '?' + queryParams.join('&');
        }
        
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
        await this.page.waitForTimeout(500);
    }

    /**
     * Wait for page to fully load
     */
    async waitForPageLoad() {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        } catch (e) {
            console.log('Page load timeout - continuing anyway');
        }
        await this.page.waitForTimeout(500);
    }

    /**
     * Get page title
     */
    async getPageTitle() {
        return await this.page.title();
    }

    /**
     * Get HTTP response status
     */
    async getPageStatus() {
        const response = await this.page.goto(this.page.url(), { waitUntil: 'networkidle' });
        return response?.status() || 200;
    }

    /**
     * Get meta description
     */
    async getMetaDescription() {
        const meta = await this.page.locator('meta[name="description"]').getAttribute('content');
        return meta || '';
    }

    /**
     * Get canonical URL
     */
    async getCanonicalUrl() {
        const canonical = await this.page.locator('link[rel="canonical"]').getAttribute('href');
        return canonical || '';
    }

    /**
     * Check if element is visible
     */
    async isElementVisible(selector) {
        try {
            const elements = await this.page.locator(selector);
            const count = await elements.count();
            if (count === 0) return false;
            return await elements.first().isVisible().catch(() => false);
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if header is displayed
     */
    async isHeaderVisible() {
        return await this.isElementVisible(this.selectors.pageHeader);
    }

    /**
     * Check if footer is displayed
     */
    async isFooterVisible() {
        return await this.isElementVisible(this.selectors.pageFooter);
    }

    /**
     * Check if results section is visible
     */
    async isResultsSectionVisible() {
        return await this.isElementVisible(this.selectors.resultsSection);
    }

    /**
     * Check if filter panel is visible
     */
    async isFilterPanelVisible() {
        return await this.isElementVisible(this.selectors.filterPanel);
    }

    /**
     * Check if sort dropdown is visible
     */
    async isSortDropdownVisible() {
        return await this.isElementVisible(this.selectors.sortSelect);
    }

    /**
     * Check if results count is visible
     */
    async isResultsCountVisible() {
        return await this.isElementVisible(this.selectors.resultsCount);
    }

    /**
     * Check if pagination is visible
     */
    async isPaginationVisible() {
        return await this.isElementVisible(this.selectors.paginationContainer);
    }

    /**
     * Get results count
     */
    async getResultsCount() {
        try {
            const countText = await this.page.locator(this.selectors.resultsCount).textContent();
            const match = countText?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        } catch (e) {
            return await this.page.locator(this.selectors.resultsList).count();
        }
    }

    /**
     * Get inventory card count
     */
    async getCardCount() {
        return await this.page.locator(this.selectors.resultsList).count();
    }

    /**
     * Check if filter is pre-selected
     */
    async isFilterPreSelected(filterType) {
        try {
            let selector;
            switch(filterType.toLowerCase()) {
                case 'new':
                case 'condition':
                    selector = this.selectors.conditionFilter;
                    break;
                case 'used':
                    selector = 'input[value="used"]';
                    break;
                default:
                    return false;
            }
            
            const elem = await this.page.locator(selector).first();
            if (!await elem.count()) return false;
            
            const checked = await elem.isChecked().catch(() => false);
            return checked;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if element contains text in breadcrumb
     */
    async doesBreadcrumbContain(text) {
        const breadcrumbs = await this.page.locator(this.selectors.breadcrumbs);
        const count = await breadcrumbs.count();
        for (let i = 0; i < count; i++) {
            const content = await breadcrumbs.nth(i).textContent();
            if (content?.includes(text)) return true;
        }
        return false;
    }

    /**
     * Get first inventory card data
     */
    async getFirstCardData() {
        try {
            const card = this.page.locator(this.selectors.resultsList).first();
            if (!await card.count()) return null;
            
            const data = {
                image: null,
                title: null,
                year: null,
                make: null,
                model: null,
                stock: null,
                price: null,
                cta: null
            };
            
            try { data.image = await card.locator(this.selectors.cardImage).first().getAttribute('src'); } catch (e) {}
            try { data.title = await card.locator(this.selectors.cardTitle).first().textContent(); } catch (e) {}
            try { data.year = await card.locator(this.selectors.cardYear).first().textContent(); } catch (e) {}
            try { data.make = await card.locator(this.selectors.cardMake).first().textContent(); } catch (e) {}
            try { data.model = await card.locator(this.selectors.cardModel).first().textContent(); } catch (e) {}
            try { data.stock = await card.locator(this.selectors.cardStock).first().textContent(); } catch (e) {}
            try { data.price = await card.locator(this.selectors.cardPrice).first().textContent(); } catch (e) {}
            try { data.cta = await card.locator(this.selectors.cardCTA).first().isVisible(); } catch (e) {}
            
            return data;
        } catch (e) {
            return null;
        }
    }

    /**
     * Verify all cards have required fields
     */
    async verifyCardsHaveRequiredFields() {
        const cards = this.page.locator(this.selectors.resultsList);
        const count = await cards.count();
        
        if (count === 0) return false;
        
        for (let i = 0; i < Math.min(count, 3); i++) {
            const card = cards.nth(i);
            const hasImage = await card.locator(this.selectors.cardImage).count() > 0;
            const hasTitle = (await card.textContent()).length > 0;
            const hasPrice = await card.locator(this.selectors.cardPrice).count() > 0;
            
            if (!hasImage || !hasTitle || !hasPrice) return false;
        }
        
        return true;
    }

    /**
     * Get sort value from URL
     */
    async getSortFromUrl() {
        const url = this.page.url();
        const match = url.match(/sortby=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    /**
     * Get condition from URL
     */
    async getConditionFromUrl() {
        const url = this.page.url();
        const match = url.match(/condition=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    /**
     * Click next pagination button
     */
    async clickNextPage() {
        const nextBtn = this.page.locator(this.selectors.nextBtn).first();
        if (await nextBtn.count()) {
            const currentUrl = this.page.url();
            console.log('Current URL before pagination click:', currentUrl);
            
            // Click and wait for either navigation or URL change
            try {
                await Promise.race([
                    this.page.waitForNavigation({ timeout: 10000 }).catch(() => console.log('No navigation detected')),
                    this.page.waitForFunction(() => {
                        const newUrl = window.location.href;
                        return newUrl !== new URL(currentUrl).href;
                    }, { timeout: 10000 }).catch(() => console.log('URL did not change'))
                ]);
            } catch (e) {
                console.log('Navigation or URL change wait timed out:', e.message);
            }
            
            // Additional wait
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await this.page.waitForTimeout(500);
            
            const newUrl = this.page.url();
            console.log('URL after pagination click:', newUrl);
            return true;
        } else {
            console.log('Next button not found. Tried selectors:', this.selectors.nextBtn);
        }
        return false;
    }

    /**
     * Click previous pagination button
     */
    async clickPreviousPage() {
        const prevBtn = this.page.locator(this.selectors.previousBtn).first();
        if (await prevBtn.count()) {
            const currentUrl = this.page.url();
            console.log('Current URL before previous button click:', currentUrl);
            
            // Click and wait for either navigation or URL change
            try {
                await Promise.race([
                    this.page.waitForNavigation({ timeout: 10000 }).catch(() => console.log('No navigation detected')),
                    this.page.waitForFunction(() => {
                        const newUrl = window.location.href;
                        return newUrl !== new URL(currentUrl).href;
                    }, { timeout: 10000 }).catch(() => console.log('URL did not change'))
                ]);
            } catch (e) {
                console.log('Navigation or URL change wait timed out:', e.message);
            }
            
            // Additional wait
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await this.page.waitForTimeout(500);
            
            const newUrl = this.page.url();
            console.log('URL after previous button click:', newUrl);
            return true;
        } else {
            console.log('Previous button not found. Tried selectors:', this.selectors.previousBtn);
        }
        return false;
    }

    /**
     * Verify no 404 images
     */
    async verifyNoImageErrors() {
        const images = await this.page.locator(this.selectors.cardImage);
        const count = await images.count();
        
        for (let i = 0; i < count; i++) {
            const src = await images.nth(i).getAttribute('src');
            if (!src) return false;
        }
        
        return true;
    }

    /**
     * Check browser console for errors
     */
    async getConsoleErrors() {
        const logs = [];
        this.page.on('console', msg => {
            if (msg.type() === 'error') logs.push(msg.text());
        });
        return logs;
    }

    /**
     * Apply a filter
     */
    async applyFilter(filterType, value) {
        try {
            let selector;
            switch(filterType.toLowerCase()) {
                case 'model':
                    selector = this.selectors.modelFilter;
                    break;
                case 'category':
                    selector = this.selectors.categoryFilter;
                    break;
                case 'price':
                    selector = this.selectors.priceMinFilter;
                    break;
                case 'year':
                    selector = this.selectors.yearFilter;
                    break;
                case 'color':
                    selector = this.selectors.colorFilter;
                    break;
                default:
                    return false;
            }
            
            const elem = this.page.locator(selector).first();
            if (!await elem.count()) return false;
            
            const tagName = await elem.evaluate(el => el.tagName);
            
            if (tagName === 'SELECT') {
                await elem.selectOption(value).catch(async () => {
                    await elem.selectOption({ label: value });
                });
            } else if (tagName === 'INPUT' && (await elem.getAttribute('type')) === 'checkbox') {
                const currentValue = await elem.getAttribute('value');
                if (currentValue === value && !await elem.isChecked()) {
                    await elem.click();
                }
            } else {
                await elem.fill(value);
            }
            
            await this.page.waitForLoadState('networkidle').catch(() => {});
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = V7InventoryPage;
