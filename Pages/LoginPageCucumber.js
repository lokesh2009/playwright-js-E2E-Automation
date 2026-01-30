class LoginPageCucumber {
    /**
     * Cucumber-friendly Playwright page object for the Login page.
     * Methods are intentionally simple so step-definitions can call them directly.
     */
    constructor(page) {
        this.page = page;
        this.baseUrl = 'https://automationsandbox-v6.clients.dealerspike.net';
        this.adminpath='/admin'
        // common selectors (kept permissive to work across similar pages)
        this.selectors = {
            username: 'input[name="username"], input[name="email"], #username, input[type="email"]',
            password: 'input[name="password"], #password',
            submit: 'button[type="submit"], button#loginButton, button:has-text("Sign in"), button:has-text("Login"),input[type="submit"]',
            // a generic element that often appears after successful login
            postLoginMarker: 'text=Logout, text=Sign out, text=Dashboard'

            
        };
    }

    async goto(url) {
        // Try a networkidle navigation first; if it fails or times out, fall back
        // to a load wait to be more resilient on slower or restricted test networks.
        try {
            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
        } catch (e) {
            try {
                await this.page.goto(url, { waitUntil: 'load', timeout: 45000 });
            } catch (err) {
                // Re-throw the original error to make failure obvious to the caller
                throw e;
            }
        }
    }

    async enterUsername(username) {
        await this.page.locator(this.selectors.username).fill(username);
    }

    async enterPassword(password) {
        await this.page.locator(this.selectors.password).fill(password);
    }

    async submit() {
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
            this.page.locator(this.selectors.submit).click(),
        ]);
    }

    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.submit();
    }

    /**
     * Returns true if a generic post-login element is visible within timeout.
     */
    async isLoggedIn(timeout = 10000) {
        try {
            await this.page.waitForSelector(this.selectors.postLoginMarker, { timeout });
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = { LoginPageCucumber };
