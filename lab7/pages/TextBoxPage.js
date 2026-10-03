const BasePage = require("./BasePage");
const { By } = require("selenium-webdriver");

class TextBoxPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      userName: By.id("userName"),
      userEmail: By.id("userEmail"),
      currentAddress: By.id("currentAddress"),
      permanentAddress: By.id("permanentAddress"),
      submitButton: By.id("submit"),
      output: By.id("output")
    };
  }

  async fillForm(name, email, currentAddress, permanentAddress) {
    await this.type(this.locators.userName, name);
    await this.type(this.locators.userEmail, email);
    await this.type(this.locators.currentAddress, currentAddress);
    await this.type(this.locators.permanentAddress, permanentAddress);
    return this;
  }

  async submit() {
    await this.jsClick(await this.findElement(this.locators.submitButton));
    await this.sleep(1000);
    return this;
  }

  async getOutputText() {
    const output = await this.waitForElement(this.locators.output);
    return await output.getText();
  }
}

module.exports = TextBoxPage;