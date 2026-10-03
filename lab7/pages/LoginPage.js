const BasePage = require("./BasePage");
const { By } = require("selenium-webdriver");

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      usernameInput: By.id("userName"),
      passwordInput: By.id("password"),
      loginButton: By.id("login"),
      userNameValue: By.id("userName-value")
    };
  }

  async login(username, password) {
    await this.open("/login");
    await this.sleep(2000);
    
    await this.type(this.locators.usernameInput, username);
    await this.type(this.locators.passwordInput, password);
    await this.click(this.locators.loginButton);
    await this.sleep(2000);
    
    return this;
  }

  async getDisplayedUsername() {
    return await this.getText(this.locators.userNameValue);
  }
}

module.exports = LoginPage;