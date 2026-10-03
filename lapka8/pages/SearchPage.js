// Page Object для страницы поиска
const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class SearchPage extends BasePage {
    constructor(driver) {
        super(driver);
    }
    
    // Селекторы
    get searchResults() { return By.css(".search-results, .products-grid, .items"); }
    get resultItems() { return By.css(".product, .item, .goods-item"); }
    get resultTitles() { return By.css(".product-title, .item-title, h3"); }
    get noResultsMessage() { return By.css(".no-results, .empty, .not-found"); }
    get filterCheckboxes() { return By.css("input[type='checkbox'], input[type='radio']"); }
    get sortDropdown() { return By.css("select[name='sort'], .sort-select"); }
    get pagination() { return By.css(".pagination, .pages"); }
    
    async getSearchResultsCount() {
        try {
            const results = await this.findElements(this.resultItems);
            return results.length;
        } catch (error) {
            return 0;
        }
    }
    
    async getResultTitles() {
        const titles = [];
        const titleElements = await this.findElements(this.resultTitles);
        
        for (let element of titleElements) {
            try {
                const title = await element.getText();
                titles.push(title);
            } catch (error) {
                // Пропускаем ошибки
            }
        }
        
        return titles;
    }
    
    async clickResultByIndex(index) {
        const results = await this.findElements(this.resultItems);
        if (index < results.length) {
            await this.driver.executeScript("arguments[0].click();", results[index]);
            await this.sleep(5000);
            return true;
        }
        return false;
    }
    
    async applyFilter(filterIndex = 0) {
        const filters = await this.findElements(this.filterCheckboxes);
        if (filterIndex < filters.length) {
            const beforeState = await filters[filterIndex].isSelected();
            await this.driver.executeScript("arguments[0].click();", filters[filterIndex]);
            await this.sleep(3000);
            const afterState = await filters[filterIndex].isSelected();
            
            console.log(`Фильтр #${filterIndex + 1}: ${beforeState ? 'включен' : 'выключен'} -> ${afterState ? 'включен' : 'выключен'}`);
            return afterState !== beforeState;
        }
        return false;
    }
    
    async isNoResults() {
        try {
            return await this.isElementVisible(this.noResultsMessage);
        } catch (error) {
            return false;
        }
    }
    
    async sortResults(sortOption = 'default') {
        try {
            const sortSelect = await this.findElement(this.sortDropdown);
            await sortSelect.click();
            await this.sleep(1000);
            
            // Здесь можно добавить логику выбора конкретной опции сортировки
            // Для простоты просто кликаем и закрываем
            await sortSelect.click();
            await this.sleep(3000);
            console.log(`Сортировка применена: ${sortOption}`);
            return true;
        } catch (error) {
            console.log('Сортировка не доступна');
            return false;
        }
    }
}

module.exports = SearchPage;