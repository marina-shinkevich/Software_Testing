// Базовый класс Page Object
const { By, until } = require('selenium-webdriver');

class BasePage {
    constructor(driver) {
        this.driver = driver;
    }
    
    async open(url) {
        await this.driver.get(url);
        return this;
    }
    
    async waitForElement(selector, timeout = 10000) {
        const element = await this.driver.wait(
            until.elementLocated(selector),
            timeout
        );
        await this.driver.wait(until.elementIsVisible(element), timeout);
        return element;
    }
    
    async findElement(selector) {
        return await this.driver.findElement(selector);
    }
    
    async findElements(selector) {
        return await this.driver.findElements(selector);
    }
    
    async click(selector) {
        const element = await this.waitForElement(selector);
        await element.click();
        return element;
    }
    
    async clickWithJS(selector) {
        const element = await this.waitForElement(selector);
        await this.driver.executeScript("arguments[0].click();", element);
        return element;
    }
    
    async type(selector, text) {
        const element = await this.waitForElement(selector);
        await element.clear();
        await element.sendKeys(text);
        return element;
    }
    
    async getText(selector) {
        const element = await this.waitForElement(selector);
        return await element.getText();
    }
    
    async getAttribute(selector, attribute) {
        const element = await this.waitForElement(selector);
        return await element.getAttribute(attribute);
    }
    
    async isElementVisible(selector) {
        try {
            const element = await this.findElement(selector);
            return await element.isDisplayed();
        } catch (error) {
            return false;
        }
    }
    
    async sleep(ms) {
        await this.driver.sleep(ms);
    }
    
    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }
    
    async getTitle() {
        return await this.driver.getTitle();
    }
    
    async scrollToElement(selector) {
        const element = await this.waitForElement(selector);
        await this.driver.executeScript(
            "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
            element
        );
        return element;
    }
    
    // Метод для поиска элемента с несколькими вариантами селекторов
    async findElementWithRetry(selectors, timeout = 10000) {
        for (let selector of selectors) {
            try {
                const element = await this.driver.wait(
                    until.elementLocated(selector),
                    3000
                );
                await this.driver.wait(until.elementIsVisible(element), 3000);
                return element;
            } catch (e) {
                // Продолжаем пробовать следующий селектор
            }
        }
        throw new Error(`Не удалось найти элемент ни по одному из селекторов`);
    }
}

module.exports = BasePage;