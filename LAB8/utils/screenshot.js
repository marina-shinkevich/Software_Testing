// utils/screenshot.js
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '..', 'screenshots');

// Создаем папку для скриншотов, если её нет
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

async function takeScreenshot(driver, name = 'screenshot') {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}_${timestamp}.png`;
        const filepath = path.join(screenshotDir, filename);

        const image = await driver.takeScreenshot();
        fs.writeFileSync(filepath, image, 'base64');
        console.log(`Screenshot saved to: ${filepath}`);
        return filepath;
    } catch (error) {
        console.error('Failed to take screenshot:', error);
        throw error;
    }
}

module.exports = { takeScreenshot };