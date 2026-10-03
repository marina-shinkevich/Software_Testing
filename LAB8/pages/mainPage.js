const { By, until } = require('selenium-webdriver');

class MainPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'https://www.kufar.by';
    }

    async open() {
        console.log(`Opening ${this.url}`);
        await this.driver.get(this.url);
        return this;
    }

    async acceptCookies() {
        try {
            // Ждем появления кнопки с куками
            await this.driver.sleep(1000);
            
            // Пробуем найти кнопку по разным селекторам
            const selectors = [
                'button[data-cy="cookie-accept"]',
                '.cookie-agree-button',
                'button.cookie-button',
                '.cookie-banner button',
                'button:has-text("Принять")'
            ];

            for (let selector of selectors) {
                try {
                    const button = await this.driver.findElement(By.css(selector));
                    const text = await button.getText();
                    if (text) {
                        await button.click();
                        console.log(`Cookie accepted via selector: ${selector}`);
                        return this;
                    }
                } catch (e) {
                    continue;
                }
            }

            // Если не нашли по селекторам, ищем любую кнопку с текстом о куках
            const buttons = await this.driver.findElements(By.css('button'));
            for (let button of buttons) {
                try {
                    const text = await button.getText();
                    if (text.toLowerCase().includes('cookie') || 
                        text.toLowerCase().includes('кук') ||
                        text.toLowerCase().includes('принять') ||
                        text.toLowerCase().includes('согласен') ||
                        text.toLowerCase().includes('accept')) {
                        await button.click();
                        console.log('Cookie button clicked by text');
                        return this;
                    }
                } catch (e) {
                    continue;
                }
            }
            console.log('No cookie button found');
        } catch (error) {
            console.log('Error handling cookies:', error.message);
        }
        return this;
    }

    async searchForItem(query) {
        console.log(`Looking for search field...`);
        
        const selectors = [
            'input[name="query"]',
            'input[type="search"]',
            'input[placeholder*="поиск" i]',
            'input[placeholder*="search" i]',
            'input.search-input'
        ];

        let inputField = null;
        for (let selector of selectors) {
            try {
                inputField = await this.driver.findElement(By.css(selector));
                if (inputField) {
                    console.log(`Found search field: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!inputField) {
            console.log('Using first available input');
            const inputs = await this.driver.findElements(By.css('input'));
            if (inputs.length > 0) {
                inputField = inputs[0];
            } else {
                throw new Error('No input fields found');
            }
        }

        await inputField.clear();
        await inputField.sendKeys(query);
        await this.driver.sleep(500);
        await inputField.sendKeys('\n');
        console.log(`Search submitted: "${query}"`);
        return this;
    }

    async getTitle() {
        return await this.driver.getTitle();
    }

    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }
}

module.exports = MainPage;