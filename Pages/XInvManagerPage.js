// Page object for the XInv Manager admin UI
// Provides stable selectors and helper methods used by step definitions.
class XInvManagerPage {
	constructor(page) {
		this.page = page;
		// Known stable indicators
		this.select2ModelChosen = '#s2id_models .select2-chosen';
		this.inputModel = 'input#model';
		this.selectModels = 'select#models, select[name="models"], select.xinv-select';
		this.inventoryTitle = 'text=Inventory Management';
		this.showOptionsButton = 'button:has-text("Show Options"), text=Show Options, text=Est. Monthly Payment';
		this.productId = '#productid';
	}

	async openCanonical(xinvUrl) {
		// Try login first (tests call performAdminLogin separately) then navigate
		await this.page.goto(xinvUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
		// Wait for one of the stable indicators or for a short time
		try {
			await this.page.waitForSelector(`${this.inventoryTitle}, ${this.select2ModelChosen}, ${this.inputModel}`, { timeout: 8000 });
		} catch (e) {
			// let callers handle failures and capture debug artifacts
		}
	}

	async ensureLoaded(timeout = 10000) {
		// Accept any of these as evidence that the admin inventory UI is ready
		const selectors = [this.inventoryTitle, this.select2ModelChosen, this.inputModel, this.productId].join(', ');
		await this.page.waitForSelector(selectors, { timeout }).catch(() => {});
	}

	async clickShowOptions() {
		const loc = this.page.locator(this.showOptionsButton).first();
		if (await loc.count()) {
			await loc.scrollIntoViewIfNeeded();
			await loc.click({ timeout: 5000 }).catch(async () => { await loc.click({ force: true }); });
			await this.page.waitForTimeout(400);
			return true;
		}
		return false;
	}

	async getSelectedModel() {
		// Expanded detection: try multiple selectors commonly used in xinv manager
		const candidates = [
			this.select2ModelChosen,
			'#s2id_models .select2-chosen',
			'#s2id_Model .select2-chosen',
			this.inputModel,
			'input[name="model"]',
			'[id*="model"]',
			'[data-field*="model"]',
			'[data-bind*="model"]',
			this.selectModels,
			'.selected-model',
			'.model-value',
			'.inv-header h1',
			'.product-title',
			'h1', 'h2', 'h3'
		];

		for (const sel of candidates) {
			try {
				const loc = this.page.locator(sel).first();
				if (await loc.count()) {
					// wait briefly for dynamic population when select2 or similar detected
					if (String(sel).toLowerCase().includes('select2') || String(sel).toLowerCase().includes('s2id') || String(sel).toLowerCase().includes('select')) {
						try { await this.page.waitForFunction((s) => {
							const e = document.querySelector(s);
							return e && e.textContent && e.textContent.trim().length > 0;
						}, { timeout: 3000 }, sel).catch(() => {}); } catch (e) {}
					}
					let txt = '';
					try { txt = (await loc.inputValue()).toString(); } catch (e) { txt = (await loc.textContent()) || ''; }
					if (txt && String(txt).trim()) return String(txt).trim();
				}
			} catch (e) {}
		}

		// Last-resort heuristics: scan table rows where label contains 'Model'
		try {
			const labelRow = await this.page.locator('tr:has-text("Model")').first();
			if (await labelRow.count()) {
				const t = (await labelRow.textContent()) || '';
				const parts = t.split('\n').map(p => p.trim()).filter(Boolean);
				if (parts.length > 1) return parts.slice(1).join(' ').trim();
			}
		} catch (e) {}

		// Fallback: grab the most likely product title from header elements
		try {
			const headers = await this.page.locator('h1, h2, h3').allTextContents();
			for (const h of headers) {
				if (h && h.length > 3) return h.trim();
			}
		} catch (e) {}

		// Final fallback: return empty string so caller can save debug artifacts
		return '';
	}
}

module.exports = XInvManagerPage;
