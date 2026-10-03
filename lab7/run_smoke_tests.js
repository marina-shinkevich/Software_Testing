// Выборочный запуск: только smoke тесты
const TestRunner = require('./test_runner');

async function runSmokeTests() {
  const runner = new TestRunner();
  
  // Добавляем тесты (упрощенная версия)
  runner.addTest(
    "Smoke тест - загрузка главной страницы",
    async (driver) => {
      await driver.get("https://demoqa.com");
      await driver.sleep(2000);
      const title = await driver.getTitle();
      if (!title.includes("DEMOQA")) {
        throw new Error("Главная страница не загрузилась");
      }
    },
    { tags: ['smoke'], priority: 1 }
  );
  
  runner.addTest(
    "Smoke тест - страница элементов",
    async (driver) => {
      await driver.get("https://demoqa.com/elements");
      await driver.sleep(2000);
      const header = await driver.findElement({ className: 'main-header' }).getText();
      if (!header.includes("Elements")) {
        throw new Error("Страница элементов не загрузилась");
      }
    },
    { tags: ['smoke'], priority: 1 }
  );
  
  runner.addTest(
    "Smoke тест - страница форм",
    async (driver) => {
      await driver.get("https://demoqa.com/forms");
      await driver.sleep(2000);
      const header = await driver.findElement({ className: 'main-header' }).getText();
      if (!header.includes("Forms")) {
        throw new Error("Страница форм не загрузилась");
      }
    },
    { tags: ['smoke'], priority: 1 }
  );
  
  console.log("=".repeat(60));
  console.log("ЗАПУСК ТОЛЬКО SMOKE ТЕСТОВ");
  console.log("=".repeat(60));
  
  await runner.configureBrowser({ language: 'en', headless: false });
  await runner.runTests({ tags: ['smoke'] });
  await runner.cleanup();
}

runSmokeTests().catch(console.error);