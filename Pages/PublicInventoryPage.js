class PublicInventoryPage {
    constructor(page) {
        this.page = page;
        // Centralized selectors used by inventory feature steps page.locator(':text-is("MAKE")')
        this.makeSelect = page.locator("li.filter-groups__item--make >> div.filter-group__header");
        this.selectors = {
            // search
            searchInputs: ['input[type="search"]', 'input[placeholder*="Search" i]', 'input[name*="search" i]', 'input[id*="search" i]'],
            searchButton: 'button:has-text("Search")',

            // results
            resultsList: '.inventory-list .inventory-item, .results .result, .vehicles-list .vehicle, .listings .listing, .vehicle-card, .inventory-item',

            // price elements
            priceSelectors: ['.price', '.vehicle-price', '.listing-price', '.inventory-price', '.price--value', 'xpath=//text()[contains(.,"$")]'],

            // sort - broaden selector to catch v6/v7 variants
            sortSelect: 'select[aria-label*="Sort" i], select[name*="sort" i], select[id*="sort" i], select[class*="sort" i], select',

            // filters
            categorySelect: 'select[name*="category" i], select[aria-label*="category" i]',
        
            yearSelect: 'select[name*="year" i], select[aria-label*="year" i]'
        };
    }

    async clickMake() {
        await this.makeSelect.click();
    }

    async goto(url) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        await this.page.waitForTimeout(800);
    }

    async fillSearch(text) {
        for (const sel of this.selectors.searchInputs) {
            const loc = this.page.locator(sel).first();
            if (await loc.count()) { await loc.fill(text); return true; }
        }
        return false;
    }

    async triggerSearch() {
        // press enter on first input if exists
        for (const sel of this.selectors.searchInputs) {
            const loc = this.page.locator(sel).first();
            if (await loc.count()) { await loc.press('Enter').catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
        }
        const btn = this.page.locator(this.selectors.searchButton).first();
        if (await btn.count()) { await btn.click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
        return false;
    }

    async search(text) {
        const ok = await this.fillSearch(text);
        if (!ok) return false;
        await this.triggerSearch();
        return true;
    }

    async waitForResults(timeout = 5000) {
        try {
            await this.page.waitForSelector(this.selectors.resultsList, { timeout });
            return true;
        } catch (e) { return false; }
    }

    async getResultsCount() {
        const loc = this.page.locator(this.selectors.resultsList);
        return await loc.count();
    }

    async getPrices(limit = 10) {
        const prices = [];
        for (const s of this.selectors.priceSelectors) {
            try {
                const locs = this.page.locator(s);
                const count = await locs.count();
                for (let i = 0; i < Math.min(count, limit - prices.length); i++) {
                    const t = await locs.nth(i).textContent().catch(() => '');
                    if (t) {
                        const m = t.replace(/[^0-9.]/g, '');
                        const n = parseFloat(m);
                        if (!isNaN(n)) prices.push(n);
                    }
                }
                if (prices.length >= Math.min(limit, 10)) break;
            } catch (e) {}
        }
        return prices;
    }

    // Fallback: extract prices by scanning each result card for dollar amounts
    async getPricesFromCards(limit = 10) {
        const prices = [];
        try {
            const items = this.page.locator(this.selectors.resultsList);
            const count = await items.count();
            for (let i = 0; i < Math.min(count, limit); i++) {
                try {
                    const text = await items.nth(i).textContent().catch(() => '');
                    if (!text) continue;
                    const m = text.match(/\$\s*([0-9,]+(?:\.[0-9]+)?)/);
                    if (m && m[1]) {
                        const n = parseFloat(m[1].replace(/,/g, ''));
                        if (!isNaN(n)) prices.push(n);
                    }
                } catch (e) { /* ignore per-item errors */ }
            }
        } catch (e) {}
        return prices;
    }

    async sortBy(label) {
        const sel = this.page.locator(this.selectors.sortSelect).first();
        if (await sel.count()) {
            // get list of options into an array
            const options = await sel.evaluate((s) => Array.from(s.options).map(o => ({ value: o.value, text: (o.textContent || '').trim() })) ).catch(() => []);
            // store for debugging / external inspection
            this.lastSortOptions = options;

            const normalize = (s) => (s || '').toString().trim().toLowerCase();
            const desired = normalize(label);

            // 1) try exact text match
            let found = options.find(o => normalize(o.text) === desired);
            // 2) try case-insensitive contains match
            if (!found) found = options.find(o => normalize(o.text).includes(desired));
            // 3) special-case heuristics: if desired mentions price/low, prefer option with Price|asc value or text containing price + low
            if (!found) {
                if (desired.includes('price') && (desired.includes('low') || desired.includes('asc') || desired.includes('ascending') || desired.includes('low to high'))) {
                    found = options.find(o => (o.value && o.value.toLowerCase().includes('price|asc')) || (normalize(o.text).includes('price') && normalize(o.text).includes('low')) );
                }
            }
            // 4) fallback: pick any option that mentions 'price'
            if (!found) found = options.find(o => normalize(o.text).includes('price') || (o.value && o.value.toLowerCase().includes('price')));

            if (found) {
                try {
                    await sel.selectOption({ value: found.value }).catch(() => {});
                    await this.page.waitForLoadState('networkidle').catch(() => {});
                    // If the caller requested a low/ascending sort, some pages use a separate direction toggle (id="sortdir")
                    try {
                        const desired = (label || '').toString().toLowerCase();
                        if (desired.includes('low') || desired.includes('asc') || desired.includes('ascending') || desired.includes('low to high')) {
                            // find a direction toggle button commonly used in v6
                            const dirBtn = this.page.locator('#sortdir, button[rel="d"], button.sortdir, .sortdir').first();
                            if (await dirBtn.count()) {
                                // check if ascending is already shown; if not, click to toggle
                                const ascVisible = await dirBtn.evaluate((el) => {
                                    try {
                                        const asc = el.querySelector('.ascendingOrder');
                                        if (!asc) return false;
                                        const cs = window.getComputedStyle(asc);
                                        return cs && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
                                    } catch (e) { return false; }
                                }).catch(() => false);
                                if (!ascVisible) {
                                    await dirBtn.click().catch(() => {});
                                    await this.page.waitForLoadState('networkidle').catch(() => {});
                                }
                            }
                        }
                    } catch (e) { /* ignore direction toggle errors */ }
                    return true;
                } catch (e) { /* ignore and try other click fallbacks below */ }
            }
        }

        // fallback to buttons or text links if select-based approach didn't work
        const btn = this.page.locator(`button:has-text("${label}")`).first();
        if (await btn.count()) { await btn.click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
        const item = this.page.locator(`text=${label}`).first();
        if (await item.count()) { await item.click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }

        return false;
    }

    async getSortOptions() {
        const sel = this.page.locator(this.selectors.sortSelect).first();
        if (!await sel.count()) return [];
        const options = await sel.evaluate((s) => Array.from(s.options).map(o => ({ value: o.value, text: (o.textContent || '').trim() })) ).catch(() => []);
        return options;
    }

    async getSelectedOptionText(selectSelector) {
        const sel = this.page.locator(selectSelector).first();
        if (await sel.count()) {
            try {
                return await sel.evaluate((s) => s.options[s.selectedIndex].textContent.trim());
            } catch (e) { return null; }
        }
        return null;
    }

    async getCategoryDefault() {
        // Prefer select-based controls
        const txt = await this.getSelectedOptionText(this.selectors.categorySelect);
        if (txt) return txt;
        // v7 sometimes renders filters as checkbox groups instead of selects
        try {
            // Look for common v7 category filter group container
            const group = this.page.locator('.filter-groups__item--category, .filter-group--category, .filter-group').first();
            if (await group.count()) {
                // If a checkbox is checked or an active label exists, return its text
                const checked = group.locator('input[type="checkbox"]:checked + label, input[type="radio"]:checked + label');
                if (await checked.count()) {
                    const txt = await checked.first().textContent().catch(() => null);
                    if (txt) return txt.trim();
                }
                // sometimes label wraps the input
                const wrapped = group.locator('label > input:checked').first();
                if (await wrapped.count()) {
                    const lbl = await wrapped.evaluate((el) => el.parentElement && el.parentElement.textContent ? el.parentElement.textContent.trim() : null).catch(() => null);
                    if (lbl) return lbl;
                }
                const heading = await group.locator('h4, .filter-group__title, .filter-groups__title').first().textContent().catch(() => null);
                if (heading) return heading.trim();
            }
        } catch (e) {}
        return null;
    }
    async getMakeDefault() { return await this.getSelectedOptionText(this.selectors.makeSelect); }
    async getYearDefault() { return await this.getSelectedOptionText(this.selectors.yearSelect); }

    async selectCategory(label) {
        // 1) Try classic <select> controls first
        const sel = this.page.locator(this.selectors.categorySelect).first();
        if (await sel.count()) {
            await sel.selectOption({ label }).catch(() => {});
            await this.page.waitForLoadState('networkidle').catch(() => {});
            return true;
        }

        // 2) v7: checkbox / label groups. Find labels inside known filter-group containers
        try {
            // look specifically for category/subcategory groups first
            const groups = this.page.locator('.filter-groups__item[filtername="category"], .filter-groups__item[filtername="subcategory"], .filter-groups__item, .filter-group');
            if (await groups.count()) {
                const allLabels = groups.locator('label, .filter__text, .filters__item');
                const count = await allLabels.count();
                const desiredRaw = (label || '').toString().trim();
                const desired = desiredRaw.toLowerCase();
                // try direct contains match first
                for (let i = 0; i < count; i++) {
                    const lbl = allLabels.nth(i);
                    const txt = (await lbl.textContent().catch(() => '')) || '';
                    const title = (await lbl.getAttribute('title').catch(() => '')) || '';
                    // check associated input value if present
                    let inputVal = '';
                    try { const input = lbl.locator('input').first(); if (await input.count()) inputVal = (await input.getAttribute('value').catch(() => '')) || ''; } catch (e) {}
                    if (txt.toLowerCase().includes(desired) || title.toLowerCase().includes(desired) || inputVal.toLowerCase().includes(desired)) {
                        // click input if present, otherwise the label/text element
                        const input = lbl.locator('input').first();
                        if (await input.count()) {
                            try { await input.click().catch(() => {}); } catch (e) { await lbl.click().catch(() => {}); }
                        } else {
                            await lbl.click().catch(() => {});
                        }
                        await this.page.waitForLoadState('networkidle').catch(() => {});
                        return true;
                    }
                }

                // If no direct contains match, try token intersection: split desired into tokens and find label containing all tokens
                const tokens = desired.split(/\s+/).filter(Boolean);
                if (tokens.length > 0) {
                    for (let i = 0; i < count; i++) {
                        const lbl = allLabels.nth(i);
                        const txt = ((await lbl.textContent().catch(() => '')) || '').toLowerCase();
                        const title = ((await lbl.getAttribute('title').catch(() => '')) || '').toLowerCase();
                        const inputVal = (await lbl.locator('input').first().getAttribute('value').catch(() => '')).toLowerCase();
                        const hay = `${txt} ${title} ${inputVal}`;
                        const allMatch = tokens.every(t => hay.includes(t));
                        if (allMatch) {
                            const input = lbl.locator('input').first();
                            if (await input.count()) {
                                try { await input.click().catch(() => {}); } catch (e) { await lbl.click().catch(() => {}); }
                            } else {
                                await lbl.click().catch(() => {});
                            }
                            await this.page.waitForLoadState('networkidle').catch(() => {});
                            return true;
                        }
                    }
                }
            }
        } catch (e) { /* ignore and try other fallbacks */ }

        // 3) Quick-link anchors sometimes exist: data-cat attributes or hrefs containing category text
        try {
            const anchors = this.page.locator(`a[data-cat], a[href*="${label}" i]`);
            if (await anchors.count()) { await anchors.first().click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
        } catch (e) {}

        // 4) Generic text click fallback (may click nearby text)
        const item = this.page.locator(`text=${label}`).first();
        if (await item.count()) { await item.click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }

        return false;
    }

    async selectMake(label) {
       
        const sel = this.page.locator(this.selectors.makeSelect).first();
        sel.click();
        if (await sel.count()) {
            await sel.selectOption({ label }).catch(() => {});
            await this.page.waitForLoadState('networkidle').catch(() => {});
            return true;
        }

        // 2) v7: checkbox / label groups for makes
        try {
            const groups = this.page.locator('.filter-groups__item[filtername="make"], .filter-groups__item--make, .filter-group');
            if (await groups.count()) {
                const allLabels = groups.locator('label, .filter__text, .filters__item');
                const count = await allLabels.count();
                const desired = (label || '').toString().trim().toLowerCase();
                for (let i = 0; i < count; i++) {
                    const lbl = allLabels.nth(i);
                    const txt = (await lbl.textContent().catch(() => '')) || '';
                    const title = (await lbl.getAttribute('title').catch(() => '')) || '';
                    let inputVal = '';
                    try { const input = lbl.locator('input').first(); if (await input.count()) inputVal = (await input.getAttribute('value').catch(() => '')) || ''; } catch (e) {}
                    if (txt.toLowerCase().includes(desired) || title.toLowerCase().includes(desired) || inputVal.toLowerCase().includes(desired)) {
                        const input = lbl.locator('input').first();
                        if (await input.count()) {
                            try { await input.click().catch(() => {}); } catch (e) { await lbl.click().catch(() => {}); }
                        } else {
                            await lbl.click().catch(() => {});
                        }
                        await this.page.waitForLoadState('networkidle').catch(() => {});
                        return true;
                    }
                }
            }
        } catch (e) { /* ignore */ }

        // 3) anchors or quick-links
        try {
            const anchors = this.page.locator(`a[data-make], a[href*="${label}" i]`);
            if (await anchors.count()) { await anchors.first().click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
        } catch (e) {}

        // 4) generic text fallback
        const item = this.page.locator(`text=${label}`).first();
        if (await item.count()) { await item.click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
        return false;
    }

    async selectYear(label) {
        // prefer classic select
        const sel = this.page.locator(this.selectors.yearSelect).first();
        if (await sel.count()) {
            try {
                // try exact label first
                const opts = await sel.evaluate((s) => Array.from(s.options).map(o => ({ value: o.value, text: (o.textContent||'').trim() })) ).catch(() => []);
                const desired = (label || '').toString().trim();
                // exact text
                let found = opts.find(o => o.text === desired || o.value === desired);
                if (!found) found = opts.find(o => o.text.toLowerCase().includes(desired.toLowerCase()) || (o.value || '').toLowerCase().includes(desired.toLowerCase()));
                // if still not found, try numeric nearest match
                if (!found) {
                    const nums = opts.map(o => {
                        const m = (o.text || o.value || '').match(/(20[0-9]{2})/);
                        return m ? parseInt(m[1], 10) : null;
                    }).filter(n => n);
                    const desiredNum = parseInt(desired, 10);
                    if (!isNaN(desiredNum) && nums.length) {
                        // choose the option with minimal absolute difference
                        let best = null; let bestDiff = Infinity; let bestOpt = null;
                        for (const o of opts) {
                            const m = (o.text || o.value || '').match(/(20[0-9]{2})/);
                            if (m) {
                                const n = parseInt(m[1], 10);
                                const d = Math.abs(n - desiredNum);
                                if (d < bestDiff) { bestDiff = d; best = n; bestOpt = o; }
                            }
                        }
                        if (bestOpt) found = bestOpt;
                    }
                }
                if (found) {
                    await sel.selectOption({ value: found.value }).catch(() => {});
                    await this.page.waitForLoadState('networkidle').catch(() => {});
                    return found.text || found.value;
                }
            } catch (e) {}
        }

        // v7: year may be rendered as .filter__select inside year filter group
        try {
            const group = this.page.locator('.filter-groups__item[filtername="year"], .filter-groups__item--year, .filter-group--year, .filter-group').first();
            if (await group.count()) {
                const selects = group.locator('select.filter__select, select');
                const sc = await selects.count();
                for (let i = 0; i < sc; i++) {
                    const s = selects.nth(i);
                    try {
                        // try to select by visible label first
                        const opts = await s.evaluate((sel) => Array.from(sel.options).map(o => ({ value: o.value, text: (o.textContent||'').trim() })) ).catch(() => []);
                        const desired = (label || '').toString().trim();
                        let found = opts.find(o => o.text === desired || o.value === desired);
                        if (!found) found = opts.find(o => o.text.toLowerCase().includes(desired.toLowerCase()) || (o.value||'').toLowerCase().includes(desired.toLowerCase()));
                        if (!found) {
                            const desiredNum = parseInt(desired, 10);
                            if (!isNaN(desiredNum)) {
                                let bestOpt = null; let bestDiff = Infinity;
                                for (const o of opts) {
                                    const m = (o.text || o.value || '').match(/(20[0-9]{2})/);
                                    if (m) {
                                        const n = parseInt(m[1], 10);
                                        const d = Math.abs(n - desiredNum);
                                        if (d < bestDiff) { bestDiff = d; bestOpt = o; }
                                    }
                                }
                                if (bestOpt) found = bestOpt;
                            }
                        }
                        if (found) { await s.selectOption({ value: found.value }).catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return found.text || found.value; }
                    } catch (e) {}
                }
            }
        } catch (e) {}

        // fallback: click label text matching year
        try {
            const labels = this.page.locator('.filter__text, label');
            const count = await labels.count();
            for (let i = 0; i < count; i++) {
                const t = (await labels.nth(i).textContent().catch(() => '')).trim();
                if (t === label || t.includes(label)) { await labels.nth(i).click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return true; }
            }
        } catch (e) {}

        const item = this.page.locator(`text=${label}`).first();
        if (await item.count()) { await item.click().catch(() => {}); await this.page.waitForLoadState('networkidle').catch(() => {}); return label; }
        return false;
    }

 
}

module.exports = PublicInventoryPage;
