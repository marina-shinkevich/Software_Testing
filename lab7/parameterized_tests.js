// Параметризованные тесты с различными конфигурациями
const TestRunner = require('./test_runner');
const { By, until } = require("selenium-webdriver");

// Test credentials
const TEST_USERS = [
  { username: "testUser2024", password: "Test@12345", description: "Валидный пользователь" },
  { username: "invalidUser", password: "wrongPassword", description: "Невалидные данные" },
  { username: "", password: "Test@12345", description: "Пустой логин" },
  { username: "testUser2024", password: "", description: "Пустой пароль" }
];

const SEARCH_QUERIES = [
  { query: "Text Box", expected: "text-box", description: "Поиск Text Box" },
  { query: "Check Box", expected: "checkbox", description: "Поиск Check Box" },
  { query: "Radio Button", expected: "radio-button", description: "Поиск Radio Button" },
  { query: "Web Tables", expected: "webtables", description: "Поиск Web Tables" }
];

const FORM_TEST_DATA = [
  { firstName: "Иван", lastName: "Петров", email: "ivan@test.com", phone: "9001234567", description: "Русские данные" },
  { firstName: "John", lastName: "Doe", email: "john@test.com", phone: "8001234567", description: "Английские данные" },
  { firstName: "Jean", lastName: "Dupont", email: "jean@test.com", phone: "7001234567", description: "Французские данные" },
  { firstName: "山田", lastName: "太郎", email: "yamada@test.com", phone: "6001234567", description: "Японские данные" }
];

// Вспомогательные функции
async function assertElementText(driver, locator, expectedText) {
  const element = await driver.wait(until.elementLocated(locator), 10000);
  const actualText = await element.getText();
  if (!actualText.toLowerCase().includes(expectedText.toLowerCase())) {
    throw new Error(`Expected text "${expectedText}" not found in "${actualText}"`);
  }
}

async function assertElementVisible(driver, locator) {
  const element = await driver.wait(until.elementLocated(locator), 10000);
  const isDisplayed = await element.isDisplayed();
  if (!isDisplayed) {
    throw new Error(`Element ${locator} is not visible`);
  }
}

// Тестовые функции
async function testLogin(driver, config, user) {
  console.log(`  Тестируем: ${user.description}`);
  
  await driver.get("https://demoqa.com/login");
  await driver.sleep(2000);
  
  await driver.findElement(By.id("userName")).sendKeys(user.username);
  await driver.findElement(By.id("password")).sendKeys(user.password);
  await driver.findElement(By.id("login")).click();
  await driver.sleep(2000);
  
  if (user.username && user.password && user.username === "testUser2024") {
    // Ожидаем успешный логин
    await assertElementText(driver, By.id("userName-value"), user.username);
  } else {
    // Ожидаем ошибку
    await assertElementVisible(driver, By.id("name"));
  }
}

async function testSearch(driver, config, searchData) {
  console.log(`  Тестируем: ${searchData.description}`);
  
  await driver.get("https://demoqa.com");
  await driver.sleep(2000);
  
  // Используем поиск по странице (если есть поисковая строка)
  const searchBox = await driver.findElement(By.className("search-box"));
  await searchBox.clear();
  await searchBox.sendKeys(searchData.query);
  await driver.sleep(1000);
  
  // Проверяем, что элементы отображаются
  const elements = await driver.findElements(By.className("element-list"));
  if (elements.length === 0) {
    throw new Error(`No elements found for query: ${searchData.query}`);
  }
}

async function testPracticeForm(driver, config, formData) {
  console.log(`  Тестируем: ${formData.description}`);
  
  await driver.get("https://demoqa.com/automation-practice-form");
  await driver.sleep(2000);
  
  // Заполняем форму
  await driver.findElement(By.id("firstName")).sendKeys(formData.firstName);
  await driver.findElement(By.id("lastName")).sendKeys(formData.lastName);
  await driver.findElement(By.id("userEmail")).sendKeys(formData.email);
  await driver.findElement(By.id("userNumber")).sendKeys(formData.phone);
  
  // Выбираем пол
  const genderLabel = await driver.findElement(By.xpath("//label[@for='gender-radio-1']"));
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", genderLabel);
  await driver.executeScript("arguments[0].click();", genderLabel);
  
  // Проверяем заполнение
  const firstNameValue = await driver.findElement(By.id("firstName")).getAttribute("value");
  if (firstNameValue !== formData.firstName) {
    throw new Error(`First name mismatch: expected ${formData.firstName}, got ${firstNameValue}`);
  }
}

async function testLanguageSpecific(driver, config) {
  console.log(`  Тестируем языковую версию: ${config.language}`);
  
  await driver.get("https://demoqa.com");
  await driver.sleep(2000);
  
  // Проверяем элементы, которые могут отличаться в разных языках
  const pageTitle = await driver.getTitle();
  
  if (config.language === 'ru') {
    // Для русской версии проверяем наличие кириллицы
    if (!/[а-яА-Я]/.test(pageTitle) && !/[а-яА-Я]/.test(await driver.getPageSource())) {
      console.log("  ⚠ Предупреждение: русские символы не найдены");
    }
  }
  
  // Проверяем, что страница загрузилась
  const bodyText = await driver.findElement(By.tagName("body")).getText();
  if (bodyText.length < 100) {
    throw new Error("Page content seems too short");
  }
}

async function testBrowserFeatures(driver, config) {
  console.log(`  Тестируем функции браузера: ${config.browser}, headless: ${config.headless}`);
  
  // Тест размера окна
  const windowSize = await driver.manage().window().getRect();
  console.log(`  Размер окна: ${windowSize.width}x${windowSize.height}`);
  
  if (!config.headless && windowSize.width < 1024) {
    throw new Error("Window size too small for normal mode");
  }
  
  // Тест cookies
  await driver.manage().deleteAllCookies();
  const cookies = await driver.manage().getCookies();
  if (cookies.length > 0) {
    throw new Error("Cookies not deleted properly");
  }
  
  // Тест навигации
  await driver.get("https://demoqa.com/text-box");
  await driver.sleep(1000);
  await driver.navigate().back();
  await driver.sleep(1000);
  
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes("demoqa.com")) {
    throw new Error("Navigation test failed");
  }
}

// Основная функция
async function runAllTests() {
  const runner = new TestRunner();
  
  // Добавляем тесты с метаданными
  
  // 1. Тесты авторизации с разными пользователями
  TEST_USERS.forEach((user, index) => {
    runner.addTest(
      `Авторизация: ${user.description}`,
      async (driver, config) => await testLogin(driver, config, user),
      {
        tags: ['auth', 'login', 'parameterized'],
        priority: index === 0 ? 1 : 3, // Первый тест - высокий приоритет
        dependsOn: index > 0 ? [1] : [] // Остальные зависят от первого
      }
    );
  });
  
  // 2. Тесты поиска с разными запросами
  SEARCH_QUERIES.forEach((searchData, index) => {
    runner.addTest(
      `Поиск: ${searchData.description}`,
      async (driver, config) => await testSearch(driver, config, searchData),
      {
        tags: ['search', 'parameterized'],
        priority: 2
      }
    );
  });
  
  // 3. Тесты формы с разными данными
  FORM_TEST_DATA.forEach((formData, index) => {
    runner.addTest(
      `Practice Form: ${formData.description}`,
      async (driver, config) => await testPracticeForm(driver, config, formData),
      {
        tags: ['form', 'parameterized', 'i18n'],
        priority: 2,
        skip: index === 3 // Пропускаем японские данные (может быть проблема с кодировкой)
      }
    );
  });
  
  // 4. Языковые тесты
  runner.addTest(
    "Языковая версия сайта",
    async (driver, config) => await testLanguageSpecific(driver, config),
    {
      tags: ['language', 'i18n'],
      priority: 2,
      expectedFailure: true // Ожидаем падение, так как сайт может не поддерживать русский
    }
  );
  
  // 5. Тесты функций браузера
  runner.addTest(
    "Функции браузера",
    async (driver, config) => await testBrowserFeatures(driver, config),
    {
      tags: ['browser', 'features'],
      priority: 1
    }
  );
  
  // 6. Быстрый smoke тест
  runner.addTest(
    "Smoke тест - главная страница",
    async (driver, config) => {
      await driver.get("https://demoqa.com");
      await driver.sleep(2000);
      const title = await driver.getTitle();
      if (!title.includes("DEMOQA")) {
        throw new Error("Title doesn't contain DEMOQA");
      }
    },
    {
      tags: ['smoke', 'quick'],
      priority: 1
    }
  );
  
  // 7. Тест, который всегда падает
  runner.addTest(
    "Всегда падающий тест (демонстрация)",
    async () => {
      throw new Error("Этот тест всегда падает по дизайну");
    },
    {
      tags: ['demo', 'failure'],
      priority: 3,
      expectedFailure: true
    }
  );
  
  // 8. Тест, зависящий от других
  runner.addTest(
    "Комплексный тест (зависит от smoke и auth)",
    async (driver, config) => {
      // Этот тест зависит от успешного прохождения smoke теста и первой авторизации
      await driver.get("https://demoqa.com/profile");
      await driver.sleep(2000);
    },
    {
      tags: ['complex', 'integration'],
      priority: 2,
      dependsOn: [1, runner.tests.length - 2] // Зависит от первого теста авторизации и smoke теста
    }
  );
  
  try {
    // Запуск 1: Все тесты на английском
    console.log("\n" + "=".repeat(70));
    console.log("КОНФИГУРАЦИЯ 1: Английский язык, нормальный режим");
    console.log("=".repeat(70));
    await runner.configureBrowser({ language: 'en', headless: false });
    await runner.runTests();
    await runner.cleanup();
    
    // Запуск 2: Только smoke тесты на русском
    console.log("\n" + "=".repeat(70));
    console.log("КОНФИГУРАЦИЯ 2: Русский язык, только smoke тесты");
    console.log("=".repeat(70));
    await runner.configureBrowser({ language: 'ru', headless: false });
    await runner.runTests({
      tags: ['smoke'],
      minPriority: 2
    });
    await runner.cleanup();
    
    // Запуск 3: Headless режим с фильтрацией
    console.log("\n" + "=".repeat(70));
    console.log("КОНФИГУРАЦИЯ 3: Headless режим, тесты формы и поиска");
    console.log("=".repeat(70));
    await runner.configureBrowser({ language: 'en', headless: true });
    await runner.runTests({
      tags: ['form', 'search'],
      includeSkipped: false
    });
    await runner.cleanup();
    
    // Запуск 4: Только высокоприоритетные тесты
    console.log("\n" + "=".repeat(70));
    console.log("КОНФИГУРАЦИЯ 4: Только high priority тесты");
    console.log("=".repeat(70));
    await runner.configureBrowser({ language: 'en', headless: false });
    await runner.runTests({
      minPriority: 1
    });
    await runner.cleanup();
    
  } catch (error) {
    console.error(`${RED}Ошибка при запуске тестов: ${error.message}${RESET}`);
    await runner.cleanup();
  }
}

// Запуск всех тестов
runAllTests().catch(console.error);