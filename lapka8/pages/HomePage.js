// Page Object для главной страницы podaro4ek.by
const BasePage = require('./BasePage.js');
const { By } = require('selenium-webdriver');

class HomePage extends BasePage {
    constructor(driver) {
        super(driver);
        this.url = 'https://podaro4ek.by/';
    }
    
    // Селекторы
    get searchInput() { return By.css("input[name='keyword']"); }
    get searchButton() { return By.css("button[type='submit']"); }
    get catalogLink() { return By.xpath("//a[contains(text(),'Каталог') or contains(text(),'КАТАЛОГ')]"); }
    get aboutLink() { return By.xpath("//a[contains(text(),'О магазине') or contains(@href,'about')]"); }
    get contactsLink() { return By.xpath("//a[contains(text(),'Контакты') or contains(@href,'contact')]"); }
    get deliveryLink() { return By.xpath("//a[contains(text(),'Доставка')]"); }
    get firstProduct() { return By.css("a:first-child"); }
    get productLinks() { return By.css(".product a, .item a, h3 a"); }
    get languageSwitcher() { return By.css("[class*='language'], [href*='lang']"); }
    get cookieNotice() { return By.css(".cookie-notice, [class*='cookie']"); }
    get acceptCookiesButton() { return By.css(".cookie-accept, [class*='accept-cookie']"); }
    
    async open() {
        await super.open(this.url);
        await this.sleep(5000);
        return this;
    }
    
    async searchProduct(productName) {
        await this.type(this.searchInput, productName);
        const input = await this.findElement(this.searchInput);
        await input.submit(); // Отправляем форму
        await this.sleep(5000);
        return this;
    }
    
    async openCatalog() {
        await this.clickWithJS(this.catalogLink);
        await this.sleep(5000);
        return this;
    }
    
    async openAboutPage() {
        await this.clickWithJS(this.aboutLink);
        await this.sleep(5000);
        return this;
    }
    
    async openContactsPage() {
        await this.clickWithJS(this.contactsLink);
        await this.sleep(5000);
        return this;
    }
    
    async openDeliveryPage() {
        await this.clickWithJS(this.deliveryLink);
        await this.sleep(5000);
        return this;
    }
    
    async clickFirstProduct() {
        await this.clickWithJS(this.firstProduct);
        await this.sleep(5000);
        return this;
    }
    
    async clickRandomProduct() {
        const products = await this.findElements(this.productLinks);
        if (products.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(5, products.length));
            await this.driver.executeScript("arguments[0].click();", products[randomIndex]);
            await this.sleep(5000);
        }
        return this;
    }
    
    async acceptCookiesIfPresent() {
        try {
            if (await this.isElementVisible(this.cookieNotice)) {
                console.log('Обнаружено уведомление о куки');
                if (await this.isElementVisible(this.acceptCookiesButton)) {
                    await this.clickWithJS(this.acceptCookiesButton);
                    console.log('Куки приняты');
                    await this.sleep(2000);
                }
            }
        } catch (error) {
            // Игнорируем ошибки, если элементов нет
        }
        return this;
    }
    
    async switchLanguage() {
        try {
            if (await this.isElementVisible(this.languageSwitcher)) {
                await this.clickWithJS(this.languageSwitcher);
                await this.sleep(3000);
                console.log('Язык переключен');
            }
        } catch (error) {
            // Игнорируем ошибки, если переключателя нет
        }
        return this;
    }
    
    async getProductCount() {
        const products = await this.findElements(this.productLinks);
        return products.length;
    }
}

module.exports = HomePage;