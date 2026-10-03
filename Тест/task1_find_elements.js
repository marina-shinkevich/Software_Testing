const { Builder, By, until } = require("selenium-webdriver");
require("edgedriver");

function log(label, value) {
  console.log(`\n✔ [${label}]`);
  if (Array.isArray(value)) {
    value.forEach((v, i) => console.log(`   [${i}] ${v}`));
  } else {
    console.log(`   ${value}`);
  }
}

async function main() {

  const { Options } = require('selenium-webdriver/edge');
  const options = new Options();
  options.addArguments("--start-maximized");


  const driver = await new Builder()
    .forBrowser("MicrosoftEdge")
    .setEdgeOptions(options)
    .build();

  try {
    await driver.manage().setTimeouts({ implicit: 5000 });

    // ========== 1. By.id ==========
    console.log("\n" + "=".repeat(60));
    console.log("1. ПОИСК ПО ID");
    console.log("=".repeat(60));
    
    await driver.get("https://demoqa.com/text-box");
    await driver.wait(until.elementLocated(By.id("userName")), 10000);

    const fieldName = await driver.findElement(By.id("userName"));
    log("By.id → #userName (placeholder)", await fieldName.getAttribute("placeholder"));

    const fieldEmail = await driver.findElement(By.id("userEmail"));
    log("By.id → #userEmail (placeholder)", await fieldEmail.getAttribute("placeholder"));

    // ========== 2. By.name (через CSS) ==========
    console.log("\n" + "=".repeat(60));
    console.log("2. ПОИСК ПО NAME (через CSS)");
    console.log("=".repeat(60));
    
    await driver.get("https://demoqa.com/automation-practice-form");
    await driver.wait(until.elementLocated(By.css("input[name='gender']")), 10000);

    const genderMale = await driver.findElement(By.css("input[name='gender'][value='Male']"));
    log("By.name → input[name='gender'] (value)", await genderMale.getAttribute("value"));

    // ========== 3. CSS-селекторы (составные) ==========
    console.log("\n" + "=".repeat(60));
    console.log("3. ПОИСК ПО CSS-СЕЛЕКТОРАМ");
    console.log("=".repeat(60));
    
    const firstNameField = await driver.findElement(By.css(".practice-form-wrapper input#firstName"));
    log("CSS #1 → .practice-form-wrapper input#firstName (тег)", await firstNameField.getTagName());

    
    const submitBtn = await driver.findElement(By.css("#submit.btn"));
    log("CSS #2 → #submit.btn (текст)", await submitBtn.getText());

    // ========== 4. XPath (составные) ==========
    console.log("\n" + "=".repeat(60));
    console.log("4. ПОИСК ПО XPATH");
    console.log("=".repeat(60));
    
    // XPath #1: поиск label с текстом "Date of Birth"
    const dobLabel = await driver.findElement(
      By.xpath("//div[@class='practice-form-wrapper']//label[contains(text(),'Date of Birth')]")
    );
    log("XPath #1 → label 'Date of Birth' в форме", await dobLabel.getText());

    // XPath #2: поиск input с id='userNumber' и placeholder='Mobile Number'
    const mobileField = await driver.findElement(
      By.xpath("//input[@id='userNumber' and @placeholder='Mobile Number']")
    );
    log("XPath #2 → input#userNumber (placeholder)", await mobileField.getAttribute("placeholder"));

    // ========== 5. partialLinkText ==========
    console.log("\n" + "=".repeat(60));
    console.log("5. ПОИСК ПО ЧАСТИЧНОМУ ТЕКСТУ ССЫЛКИ");
    console.log("=".repeat(60));
    
    await driver.get("https://demoqa.com/links");
    await driver.wait(until.elementLocated(By.partialLinkText("Home")), 10000);

    const homeLink = await driver.findElement(By.partialLinkText("Home"));
    log("partialLinkText → ссылка 'Home' (href)", await homeLink.getAttribute("href"));

    // ========== 6. findElements (массив элементов) ==========
    console.log("\n" + "=".repeat(60));
    console.log("6. ПОИСК НЕСКОЛЬКИХ ЭЛЕМЕНТОВ (findElements)");
    console.log("=".repeat(60));
    
    await driver.get("https://demoqa.com/");
    await driver.wait(until.elementLocated(By.css(".card-body h5")), 10000);

    const cards = await driver.findElements(By.css(".card-body h5"));
    const cardTexts = await Promise.all(cards.map((c) => c.getText()));
    log("findElements → все категории на главной", cardTexts);

    console.log("\n" + "=".repeat(60));
    console.log("✅ ВСЕ ТЕСТЫ УСПЕШНО ЗАВЕРШЕНЫ!");
    console.log("=".repeat(60));

  } catch (err) {
    console.error("\n❌ Ошибка:", err.message);
    throw err;
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error("Критическая ошибка:", err.message);
  process.exit(1);
});