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
  const { Options } = require("selenium-webdriver/edge");
  const options = new Options();
  options.addArguments("--start-maximized");

  const driver = await new Builder()
    .forBrowser("MicrosoftEdge")
    .setEdgeOptions(options)
    .build();

  try {
    await driver.manage().setTimeouts({ implicit: 10000 });

  
    console.log("\n" + "=".repeat(60));
    console.log("1. ЛОГИН В SAUCEDEMO");
    console.log("=".repeat(60));

    await driver.get("https://www.saucedemo.com/");
    await driver.wait(until.elementLocated(By.id("user-name")), 10000);

    const username = await driver.findElement(By.id("user-name"));
    const password = await driver.findElement(By.id("password"));
    const loginBtn = await driver.findElement(By.id("login-button"));

    log("By.id → username placeholder", await username.getAttribute("placeholder"));

    await username.sendKeys("standard_user");
    await password.sendKeys("secret_sauce");
    await loginBtn.click();

    await driver.wait(until.urlContains("inventory"), 10000);

   
   
    console.log("\n" + "=".repeat(60));
    console.log("2. ПОИСК ПО NAME (CSS)");
    console.log("=".repeat(60));

    const sortSelect = await driver.findElement(By.css("select[data-test='product-sort-container']"));
    log("By.name → select сортировки", await sortSelect.getTagName());


  
    console.log("\n" + "=".repeat(60));
    console.log("3. CSS-СЕЛЕКТОРЫ");
    console.log("=".repeat(60));


    const firstItem = await driver.findElement(By.css(".inventory_list .inventory_item"));
    log("CSS #1 → первый товар (class)", await firstItem.getAttribute("class"));


    const addToCartBtn = await driver.findElement(By.css(".inventory_item button.btn_inventory"));
    log("CSS #2 → кнопка Add to cart (текст)", await addToCartBtn.getText());

 

    
    console.log("\n" + "=".repeat(60));
    console.log("4. XPATH");
    console.log("=".repeat(60));


    const itemName = await driver.findElement(
  By.xpath("//div[contains(@class,'inventory_item_name')]")
);
    log("XPath #1 → название товара", await itemName.getText());


    const price = await driver.findElement(
      By.xpath("//div[@class='inventory_item_price' and contains(text(),'$')]")
    );
    log("XPath #2 → цена товара", await price.getText());

    
    // 5. partialLinkText
 
    console.log("\n" + "=".repeat(60));
    console.log("5. PARTIAL LINK TEXT");
    console.log("=".repeat(60));

    const twitterLink = await driver.findElement(By.partialLinkText("Twitter"));
    log("partialLinkText → Twitter", await twitterLink.getAttribute("href"));

 
    //  6. findElements (массив)

    console.log("\n" + "=".repeat(60));
    console.log("6. findElements");
    console.log("=".repeat(60));

    const items = await driver.findElements(By.css(".inventory_item_name"));
    const itemNames = await Promise.all(items.map(i => i.getText()));

    log("Все товары", itemNames);

    console.log("\n" + "=".repeat(60));
    console.log(" ВСЕ ТЕСТЫ УСПЕШНО ЗАВЕРШЕНЫ!");
    console.log("=".repeat(60));

  } catch (err) {
    console.error("\n Ошибка:", err.message);
  } finally {
    await driver.quit();
  }
}

main();