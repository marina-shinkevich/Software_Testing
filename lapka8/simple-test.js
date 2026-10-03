// Простой тест для MagizooHomePage без Mocha
const { Builder, Browser } = require('selenium-webdriver');
const MagizooHomePage = require('./pages/MagizooHomePage.js');

async function runTests() {
    let driver;
    
    try {
        console.log('Запуск тестов MagizooHomePage...');
        
        // Инициализация драйвера
        driver = await new Builder()
            .forBrowser(Browser.CHROME)
            .build();
        
        const magizooPage = new MagizooHomePage(driver);
        
        // Тест 1: Открытие главной страницы
        console.log('\n=== Тест 1: Открытие главной страницы ===');
        await magizooPage.openHomePage();
        const currentUrl = await magizooPage.getCurrentUrl();
        const title = await magizooPage.getTitle();
        
        console.log('Текущий URL:', currentUrl);
        console.log('Заголовок страницы:', title);
        
        if (currentUrl.includes('magizoo.ru')) {
            console.log('✓ Успешно открыта главная страница magizoo.ru');
        } else {
            console.log('⚠ Внимание: текущий URL не содержит magizoo.ru');
        }
        
        if (title && title.trim() !== '') {
            console.log('✓ Заголовок страницы не пустой');
        } else {
            console.log('✗ Ошибка: заголовок страницы пустой');
        }
        
        // Тест 2: Проверка видимости элементов
        console.log('\n=== Тест 2: Проверка элементов страницы ===');
        
        try {
            const searchVisible = await magizooPage.isElementVisible(magizooPage.searchInput);
            console.log('Поле поиска видимо:', searchVisible ? '✓' : '✗');
        } catch (error) {
            console.log('Поле поиска:', '✗ (ошибка:', error.message + ')');
        }
        
        try {
            const catalogVisible = await magizooPage.isElementVisible(magizooPage.catalogButton);
            console.log('Кнопка каталога видима:', catalogVisible ? '✓' : '✗');
        } catch (error) {
            console.log('Кнопка каталога:', '✗ (ошибка:', error.message + ')');
        }
        
        // Тест 3: Поиск товара
        console.log('\n=== Тест 3: Поиск товара ===');
        const searchResult = await magizooPage.searchProduct('корм');
        
        if (searchResult) {
            console.log('✓ Поиск выполнен успешно');
            const urlAfterSearch = await magizooPage.getCurrentUrl();
            console.log('URL после поиска:', urlAfterSearch);
        } else {
            console.log('✗ Поиск не удался (возможно элемент поиска не найден)');
        }
        
        // Тест 4: Навигация (пробуем открыть каталог)
        console.log('\n=== Тест 4: Навигация по сайту ===');
        
        // Возвращаемся на главную
        await magizooPage.openHomePage();
        
        const catalogResult = await magizooPage.openCatalog();
        if (catalogResult) {
            console.log('✓ Каталог открыт успешно');
            const urlAfterCatalog = await magizooPage.getCurrentUrl();
            console.log('URL после каталога:', urlAfterCatalog);
        } else {
            console.log('✗ Не удалось открыть каталог');
        }
        
        console.log('\n=== Все тесты завершены ===');
        
    } catch (error) {
        console.error('Ошибка при выполнении тестов:', error);
    } finally {
        // Закрытие драйвера
        if (driver) {
            console.log('\nЗакрытие браузера...');
            await driver.quit();
            console.log('Браузер закрыт.');
        }
    }
}

// Запуск тестов, если файл выполняется напрямую
if (require.main === module) {
    runTests();
}

module.exports = { runTests };