const { Builder } = require("selenium-webdriver");
require("edgedriver");
const fs = require('fs');
const path = require('path');

// Import Page Objects
const LoginPage = require("./pages/LoginPage");
const PracticeFormPage = require("./pages/PracticeFormPage");

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
  console.log(`${YELLOW}  → Запускаем Edge...${RESET}`);
  
  const { Options } = require('selenium-webdriver/edge');
  const options = new Options();
  
  // Browser options
  options.addArguments("--start-maximized");
  options.addArguments("--disable-notifications");
  
  const driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  await driver.manage().setTimeouts({ 
    implicit: 5000,
    pageLoad: 30000,
    script: 30000 
  });
  
  console.log(`${GREEN}  → Edge запущен!${RESET}`);
  return driver;
}

// Функция для сохранения куков в файл
async function saveCookiesToFile(cookies, filename) {
  const cookiesDir = path.join(__dirname, 'cookies');
  if (!fs.existsSync(cookiesDir)) {
    fs.mkdirSync(cookiesDir, { recursive: true });
  }
  
  const filePath = path.join(cookiesDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2), 'utf8');
  console.log(`${YELLOW}  → Куки сохранены в файл: ${filePath}${RESET}`);
  return filePath;
}

// Функция для загрузки куков из файла
function loadCookiesFromFile(filename) {
  const filePath = path.join(__dirname, 'cookies', filename);
  if (fs.existsSync(filePath)) {
    const cookiesData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(cookiesData);
  }
  return null;
}

// ТЕСТ 1: Работа с куками - получение и сохранение
async function testCookiesBasic(driver) {
  section("ТЕСТ 1: Работа с куками - получение и сохранение");

  const loginPage = new LoginPage(driver);
  
  console.log(`${YELLOW}  → Открываем главную страницу...${RESET}`);
  await loginPage.open("/");
  await loginPage.sleep(2000);

  // Получаем все куки
  const cookies = await loginPage.getAllCookies();
  console.log(`${YELLOW}  → Получено куков: ${cookies.length}${RESET}`);
  
  // Выводим информацию о куках в консоль
  console.log(`${YELLOW}  → Информация о куках:${RESET}`);
  cookies.forEach((cookie, index) => {
    console.log(`  ${index + 1}. ${cookie.name}: ${cookie.value.substring(0, 30)}...`);
  });

  // Сохраняем куки в файл
  await saveCookiesToFile(cookies, 'cookies_before_login.json');
  
  assertTrue("Куки получены успешно", cookies.length > 0);
  
  // Сохраняем скриншот главной страницы
  await loginPage.takeScreenshot('main_page_before_login');
}

// ТЕСТ 2: Авторизация и работа с куками после логина
async function testCookiesAfterLogin(driver) {
  section("ТЕСТ 2: Авторизация и куки после логина");

  const loginPage = new LoginPage(driver);
  
  console.log(`${YELLOW}  → Выполняем авторизацию...${RESET}`);
  await loginPage.login(USERNAME, PASSWORD);
  
  const displayedName = await loginPage.getDisplayedUsername();
  assertEq("После логина отображается имя пользователя", displayedName, USERNAME);

  // Получаем куки после авторизации
  const cookiesAfterLogin = await loginPage.getAllCookies();
  console.log(`${YELLOW}  → Куков после авторизации: ${cookiesAfterLogin.length}${RESET}`);

  // Сохраняем куки после авторизации
  await saveCookiesToFile(cookiesAfterLogin, 'cookies_after_login.json');
  
  // Сравниваем количество куков до и после
  const cookiesBefore = loadCookiesFromFile('cookies_before_login.json');
  if (cookiesBefore) {
    console.log(`${YELLOW}  → Куков до логина: ${cookiesBefore.length}, после: ${cookiesAfterLogin.length}${RESET}`);
    assertTrue("После авторизации количество куков изменилось", 
      cookiesAfterLogin.length !== cookiesBefore.length);
  }

  // Сохраняем скриншот после авторизации
  await loginPage.takeScreenshot('after_login');
}

// ТЕСТ 3: Работа с отдельными куками
async function testIndividualCookies(driver) {
  section("ТЕСТ 3: Работа с отдельными куками");

  const loginPage = new LoginPage(driver);
  
  // Получаем конкретную куку по имени (если есть)
  const cookies = await loginPage.getAllCookies();
  
  if (cookies.length > 0) {
    const firstCookie = cookies[0];
    const cookieByName = await loginPage.getCookieByName(firstCookie.name);
    
    console.log(`${YELLOW}  → Получена кука по имени: ${firstCookie.name}${RESET}`);
    console.log(`${YELLOW}  → Значение: ${cookieByName.value.substring(0, 50)}...${RESET}`);
    
    assertTrue("Кука получена по имени", cookieByName !== null);
    assertEq("Значение куки совпадает", cookieByName.value, firstCookie.value);
  }

  // Демонстрация работы с отдельными куками
  if (cookies.length > 0) {
    const firstCookie = cookies[0];
    const cookieByName = await loginPage.getCookieByName(firstCookie.name);
    
    console.log(`${YELLOW}  → Пример куки: ${firstCookie.name}${RESET}`);
    console.log(`${YELLOW}  → Значение: ${cookieByName.value.substring(0, 50)}...${RESET}`);
    console.log(`${YELLOW}  → Домен: ${cookieByName.domain || 'не указан'}${RESET}`);
    console.log(`${YELLOW}  → Путь: ${cookieByName.path || '/'}${RESET}`);
    console.log(`${YELLOW}  → Срок действия: ${cookieByName.expiry ? new Date(cookieByName.expiry * 1000).toLocaleString() : 'сессия'}${RESET}`);
    
    assertTrue("Кука получена по имени", cookieByName !== null);
    assertEq("Значение куки совпадает", cookieByName.value, firstCookie.value);
  }
  
  // Демонстрация: удаление всех куков
  console.log(`${YELLOW}  → Демонстрация: удаление всех куков...${RESET}`);
  const cookiesBeforeDelete = await loginPage.getAllCookies();
  console.log(`${YELLOW}  → Куков перед удалением: ${cookiesBeforeDelete.length}${RESET}`);
  
  await loginPage.deleteAllCookies();
  await loginPage.sleep(1000);
  
  const cookiesAfterDelete = await loginPage.getAllCookies();
  console.log(`${YELLOW}  → Куков после удаления: ${cookiesAfterDelete.length}${RESET}`);
  
  // После удаления куков делаем скриншот
  await loginPage.takeScreenshot('after_cookies_deleted');
  
  assertTrue("Куки удалены (или их количество уменьшилось)", cookiesAfterDelete.length < cookiesBeforeDelete.length);
}

// ТЕСТ 4: Скриншоты на разных этапах тестирования
async function testScreenshots(driver) {
  section("ТЕСТ 4: Скриншоты на разных этапах");

  const loginPage = new LoginPage(driver);
  
  console.log(`${YELLOW}  → Демонстрация скриншотов на разных страницах...${RESET}`);
  
  // Список страниц для скриншотов
  const pagesForScreenshots = [
    { path: "/text-box", name: "text_box_page", description: "Страница Text Box" },
    { path: "/checkbox", name: "checkbox_page", description: "Страница Checkbox" },
    { path: "/radio-button", name: "radio_button_page", description: "Страница Radio Button" },
    { path: "/web-tables", name: "web_tables_page", description: "Страница Web Tables" },
    { path: "/buttons", name: "buttons_page", description: "Страница Buttons" }
  ];
  
  let screenshotsTaken = 0;
  
  for (const page of pagesForScreenshots) {
    try {
      console.log(`${YELLOW}  → Открываем: ${page.description}${RESET}`);
      await loginPage.open(page.path);
      await loginPage.sleep(1500);
      
      // Делаем скриншот
      await loginPage.takeScreenshot(page.name);
      screenshotsTaken++;
      
      console.log(`${YELLOW}  → Скриншот сохранен: ${page.name}.png${RESET}`);
      
    } catch (err) {
      console.log(`${YELLOW}  → Не удалось открыть ${page.path}: ${err.message}${RESET}`);
    }
  }
  
  // Также делаем скриншот текущего URL
  const currentUrl = await loginPage.driver.getCurrentUrl();
  console.log(`${YELLOW}  → Текущий URL: ${currentUrl}${RESET}`);
  
  // Скриншот с полной страницей (последняя открытая)
  await loginPage.takeScreenshot('final_page');
  
  assertTrue(`Сделано скриншотов: ${screenshotsTaken}`, screenshotsTaken > 0);
}

// ТЕСТ 5: Демонстрация работы с куками и скриншотами
async function testCookiesAndScreenshotsDemo(driver) {
  section("ТЕСТ 5: Демонстрация работы с куками и скриншотами");

  const loginPage = new LoginPage(driver);
  
  console.log(`${YELLOW}  → Демонстрация: Открываем разные страницы и делаем скриншоты${RESET}`);
  
  // Открываем разные страницы и делаем скриншоты
  const pages = [
    { path: "/", name: "main_page" },
    { path: "/books", name: "books_page" },
    { path: "/elements", name: "elements_page" }
  ];
  
  for (const page of pages) {
    console.log(`${YELLOW}  → Открываем: ${page.path}${RESET}`);
    await loginPage.open(page.path);
    await loginPage.sleep(1500);
    
    // Делаем скриншот
    await loginPage.takeScreenshot(page.name);
    
    // Получаем куки для этой страницы
    const pageCookies = await loginPage.getAllCookies();
    console.log(`${YELLOW}  → Куков на странице ${page.path}: ${pageCookies.length}${RESET}`);
  }
  
  // Демонстрация: получение и вывод информации о куках
  console.log(`${YELLOW}  → Анализ всех куков в текущей сессии:${RESET}`);
  const allCookies = await loginPage.getAllCookies();
  
  // Группируем куки по домену
  const cookiesByDomain = {};
  allCookies.forEach(cookie => {
    const domain = cookie.domain || 'no-domain';
    if (!cookiesByDomain[domain]) {
      cookiesByDomain[domain] = [];
    }
    cookiesByDomain[domain].push(cookie);
  });
  
  console.log(`${YELLOW}  → Куки сгруппированы по доменам:${RESET}`);
  Object.keys(cookiesByDomain).forEach(domain => {
    console.log(`  Домен: ${domain} - ${cookiesByDomain[domain].length} кук`);
  });
  
  // Сохраняем полный отчет о куках
  const cookiesReport = {
    totalCookies: allCookies.length,
    domains: Object.keys(cookiesByDomain).length,
    cookiesByDomain: cookiesByDomain,
    timestamp: new Date().toISOString()
  };
  
  const reportPath = path.join(__dirname, 'cookies', 'cookies_full_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(cookiesReport, null, 2), 'utf8');
  console.log(`${YELLOW}  → Полный отчет о куках сохранен: ${reportPath}${RESET}`);
  
  assertTrue("Куки собраны и проанализированы", allCookies.length > 0);
}

// MAIN
async function main() {
  console.log(`\n${CYAN}${"=".repeat(60)}`);
  console.log(`  ДЕМОНСТРАЦИЯ РАБОТЫ С КУКАМИ И СКРИНШОТАМИ`);
  console.log(`${"=".repeat(60)}${RESET}\n`);
  
  const driver = await buildDriver();

  try {
    await testCookiesBasic(driver);
    await testCookiesAfterLogin(driver);
    await testIndividualCookies(driver);
    await testScreenshots(driver);
    await testCookiesAndScreenshotsDemo(driver);
  } catch (err) {
    console.error(`\n${RED}Ошибка:${RESET}`, err.message);
    failed++;
  } finally {
    await driver.sleep(2000);
    await driver.quit();
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ИТОГ: ${GREEN}${passed} passed${RESET}  ${failed > 0 ? RED : ""}${failed} failed${RESET}`);
    console.log("═".repeat(60) + "\n");
    
    // Показываем информацию о созданных файлах
    const screenshotsDir = path.join(__dirname, 'screenshots');
    const cookiesDir = path.join(__dirname, 'cookies');
    
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir);
      console.log(`${YELLOW}Создано скриншотов: ${screenshots.length}${RESET}`);
    }
    
    if (fs.existsSync(cookiesDir)) {
      const cookiesFiles = fs.readdirSync(cookiesDir);
      console.log(`${YELLOW}Создано файлов с куками: ${cookiesFiles.length}${RESET}`);
    }
  }
}

main();