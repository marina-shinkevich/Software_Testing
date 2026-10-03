const BasePage = require("./BasePage");
const { By } = require("selenium-webdriver");

class WebTablesPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      addButton: By.id("addNewRecordButton"),
      firstName: By.id("firstName"),
      lastName: By.id("lastName"),
      userEmail: By.id("userEmail"),
      age: By.id("age"),
      salary: By.id("salary"),
      department: By.id("department"),
      submitButton: By.id("submit"),
      searchBox: By.id("searchBox"),
      tableRows: By.css(".rt-tr-group")
    };
  }

  async openAddForm() {
    await this.jsClick(await this.findElement(this.locators.addButton));
    await this.sleep(500);
    return this;
  }

  async addRecord(firstName, lastName, email, age, salary, department) {
    await this.type(this.locators.firstName, firstName);
    await this.type(this.locators.lastName, lastName);
    await this.type(this.locators.userEmail, email);
    await this.type(this.locators.age, age);
    await this.type(this.locators.salary, salary);
    await this.type(this.locators.department, department);
    
    await this.jsClick(await this.findElement(this.locators.submitButton));
    await this.sleep(2000);
    return this;
  }

  async search(text) {
    await this.type(this.locators.searchBox, text);
    await this.sleep(1500);
    return this;
  }

  async getTableRows() {
    return await this.findElements(this.locators.tableRows);
  }
}

module.exports = WebTablesPage;