// Пример работы с куками в Selenium WebDriver

const { Builder } = require("selenium-webdriver");
require("edgedriver");

async function cookiesExample() {
  const driver = await new Builder().forBrowser('MicrosoftEdge').build();
  
  try {
    // 1. Открываем страницу
    await driver.get("https://demoqa.com");
    await driver.sleep(2000);
    
    // 2. Получаем все куки
    const cookies = await driver.manage().getCookies();
    console.log(`Куков на странице: ${cookies.length}`);
    
    // 3. Выводим информацию о каждой куке
    cookies.forEach((cookie, index) => {
      console.log(`\nКука ${index + 1}:`);
      console.log(`  Имя: ${cookie.name}`);
      console.log(`  Значение: ${cookie.value.substring(0, 30)}...`);
      console.log(`  Домен: ${cookie.domain || 'не указан'}`);
      console.log(`  Путь: ${cookie.path || '/'}`);
      if (cookie.expiry) {
        const expiryDate = new Date(cookie.expiry * 1000);
        console.log(`  Срок действия: ${expiryDate.toLocaleString()}`);
      } else {
        console.log(`  Срок действия: сессия`);
      }
      console.log(`  Безопасная: ${cookie.secure ? 'да' : 'нет'}`);
      console.log(`  Только HTTP: ${cookie.httpOnly ? 'да' : 'нет'}`);
    });
    
    // 4. Получаем конкретную куку по имени
    if (cookies.length > 0) {
      const firstCookieName = cookies[0].name;
      const specificCookie = await driver.manage().getCookie(firstCookieName);
      console.log(`\nКука "${firstCookieName}":`, specificCookie.value.substring(0, 50) + '...');
    }
    
    // 5. Добавляем тестовую куку
    const testCookie = {
      name: 'test_cookie_' + Date.now(),
      value: 'test_value_' + Math.random(),
      path: '/'
    };
    
    await driver.manage().addCookie(testCookie);
    console.log(`\nДобавлена тестовая кука: ${testCookie.name}`);
    
    // 6. Проверяем, что кука добавилась
    const addedCookie = await driver.manage().getCookie(testCookie.name);
    console.log(`Проверка: ${addedCookie ? 'кука добавлена' : 'кука не добавлена'}`);
    
    // 7. Удаляем тестовую куку
    await driver.manage().deleteCookie(testCookie.name);
    console.log(`Тестовая кука удалена`);
    
    // 8. Удаляем все куки
    await driver.manage().deleteAllCookies();
    console.log(`Все куки удалены`);
    
    // 9. Проверяем, что куки удалены
    const cookiesAfterDelete = await driver.manage().getCookies();
    console.log(`Куков после удаления: ${cookiesAfterDelete.length}`);
    
  } finally {
    await driver.quit();
  }
}

// Запуск примера
cookiesExample().catch(console.error);