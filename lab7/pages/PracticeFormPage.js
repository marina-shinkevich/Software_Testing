const BasePage = require("./BasePage");
const { By, Key } = require("selenium-webdriver");

class PracticeFormPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      firstName: By.id("firstName"),
      lastName: By.id("lastName"),
      userEmail: By.id("userEmail"),
      userNumber: By.id("userNumber"),
      genderRadio: (index) => By.xpath(`//label[@for='gender-radio-${index}']`),
      genderRadioInput: (index) => By.id(`gender-radio-${index}`),
      hobbiesCheckbox: (index) => By.xpath(`//label[@for='hobbies-checkbox-${index}']`),
      hobbiesCheckboxInput: (index) => By.id(`hobbies-checkbox-${index}`),
      stateDropdown: By.id("react-select-3-input"),
      cityDropdown: By.id("react-select-4-input"),
      submitButton: By.id("submit"),
      closeModalButton: By.id("closeLargeModal"),
      modalTitle: By.id("example-modal-sizes-title-lg"),
      resultTable: By.className("table-responsive")
    };
  }

  async fillBasicInfo(firstName, lastName, email, phone) {
    await this.type(this.locators.firstName, firstName);
    await this.type(this.locators.lastName, lastName);
    await this.type(this.locators.userEmail, email);
    await this.type(this.locators.userNumber, phone);
    return this;
  }

  async selectGender(genderIndex) {
    const genderLabel = await this.findElement(this.locators.genderRadio(genderIndex));
    await this.scrollTo(genderLabel);
    await this.jsClick(genderLabel);
    return this;
  }

  async selectHobby(hobbyIndex) {
    const hobbyLabel = await this.findElement(this.locators.hobbiesCheckbox(hobbyIndex));
    await this.scrollTo(hobbyLabel);
    await this.jsClick(hobbyLabel);
    return this;
  }

  async selectStateAndCity(state, city) {
    const stateDropdown = await this.findElement(this.locators.stateDropdown);
    await this.scrollTo(stateDropdown);
    await stateDropdown.sendKeys(state);
    await stateDropdown.sendKeys(Key.RETURN);
    await this.sleep(500);

    const cityDropdown = await this.findElement(this.locators.cityDropdown);
    await cityDropdown.sendKeys(city);
    await cityDropdown.sendKeys(Key.RETURN);
    await this.sleep(500);
    
    return this;
  }

  async submitForm() {
    const submitBtn = await this.findElement(this.locators.submitButton);
    await this.scrollTo(submitBtn);
    await this.jsClick(submitBtn);
    await this.sleep(2000);
    return this;
  }

  async getModalTitle() {
    return await this.driver.executeScript(function () {
      var el = document.getElementById("example-modal-sizes-title-lg");
      return el ? el.textContent.trim() : "";
    });
  }

  async getResultText() {
    return await this.driver.executeScript(function () {
      var tds = document.querySelectorAll(".table-responsive td");
      return Array.from(tds).map(function (td) { return td.textContent; }).join(" ");
    });
  }

  async closeModal() {
    await this.jsClick(await this.findElement(this.locators.closeModalButton));
    return this;
  }

  async isGenderSelected(genderIndex) {
    return await this.isSelected(this.locators.genderRadioInput(genderIndex));
  }

  async isHobbySelected(hobbyIndex) {
    return await this.isSelected(this.locators.hobbiesCheckboxInput(hobbyIndex));
  }
}

module.exports = PracticeFormPage;