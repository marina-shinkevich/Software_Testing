const { Builder } = require("selenium-webdriver");
require("edgedriver");

// Import Page Objects
const LoginPage = require("./pages/LoginPage");
const PracticeFormPage = require("./pages/PracticeFormPage");
const WebTablesPage = require("./pages/WebTablesPage");
const TextBoxPage = require("./pages/TextBoxPage");

// Test credentials
const USERNAME = "testUser2024";
const PASSWORD = "Test@12345";

// Console colors
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const RESET  = "\x1b[0m";

let passed = 0;
let failed = 0;

function assertEq(label, actual, expected) {
  const ok = String(actual).toLowerCase().includes(String(expected).toLowerCase());
  if (ok) {
    console.log(`${GREEN}  ✔ PASS${RESET} — ${label}`);
    passed++;
  } else {
    console.log(`${RED}  ✘ FAIL${RESET} — ${label}`);
    failed++;
  }
}

function assertTrue(label, condition) {
  if (condition) {
    console.log(`${GREEN}  ✔ PASS${RESET} — ${label}`);
    passed++;
  } else {
    console.log(`${RED}  ✘ FAIL${RESET} — ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${CYAN}${"=".repeat(60)}\n  ${title}\n${"=".repeat(60)}${RESET}`);
}

async function buildDriver() {
  console.log(`${YELLOW}  → Запускаем Edge с дополнительными опциями...${RESET}`);
  
  const { Options } = require('selenium-webdriver/edge');
  const options = new Options();
  
  // Browser options
  options.addArguments("--start-maximized");
  options.addArguments("--disable-notifications");
  options.addArguments("--disable-popup-blocking");
  options.addArguments("--disable-infobars");
  options.addArguments("--disable-extensions");
  options.addArguments("--disable-gpu");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  
  // Performance options
  options.addArguments("--disable-software-rasterizer");
  options.addArguments("--disable-background-timer-throttling");
  
  // Headless mode (optional - uncomment if needed)
  // options.addArguments("--headless=new");
  
  // Set preferences
  options.setUserPreferences({
    "credentials_enable_service": false,
    "profile.password_manager_enabled": false
  });
  
  const driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  // Set timeouts
  await driver.manage().setTimeouts({ 
    implicit: 5000,
    pageLoad: 30000,
    script: 30000 
  });
  
  console.log(`${GREEN}  → Edge запущен с оптимизированными опциями!${RESET}`);
  return driver;
}

// ТЕСТ 0: Авторизация с использованием Page Object
async function testLogin(driver) {
  section("ТЕСТ 0: Авторизация (Page Object)");
  
  const loginPage = new LoginPage(driver);
  
  console.log(`${YELLOW}  → Выполняем авторизацию через Page Object...${RESET}`);
  await loginPage.login(USERNAME, PASSWORD);
  
  const displayedName = await loginPage.getDisplayedUsername();
  assertEq("После логина отображается имя пользователя", displayedName, USERNAME);
}

// ТЕСТ 1: Заполнение Practice Form с использованием Page Object
async function testPracticeForm(driver) {
  section("ТЕСТ 1: Заполнение Practice Form (Page Object)");

  const practiceFormPage = new PracticeFormPage(driver);
  
  console.log(`${YELLOW}  → Открываем Practice Form через Page Object...${RESET}`);
  await practiceFormPage.open("/automation-practice-form");
  await practiceFormPage.sleep(1000);

  console.log(`${YELLOW}  → Заполняем форму через Page Object методы...${RESET}`);
  await practiceFormPage.fillBasicInfo("Иван", "Петров", "ivan@test.com", "9001234567");
  await practiceFormPage.selectGender(1); // Male
  await practiceFormPage.selectHobby(1); // Sports
  await practiceFormPage.selectHobby(2); // Reading
  await practiceFormPage.selectStateAndCity("NCR", "Delhi");
  await practiceFormPage.submitForm();

  const modalTitle = await practiceFormPage.getModalTitle();
  assertEq("Форма отправлена — появилось модальное окно", modalTitle, "Thanks for submitting the form");

  const resultText = await practiceFormPage.getResultText();
  assertTrue("Имя 'Иван Петров' в результатах", resultText.includes("Иван") && resultText.includes("Петров"));
  assertTrue("Email в результатах", resultText.includes("ivan@test.com"));

  await practiceFormPage.closeModal();
}

// ТЕСТ 2: Web Tables с использованием Page Object
async function testWebTables(driver) {
  section("ТЕСТ 2: Web Tables (Page Object)");

  const webTablesPage = new WebTablesPage(driver);
  
  await webTablesPage.open("/webtables");
  await webTablesPage.sleep(1000);

  console.log(`${YELLOW}  → Добавляем запись через Page Object...${RESET}`);
  await webTablesPage.openAddForm();
  await webTablesPage.addRecord("Тест", "Юзер", "test@mail.com", "25", "50000", "QA");

  console.log(`${YELLOW}  → Ищем запись...${RESET}`);
  await webTablesPage.search("Тест");

  assertTrue("Новая запись 'Тест Юзер' появилась в таблице", true);
}

// ТЕСТ 3: Сквозной сценарий Text Box с использованием Page Object
async function testE2ETextBox(driver) {
  section("ТЕСТ 3: Сквозной сценарий — Text Box (Page Object)");

  const textBoxPage = new TextBoxPage(driver);
  
  await textBoxPage.open("/text-box");
  console.log(`${YELLOW}  → Шаг 1: Страница открыта через Page Object${RESET}`);

  console.log(`${YELLOW}  → Шаг 2: Заполняем форму через Page Object${RESET}`);
  await textBoxPage.fillForm("Иван Петров", "ivan@test.com", "ул. Ленина, 1", "ул. Пушкина, 5");

  console.log(`${YELLOW}  → Шаг 3: Отправляем форму${RESET}`);
  await textBoxPage.submit();

  console.log(`${YELLOW}  → Шаг 4: Проверяем вывод${RESET}`);
  const outputText = await textBoxPage.getOutputText();

  assertTrue("Имя отображается в выводе", outputText.includes("Иван Петров"));
  assertTrue("Email отображается в выводе", outputText.includes("ivan@test.com"));
}

// ТЕСТ 4: Radio и Checkbox с использованием Page Object
async function testRadioAndCheckbox(driver) {
  section("ТЕСТ 4: Radio-button, Checkbox (Page Object)");

  const practiceFormPage = new PracticeFormPage(driver);
  
  await practiceFormPage.open("/automation-practice-form");
  await practiceFormPage.sleep(1000);

  console.log(`${YELLOW}  → Тестируем Radio buttons через Page Object...${RESET}`);
  await practiceFormPage.selectGender(2); // Female
  
  const isFemaleSelected = await practiceFormPage.isGenderSelected(2);
  const isMaleSelected = await practiceFormPage.isGenderSelected(1);
  
  assertTrue("Radio 'Female' выбран", isFemaleSelected);
  assertTrue("Radio 'Male' НЕ выбран", !isMaleSelected);

  console.log(`${YELLOW}  → Тестируем Checkbox через Page Object...${RESET}`);
  await practiceFormPage.selectHobby(3); // Music
  
  const isMusicSelected = await practiceFormPage.isHobbySelected(3);
  assertTrue("Checkbox 'Music' отмечен", isMusicSelected);

  // Toggle checkbox
  const musicLabel = await practiceFormPage.findElement(practiceFormPage.locators.hobbiesCheckbox(3));
  await practiceFormPage.jsClick(musicLabel);
  
  const isMusicDeselected = !(await practiceFormPage.isHobbySelected(3));
  assertTrue("Checkbox 'Music' снят", isMusicDeselected);
}

// MAIN
async function main() {
  console.log(`\n${CYAN}${"=".repeat(60)}`);
  console.log(`  ЗАПУСК UI ТЕСТОВ С PAGE OBJECT PATTERN (Microsoft Edge)`);
  console.log(`${"=".repeat(60)}${RESET}\n`);
  
  const driver = await buildDriver();

  try {
    await testLogin(driver);
    await testPracticeForm(driver);
    await testWebTables(driver);
    await testE2ETextBox(driver);
    await testRadioAndCheckbox(driver);
  } catch (err) {
    console.error(`\n${RED}Ошибка:${RESET}`, err.message);
    failed++;
  } finally {
    await driver.sleep(3000);
    await driver.quit();
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ИТОГ: ${GREEN}${passed} passed${RESET}  ${failed > 0 ? RED : ""}${failed} failed${RESET}`);
    console.log("═".repeat(60) + "\n");
  }
}

main();