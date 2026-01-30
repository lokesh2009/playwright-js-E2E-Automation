class LoginPage{
    constructor(page){
        this.page = page;
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('button#loginButton');
    }

    async launchUrl(url){
        await this.page.goto(url);
    }

    async enterUsername(username){
        await this.usernameInput.fill(process.env.EMAIL || username);
    }

    async enterPassword(password){
        await this.passwordInput.fill(password);
    }

    async clickLogin(){
        await this.loginButton.click();
    }
}

module.exports = {LoginPage};