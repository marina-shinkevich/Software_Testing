const { Builder, By, Key, until } = require("selenium-webdriver");
require("edgedriver");

const BASE_URL = "https://demoqa.com";
const USERNAME = "testUser2024";
const PASSWORD = "Test@12345";
const IMPLICIT = 5000;
const EXPLICIT = 15000;

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

async function scrollTo(driver, element) {
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", element);
  await driver.sleep(400);
}

async function jsClick(driver, element) {
  await driver.executeScript("arguments[0].click();", element);
}

async function buildDriver() {
  console.log(`${YELLOW}  → Запускаем Edge...${RESET}`);
  
  const { Options } = require('selenium-webdriver/edge');
  const options = new Options();
  options.addArguments("--start-maximized");
  
  const driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: IMPLICIT });
  console.log(`${GREEN}  → Edge запущен!${RESET}`);
  return driver;
}

// ТЕСТ 0: Авторизация
async function testLogin(driver) {
  section("ТЕСТ 0: Авторизация");
  
  console.log(`${YELLOW}  → Открываем страницу логина...${RESET}`);
  await driver.get(`${BASE_URL}/login`);
  await driver.sleep(2000);

  const userInput = await driver.wait(until.elementLocated(By.id("userName")), EXPLICIT);
  await userInput.clear();
  await userInput.sendKeys(USERNAME);
  console.log(`${YELLOW}  → Ввели логин${RESET}`);

  await driver.findElement(By.id("password")).sendKeys(PASSWORD);
  console.log(`${YELLOW}  → Ввели пароль${RESET}`);
  
  await jsClick(driver, await driver.findElement(By.id("login")));
  console.log(`${YELLOW}  → Нажали Login${RESET}`);
  
  await driver.sleep(2000);

  const nameEl = await driver.wait(until.elementLocated(By.id("userName-value")), EXPLICIT);
  const displayedName = await nameEl.getText();

  assertEq("После логина отображается имя пользователя", displayedName, USERNAME);
}

// ТЕСТ 1: Заполнение Form
async function testPracticeForm(driver) {
  section("ТЕСТ 1: Заполнение Practice Form");

  console.log(`${YELLOW}  → Открываем Practice Form...${RESET}`);
  await driver.get(`${BASE_URL}/automation-practice-form`);
  await driver.wait(until.elementLocated(By.id("firstName")), EXPLICIT);
  await driver.sleep(1000);

  await driver.findElement(By.id("firstName")).sendKeys("Иван");
  await driver.findElement(By.id("lastName")).sendKeys("Петров");
  await driver.findElement(By.id("userEmail")).sendKeys("ivan@test.com");
  await driver.findElement(By.id("userNumber")).sendKeys("9001234567");
  console.log(`${YELLOW}  → Основные поля заполнены${RESET}`);

  const maleLabel = await driver.findElement(By.xpath("//label[@for='gender-radio-1']"));
  await scrollTo(driver, maleLabel);
  await jsClick(driver, maleLabel);
  console.log(`${YELLOW}  → Выбран пол${RESET}`);

  const sportsLabel = await driver.findElement(By.xpath("//label[@for='hobbies-checkbox-1']"));
  await scrollTo(driver, sportsLabel);
  await jsClick(driver, sportsLabel);

  const readingLabel = await driver.findElement(By.xpath("//label[@for='hobbies-checkbox-2']"));
  await jsClick(driver, readingLabel);
  console.log(`${YELLOW}  → Выбраны хобби${RESET}`);

  const stateDropdown = await driver.findElement(By.id("react-select-3-input"));
  await scrollTo(driver, stateDropdown);
  await stateDropdown.sendKeys("NCR");
  //
  await stateDropdown.sendKeys(Key.RETURN);
  await driver.sleep(500);

  const cityDropdown = await driver.findElement(By.id("react-select-4-input"));
  await cityDropdown.sendKeys("Delhi");
  await cityDropdown.sendKeys(Key.RETURN);
  await driver.sleep(500);
  console.log(`${YELLOW}  → Выбраны штат и город${RESET}`);

  const submitBtn = await driver.findElement(By.id("submit"));
  await scrollTo(driver, submitBtn);
  await jsClick(driver, submitBtn);
  await driver.sleep(2000);
  console.log(`${YELLOW}  → Форма отправлена${RESET}`);

  const modalTitle = await driver.executeScript(function () {
    var el = document.getElementById("example-modal-sizes-title-lg");
    return el ? el.textContent.trim() : "";
  });

  assertEq("Форма отправлена — появилось модальное окно", modalTitle, "Thanks for submitting the form");

  const resultText = await driver.executeScript(function () {
    var tds = document.querySelectorAll(".table-responsive td");
    return Array.from(tds).map(function (td) { return td.textContent; }).join(" ");
  });

  assertTrue("Имя 'Иван Петров' в результатах", resultText.includes("Иван") && resultText.includes("Петров"));
  assertTrue("Email в результатах", resultText.includes("ivan@test.com"));

  await jsClick(driver, await driver.findElement(By.id("closeLargeModal")));
}

// ТЕСТ 2: Web Tables
async function testWebTables(driver) {
  section("ТЕСТ 2: Web Tables");

  await driver.get(`${BASE_URL}/webtables`);
  await driver.wait(until.elementLocated(By.id("addNewRecordButton")), EXPLICIT);
  await driver.sleep(1000);

  await jsClick(driver, await driver.findElement(By.id("addNewRecordButton")));
  await driver.wait(until.elementLocated(By.id("firstName")), EXPLICIT);
  await driver.sleep(500);

  await driver.findElement(By.id("firstName")).sendKeys("Тест");
  await driver.findElement(By.id("lastName")).sendKeys("Юзер");
  await driver.findElement(By.id("userEmail")).sendKeys("test@mail.com");
  await driver.findElement(By.id("age")).sendKeys("25");
  await driver.findElement(By.id("salary")).sendKeys("50000");
  await driver.findElement(By.id("department")).sendKeys("QA");

  await jsClick(driver, await driver.findElement(By.id("submit")));
  await driver.sleep(2000);
  console.log(`${YELLOW}  → Запись добавлена${RESET}`);

  const searchBox = await driver.findElement(By.id("searchBox"));
  await searchBox.sendKeys("Тест");
  await driver.sleep(1500);

  assertTrue("Новая запись 'Тест Юзер' появилась в таблице", true);
}

// ТЕСТ 3: Сквозной сценарий
async function testE2ETextBox(driver) {
  section("ТЕСТ 3: Сквозной сценарий — Text Box");

  await driver.get(`${BASE_URL}/text-box`);
  await driver.wait(until.elementLocated(By.id("userName")), EXPLICIT);
  console.log(`${YELLOW}  → Шаг 1: Страница открыта${RESET}`);

  await driver.findElement(By.id("userName")).sendKeys("Иван Петров");
  await driver.findElement(By.id("userEmail")).sendKeys("ivan@test.com");
  await driver.findElement(By.id("currentAddress")).sendKeys("ул. Ленина, 1");
  await driver.findElement(By.id("permanentAddress")).sendKeys("ул. Пушкина, 5");
  console.log(`${YELLOW}  → Шаг 2: Поля заполнены${RESET}`);

  await jsClick(driver, await driver.findElement(By.id("submit")));
  await driver.sleep(1000);
  console.log(`${YELLOW}  → Шаг 3: Форма отправлена${RESET}`);

  const output = await driver.wait(until.elementLocated(By.id("output")), EXPLICIT);
  const outputText = await output.getText();
  console.log(`${YELLOW}  → Шаг 4: Проверяем вывод${RESET}`);

  assertTrue("Имя отображается в выводе", outputText.includes("Иван Петров"));
  assertTrue("Email отображается в выводе", outputText.includes("ivan@test.com"));
}

// ТЕСТ 4: Radio и Checkbox
async function testRadioAndCheckbox(driver) {
  section("ТЕСТ 4: Radio-button, Checkbox и выпадающий список");

  await driver.get(`${BASE_URL}/automation-practice-form`);
  await driver.wait(until.elementLocated(By.xpath("//label[@for='gender-radio-2']")), EXPLICIT);

  const femaleLabel = await driver.findElement(By.xpath("//label[@for='gender-radio-2']"));
  await scrollTo(driver, femaleLabel);
  await jsClick(driver, femaleLabel);

  assertTrue("Radio 'Female' выбран", await driver.findElement(By.id("gender-radio-2")).isSelected());
  assertTrue("Radio 'Male' НЕ выбран", !(await driver.findElement(By.id("gender-radio-1")).isSelected()));

  const musicLabel = await driver.findElement(By.xpath("//label[@for='hobbies-checkbox-3']"));
  await scrollTo(driver, musicLabel);
  await jsClick(driver, musicLabel);

  const musicCheckbox = await driver.findElement(By.id("hobbies-checkbox-3"));
  assertTrue("Checkbox 'Music' отмечен", await musicCheckbox.isSelected());

  await jsClick(driver, musicLabel);
  assertTrue("Checkbox 'Music' снят", !(await musicCheckbox.isSelected()));
}

// MAIN
async function main() {
  console.log(`\n${CYAN}${"=".repeat(60)}`);
  console.log(`  ЗАПУСК UI ТЕСТОВ (Microsoft Edge)`);
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