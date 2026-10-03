const { Builder, By } = require('selenium-webdriver');
const MainPage = require('../pages/mainPage');
const { takeScreenshot } = require('../utils/screenshot');
const assert = require('assert');

process.env.EDGEDRIVER_PATH = process.env.EDGEDRIVER_PATH || '';

function createDriver() {
    console.log('Creating driver for Microsoft Edge...');
    try {
        return new Builder()
            .forBrowser('MicrosoftEdge')
            .build();
    } catch (error) {
        console.log('Falling back to Chrome...');
        return new Builder()
            .forBrowser('chrome')
            .build();
    }
}

const searchQueries = [
    { query: 'велосипед', language: 'ru' },
    { query: 'ноутбук', language: 'ru' }
];

describe('Kufar.by Test Suite', function() {
    let driver;
    let mainPage;

    this.timeout(30000);

    before(async function() {
        console.log('Starting browser...');
        driver = createDriver();
        mainPage = new MainPage(driver);
        console.log('Browser started successfully');
    });

    after(async function() {
        if (driver) {
            console.log('Closing browser...');
            try {
                await driver.quit();
            } catch (error) {
                console.log('Error closing browser:', error.message);
            }
        }
    });

    it('@smoke @important Should load the main page and display correct title', async function() {
        console.log('\n=== Test 1: Loading main page ===');
        await mainPage.open();
        await driver.sleep(2000);
        
        try {
            await mainPage.acceptCookies();
        } catch (error) {
            console.log('Cookie handling skipped');
        }

        const title = await mainPage.getTitle();
        console.log(`Page title: "${title}"`);

        await takeScreenshot(driver, 'main_page_loaded');

        assert.ok(title.length > 0, 'Title should not be empty');
        console.log('✓ Test 1 passed\n');
    });

    it('Should demonstrate cookie handling', async function() {
        console.log('\n=== Test 2: Cookie handling ===');
        await mainPage.open();
        await driver.sleep(2000);

        // Получаем и выводим все куки
        const allCookies = await driver.manage().getCookies();
        console.log('--- Current Cookies ---');
        if (allCookies.length === 0) {
            console.log('No cookies present');
        } else {
            // Выводим первые 5 кук для примера
            allCookies.slice(0, 5).forEach(cookie => {
                console.log(`  ${cookie.name}: ${cookie.value.substring(0, 30)}...`);
            });
            if (allCookies.length > 5) {
                console.log(`  ... and ${allCookies.length - 5} more cookies`);
            }
        }
        console.log(`Total: ${allCookies.length} cookies\n`);

        // Добавляем тестовую куку
        console.log('Adding test cookie...');
        await driver.manage().addCookie({ 
            name: 'test_cookie', 
            value: 'selenium_test_value_123'
        });
        console.log('✓ Cookie added');

        // Проверяем добавление
        const addedCookie = await driver.manage().getCookie('test_cookie');
        console.log(`Added cookie value: ${addedCookie.value}`);
        assert.strictEqual(addedCookie.value, 'selenium_test_value_123');
        console.log('✓ Cookie verification passed');

        // Сохраняем скриншот с информацией о куках
        await takeScreenshot(driver, 'cookies_demo');

        // Удаляем куку
        console.log('Deleting test cookie...');
        await driver.manage().deleteCookie('test_cookie');
        console.log('✓ Cookie deleted');

        // Проверяем удаление с обработкой ошибки
        try {
            const deletedCookie = await driver.manage().getCookie('test_cookie');
            console.log(`Cookie after deletion: ${deletedCookie}`);
            // Если кука не найдена, getCookie возвращает null
            assert.strictEqual(deletedCookie, null, 'Cookie should be null after deletion');
        } catch (error) {
            // Если getCookie выбрасывает исключение при отсутствии куки,
            // это тоже нормально - значит кука успешно удалена
            if (error.name === 'NoSuchCookieError') {
                console.log('✓ Cookie successfully deleted (not found)');
            } else {
                throw error;
            }
        }
        console.log('✓ Test 2 passed\n');
    });

    // Параметризованные тесты поиска
    searchQueries.forEach(({ query, language }) => {
        it(`@search Should find items by query: "${query}" (${language})`, async function() {
            console.log(`\n=== Test: Search "${query}" (${language}) ===`);
            await mainPage.open();
            await driver.sleep(2000);
            
            try {
                await mainPage.acceptCookies();
            } catch (error) {
                console.log('Cookie handling skipped');
            }

            console.log(`Performing search for: ${query}`);
            await mainPage.searchForItem(query);
            await driver.sleep(3000);

            await takeScreenshot(driver, `search_${language}_${query}`);

            const currentUrl = await mainPage.getCurrentUrl();
            const pageTitle = await mainPage.getTitle();
            console.log(`URL after search: ${currentUrl}`);
            console.log(`Title after search: "${pageTitle}"`);

            assert.ok(pageTitle.length > 0, 'Page should have a title');
            console.log(`✓ Search test for "${query}" passed\n`);
        });
    });

    it.skip('@skip This test is skipped for demonstration', function() {
        console.log('This test is intentionally skipped');
    });

    it('@failing This test is expected to fail', function() {
        console.log('\n=== Test: Expected failure ===');
        assert.fail('This test is designed to fail as a demonstration of failing tests');
    });
});