// Page Object для страницы товара
const BasePage = require('./BasePage.js');
const { By } = require('selenium-webdriver');

class ProductPage extends BasePage {
    constructor(driver) {
        super(driver);
    }
    
    // Селекторы
    get productTitle() { return By.css("h1, .product-title, .item-title"); }
    get productPrice() { return By.css(".price, .product-price, .item-price"); }
    get productDescription() { return By.css(".description, .product-description"); }
    get addToCartButton() { return By.css(".add-to-cart, .cart-button, [type='submit']"); }
    get quantityInput() { return By.css("input[name='quantity'], .quantity-input"); }
    get productImages() { return By.css(".product-image, .gallery img"); }
    get breadcrumbs() { return By.css(".breadcrumbs, .breadcrumb"); }
    get relatedProducts() { return By.css(".related-products, .similar-items"); }
    
    async getProductInfo() {
        const info = {};
        
        try {
            info.title = await this.getText(this.productTitle);
        } catch (error) {
            info.title = 'Не удалось получить название';
        }
        
        try {
            info.price = await this.getText(this.productPrice);
        } catch (error) {
            info.price = 'Не удалось получить цену';
        }
        
        try {
            info.description = await this.getText(this.productDescription);
            if (info.description.length > 200) {
                info.description = info.description.substring(0, 200) + '...';
            }
        } catch (error) {
            info.description = 'Не удалось получить описание';
        }
        
        return info;
    }
    
    async addToCart(quantity = 1) {
        try {
            // Устанавливаем количество, если есть поле
            if (await this.isElementVisible(this.quantityInput)) {
                const quantityField = await this.findElement(this.quantityInput);
                await quantityField.clear();
                await quantityField.sendKeys(quantity.toString());
            }
            
            // Добавляем в корзину
            if (await this.isElementVisible(this.addToCartButton)) {
                await this.clickWithJS(this.addToCartButton);
                await this.sleep(3000);
                console.log(`Товар добавлен в корзину (количество: ${quantity})`);
                return true;
            }
        } catch (error) {
            console.log('Не удалось добавить товар в корзину:', error.message);
        }
        return false;
    }
    
    async getImageCount() {
        try {
            const images = await this.findElements(this.productImages);
            return images.length;
        } catch (error) {
            return 0;
        }
    }
    
    async getBreadcrumbPath() {
        try {
            const breadcrumb = await this.findElement(this.breadcrumbs);
            return await breadcrumb.getText();
        } catch (error) {
            return 'Хлебные крошки не найдены';
        }
    }
    
    async getRelatedProductsCount() {
        try {
            const related = await this.findElements(this.relatedProducts);
            return related.length;
        } catch (error) {
            return 0;
        }
    }
}

module.exports = ProductPage;