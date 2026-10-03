const { By, until } = require("selenium-webdriver");

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.BASE_URL = "https://demoqa.com";
  }

  async open(path) {
    await this.driver.get(`${this.BASE_URL}${path}`);
    return this;
  }

  async waitForElement(locator, timeout = 15000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async findElement(locator) {
    return await this.driver.findElement(locator);
  }

  async findElements(locator) {
    return await this.driver.findElements(locator);
  }

  async click(locator) {
    const element = await this.waitForElement(locator);
    await element.click();
    return this;
  }

  async jsClick(element) {
    await this.driver.executeScript("arguments[0].click();", element);
    return this;
  }

  async type(locator, text) {
    const element = await this.waitForElement(locator);
    await element.clear();
    await element.sendKeys(text);
    return this;
  }

  async getText(locator) {
    const element = await this.waitForElement(locator);
    return await element.getText();
  }

  async isSelected(locator) {
    const element = await this.waitForElement(locator);
    return await element.isSelected();
  }

  async scrollTo(element) {
    await this.driver.executeScript("arguments[0].scrollIntoView({block:'center'});", element);
    await this.driver.sleep(400);
    return this;
  }

  async sleep(ms) {
    await this.driver.sleep(ms);
    return this;
  }

  // Методы для работы с куками
  async getAllCookies() {
    return await this.driver.manage().getCookies();
  }

  async getCookieByName(name) {
    return await this.driver.manage().getCookie(name);
  }

  async addCookie(cookie) {
    try {
      await this.driver.manage().addCookie(cookie);
    } catch (err) {
      // Если кука не может быть добавлена из-за домена, пробуем без указания домена
      if (err.message.includes('domain') || err.message.includes('Domain')) {
        const cookieWithoutDomain = { ...cookie };
        delete cookieWithoutDomain.domain;
        await this.driver.manage().addCookie(cookieWithoutDomain);
      } else {
        throw err;
      }
    }
    return this;
  }

  async deleteAllCookies() {
    await this.driver.manage().deleteAllCookies();
    return this;
  }

  async deleteCookieByName(name) {
    await this.driver.manage().deleteCookie(name);
    return this;
  }

  // Метод для сохранения скриншота
  async takeScreenshot(filename) {
    const screenshot = await this.driver.takeScreenshot();
    const fs = require('fs');
    const path = require('path');
    
    // Создаем папку screenshots если ее нет
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const filePath = path.join(screenshotsDir, `${filename}.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    console.log(`Скриншот сохранен: ${filePath}`);
    return filePath;
  }
}

module.exports = BasePage;