// Выборочный запуск: только тесты авторизации
const TestRunner = require('./test_runner');
const { By, until } = require("selenium-webdriver");

const TEST_USERS = [
  { username: "testUser2024", password: "Test@12345", shouldPass: true },
  { username: "wrongUser", password: "wrongPass", shouldPass: false },
  { username: "", password: "Test@12345", shouldPass: false },
  { username: "testUser2024", password: "", shouldPass: false }
];

async function runAuthTests() {
  const runner = new TestRunner();
  
  // Добавляем параметризованные тесты авторизации
  TEST_USERS.forEach((user, index) => {
    runner.addTest(
      `Авторизация: ${user.username || 'пустой'} / ${user.password ? '***' : 'пустой'}`,
      async (driver) => {
        await driver.get("https://demoqa.com/login");
        await driver.sleep(2000);
        
        if (user.username) {
          await driver.findElement(By.id("userName")).sendKeys(user.username);
        }
        
        if (user.password) {
          await driver.findElement(By.id("password")).sendKeys(user.password);
        }
        
        await driver.findElement(By.id("login")).click();
        await driver.sleep(2000);
        
        if (user.shouldPass) {
          // Ожидаем успешную авторизацию
          await driver.wait(until.elementLocated(By.id("userName-value")), 5000);
          const displayedName = await driver.findElement(By.id("userName-value")).getText();
          if (displayedName !== user.username) {
            throw new Error(`Ожидалось имя ${user.username}, получено ${displayedName}`);
          }
        } else {
          // Ожидаем ошибку
          const errorVisible = await driver.findElements(By.id("name")).then(elements => elements.length > 0);
          if (!errorVisible) {
            throw new Error("Ожидалась ошибка авторизации, но ее нет");
          }
        }
      },
      { 
        tags: ['auth', 'login', 'parameterized'],
        priority: user.shouldPass ? 1 : 2,
        expectedFailure: !user.shouldPass && index > 0 // Ожидаем падение для невалидных данных
      }
    );
  });
  
  console.log("=".repeat(60));
  console.log("ЗАПУСК ТЕСТОВ АВТОРИЗАЦИИ");
  console.log("=".repeat(60));
  
  await runner.configureBrowser({ language: 'en', headless: false });
  await runner.runTests({ tags: ['auth'] });
  await runner.cleanup();
}

runAuthTests().catch(console.error);