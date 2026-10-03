const { By, until } = require('selenium-webdriver');

class MainPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = 'https://vivabraslav.by';
    }

    async open(path = '/') {
        await this.driver.get(this.baseUrl + path);
        return this; // ✅ Явный возврат
    }

    async acceptCookies() {
        try {
            await this.driver.sleep(1000);
            const selectors = [
                'button[data-cookie-accept]', 'button[data-cy="cookie-accept"]',
                '.cookie-banner button', '.cookie-consent__accept', 'button[class*="accept"]'
            ];
            for (const sel of selectors) {
                try {
                    const btn = await this.driver.wait(until.elementLocated(By.css(sel)), 2000);
                    if (await btn.isDisplayed()) { await btn.click(); return this; }
                } catch { }
            }
            const btns = await this.driver.findElements(By.css('button'));
            for (const b of btns) {
                const txt = (await b.getText()).toLowerCase();
                if (txt.includes('принять') || txt.includes('согласен') || txt.includes('accept')) {
                    await b.click(); return this;
                }
            }
            console.log('ℹ Баннер кук не найден');
        } catch (e) { console.log('⚠ Ошибка кук:', e.message); }
        return this; // 
    }

    async navigateToSection(section) {
        const map = { tickets: '/tickets', faq: '/faq', program: '/program', contacts: '/contacts' };
        const p = map[section] || `/${section}`;
        try {
            const link = await this.driver.findElement(By.css(`a[href*="${section}"], a[href="${p}"]`));
            await link.click();
            await this.driver.wait(until.urlContains(p), 5000);
        } catch {
            await this.open(p);
        }
        return this;
    }

    async isElementVisible({ by, value, timeout = 3000 }) {
        try {
            const el = await this.driver.wait(until.elementLocated(by(value)), timeout);
            return await el.isDisplayed();
        } catch { return false; }
    }

    async getTitle() { return await this.driver.getTitle(); }
    async getCurrentUrl() { return await this.driver.getCurrentUrl(); }
}

module.exports = MainPage;