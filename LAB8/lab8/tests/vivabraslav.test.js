const { Builder } = require('selenium-webdriver');
const MainPage = require('../pages/mainPage');
const { takeScreenshot } = require('../utils/screenshot');
const assert = require('assert');

function createDriver() {
    try { return new Builder().forBrowser('MicrosoftEdge').build(); }
    catch { return new Builder().forBrowser('chrome').build(); }
}

describe(' Тест-сьют для VivaBraslav.by', function () {
    let driver, mainPage;
    this.timeout(30000);

    before(async () => {
        driver = createDriver();
        mainPage = new MainPage(driver);
    });

    after(async () => { if (driver) await driver.quit().catch(() => { }); });

    it('@smoke Главная страница загружается', async function () {
        await mainPage.open('/');
        await mainPage.acceptCookies();
        await driver.sleep(2000);
        const title = await mainPage.getTitle();
        await takeScreenshot(driver, 'main_page');
        assert.ok(title.length > 0, 'Заголовок пуст');
    });

    it('Обработка куки', async function () {
        await mainPage.open('/');
        const cookies = await driver.manage().getCookies();
        console.log(` Кук найдено: ${cookies.length}`);
        await driver.manage().addCookie({ name: 'test', value: 'ok' });
        const c = await driver.manage().getCookie('test');
        assert.strictEqual(c.value, 'ok');
        await driver.manage().deleteCookie('test');
    });

    ['tickets', 'faq'].forEach(sec => {
        it(`@navigation Открытие раздела ${sec}`, async function () {
            await mainPage.open('/');
            await mainPage.navigateToSection(sec);
            await driver.sleep(2000);
            const url = await mainPage.getCurrentUrl();
            await takeScreenshot(driver, `section_${sec}`);
            assert.ok(url.includes(sec), `URL не содержит ${sec}`);
        });
    });

    it.skip('@skip Пропущен', () => { });

    it('@failing Ожидаемое падение', function () {
        assert.fail('❌ Специально для демонстрации');
    });
});