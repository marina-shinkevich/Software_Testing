// Пример работы со скриншотами в Selenium WebDriver

const { Builder } = require("selenium-webdriver");
const fs = require('fs');
const path = require('path');
require("edgedriver");

async function takeScreenshot(driver, filename) {
  // Создаем скриншот
  const screenshot = await driver.takeScreenshot();
  
  // Создаем папку для скриншотов, если ее нет
  const screenshotsDir = path.join(__dirname, '..', 'screenshots_examples');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Сохраняем скриншот в файл
  const filePath = path.join(screenshotsDir, `${filename}.png`);
  fs.writeFileSync(filePath, screenshot, 'base64');
  
  console.log(`Скриншот сохранен: ${filePath}`);
  return filePath;
}

async function screenshotsExample() {
  const driver = await new Builder().forBrowser('MicrosoftEdge').build();
  
  try {
    console.log("Демонстрация работы со скриншотами\n");
    
    // 1. Скриншот главной страницы
    await driver.get("https://demoqa.com");
    await driver.sleep(2000);
    await takeScreenshot(driver, 'main_page');
    
    // 2. Скриншот после изменения размера окна
    await driver.manage().window().setRect({ width: 1024, height: 768 });
    await driver.sleep(1000);
    await takeScreenshot(driver, 'main_page_1024x768');
    
    // 3. Скриншоты разных страниц
    const pages = [
      { url: "https://demoqa.com/text-box", name: "text_box" },
      { url: "https://demoqa.com/checkbox", name: "checkbox" },
      { url: "https://demoqa.com/radio-button", name: "radio_button" }
    ];
    
    for (const page of pages) {
      console.log(`\nОткрываем: ${page.name}`);
      await driver.get(page.url);
      await driver.sleep(1500);
      
      // Делаем скриншот
      await takeScreenshot(driver, page.name);
      
      // Делаем скриншот с прокруткой
      await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
      await driver.sleep(500);
      await takeScreenshot(driver, `${page.name}_scrolled`);
      
      // Возвращаемся к верху
      await driver.executeScript("window.scrollTo(0, 0)");
    }
    
    // 4. Скриншот элемента
    await driver.get("https://demoqa.com/text-box");
    await driver.sleep(1000);
    
    const inputElement = await driver.findElement({ id: 'userName' });
    
    // Выделяем элемент цветом
    await driver.executeScript(
      "arguments[0].style.border = '3px solid red'; arguments[0].style.backgroundColor = 'yellow';",
      inputElement
    );
    
    await driver.sleep(500);
    await takeScreenshot(driver, 'highlighted_element');
    
    // 5. Скриншот всей страницы (полная высота)
    const fullHeight = await driver.executeScript("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);");
    
    // Сохраняем текущий размер окна
    const originalSize = await driver.manage().window().getRect();
    
    // Устанавливаем высоту окна равной высоте страницы
    await driver.manage().window().setRect({ 
      width: originalSize.width, 
      height: fullHeight 
    });
    
    await driver.sleep(1000);
    await takeScreenshot(driver, 'full_page');
    
    // Возвращаем оригинальный размер
    await driver.manage().window().setRect(originalSize);
    
    console.log("\nДемонстрация завершена!");
    console.log("Все скриншоты сохранены в папке screenshots_examples/");
    
  } finally {
    await driver.quit();
  }
}

// Запуск примера
screenshotsExample().catch(console.error);