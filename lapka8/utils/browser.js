// Утилиты для работы с браузером
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

class BrowserUtils {
    static async createDriver(options = {}) {
        let chromeOptions = new chrome.Options();
        
        // Базовые опции
        chromeOptions.addArguments(
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-gpu',
            '--window-size=1920,1080'
        );
        
        // Дополнительные опции из параметров
        if (options.headless) {
            chromeOptions.addArguments('--headless');
        }
        
        if (options.language) {
            chromeOptions.addArguments(`--lang=${options.language}`);
        }
        
        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
        
        // Максимизируем окно
        await driver.manage().window().maximize();
        
        // Настраиваем таймауты
        await driver.manage().setTimeouts({
            implicit: 20000,
            pageLoad: 40000,
            script: 30000
        });
        
        return driver;
    }
    
    static async takeScreenshot(driver, filename = 'screenshot.png') {
        try {
            let screenshot = await driver.takeScreenshot();
            fs.writeFileSync(filename, screenshot, 'base64');
            console.log(`Скриншот сохранен: ${filename}`);
            return filename;
        } catch (error) {
            console.error('Ошибка при создании скриншота:', error.message);
            return null;
        }
    }
    
    static async getCookies(driver) {
        try {
            const cookies = await driver.manage().getCookies();
            return cookies;
        } catch (error) {
            console.error('Ошибка при получении куки:', error.message);
            return [];
        }
    }
    
    static async saveCookiesToFile(driver, filename = 'cookies.json') {
        try {
            const cookies = await this.getCookies(driver);
            fs.writeFileSync(filename, JSON.stringify(cookies, null, 2));
            console.log(`Куки сохранены в файл: ${filename}`);
            return cookies;
        } catch (error) {
            console.error('Ошибка при сохранении куки:', error.message);
            return [];
        }
    }
    
    static async loadCookiesFromFile(driver, filename = 'cookies.json') {
        try {
            if (fs.existsSync(filename)) {
                const cookiesData = fs.readFileSync(filename, 'utf8');
                const cookies = JSON.parse(cookiesData);
                
                for (const cookie of cookies) {
                    await driver.manage().addCookie(cookie);
                }
                
                console.log(`Куки загружены из файла: ${filename}`);
                return cookies;
            } else {
                console.log(`Файл с куками не найден: ${filename}`);
                return [];
            }
        } catch (error) {
            console.error('Ошибка при загрузке куки:', error.message);
            return [];
        }
    }
    
    static async printCookies(driver) {
        const cookies = await this.getCookies(driver);
        console.log('\n=== КУКИ САЙТА ===');
        console.log(`Всего куки: ${cookies.length}`);
        
        cookies.forEach((cookie, index) => {
            console.log(`\nКуки #${index + 1}:`);
            console.log(`  Имя: ${cookie.name}`);
            console.log(`  Значение: ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}`);
            console.log(`  Домен: ${cookie.domain}`);
            console.log(`  Путь: ${cookie.path}`);
            console.log(`  Безопасный: ${cookie.secure}`);
            console.log(`  HTTP Only: ${cookie.httpOnly}`);
            if (cookie.expiry) {
                const expiryDate = new Date(cookie.expiry * 1000);
                console.log(`  Срок действия: ${expiryDate.toLocaleString()}`);
            }
        });
        
        return cookies;
    }
}

module.exports = BrowserUtils;