// Page Object для главной страницы magizoo.ru
const BasePage = require('./BasePage.js');
const { By } = require('selenium-webdriver');

class MagizooHomePage extends BasePage {
    constructor(driver) {
        super(driver);
        this.url = 'https://magizoo.ru/';
    }
    
    // Селекторы для magizoo.ru
    get searchInput() { return By.css("input[type='search'], input[name='q'], input.search"); }
    get catalogButton() { return By.css(".catalog-button, [href*='catalog'], button:contains('Каталог')"); }
    get contactsLink() { return By.css("[href*='contact'], [href*='about'], a:contains('Контакты')"); }
    get cartButton() { return By.css(".cart-button, [href*='cart'], [href*='basket']"); }
    get loginButton() { return By.css(".login-button, [href*='login'], [href*='auth']"); }
    get firstProduct() { return By.css(".product:first-child, .item:first-child, .goods-item:first-child"); }
    get footerLinks() { return By.css("footer a"); }
    
    async openHomePage() {
        await super.open(this.url);
        await this.sleep(3000);
        return this;
    }
    
    async searchProduct(productName) {
        try {
            const input = await this.findElement(this.searchInput);
            await input.clear();
            await input.sendKeys(productName);
            await input.submit();
            await this.sleep(3000);
            return true;
        } catch (error) {
            console.log('Поиск не удался:', error.message);
            return false;
        }
    }
    
    async openCatalog() {
        try {
            await this.clickWithJS(this.catalogButton);
            await this.sleep(3000);
            return true;
        } catch (error) {
            console.log('Не удалось открыть каталог:', error.message);
            return false;
        }
    }
    
    async openContacts() {
        try {
            await this.clickWithJS(this.contactsLink);
            await this.sleep(3000);
            return true;
        } catch (error) {
            console.log('Не удалось открыть контакты:', error.message);
            return false;
        }
    }
    
    async openCart() {
        try {
            await this.clickWithJS(this.cartButton);
            await this.sleep(3000);
            return true;
        } catch (error) {
            console.log('Не удалось открыть корзину:', error.message);
            return false;
        }
    }
    
    async clickRandomFooterLink() {
        try {
            const links = await this.findElements(this.footerLinks);
            if (links.length > 0) {
                const randomIndex = Math.floor(Math.random() * Math.min(3, links.length));
                await this.driver.executeScript("arguments[0].click();", links[randomIndex]);
                await this.sleep(3000);
                return true;
            }
            return false;
        } catch (error) {
            console.log('Не удалось кликнуть по ссылке в футере:', error.message);
            return false;
        }
    }
}

module.exports = MagizooHomePage;