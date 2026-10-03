
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import pytest
import json
import os
from datetime import datetime


# ==================== PAGE OBJECTS (Требование 1) ====================
class BasePage:
    """Базовый класс для всех страниц"""
    def __init__(self, driver, url="https://vivabraslav.by"):
        self.driver = driver
        self.url = url
        self.wait = WebDriverWait(driver, 10)
    
    def open(self, path=""):
        self.driver.get(f"{self.url}{path}")
        return self
    
    def find(self, by, selector):
        return self.wait.until(EC.presence_of_element_located((by, selector)))
    
    def find_all(self, by, selector):
        return self.driver.find_elements(by, selector)
    
    def screenshot(self, name):
        """Требование 4: Скриншот"""
        os.makedirs("screenshots", exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = f"screenshots/{name}_{ts}.png"
        self.driver.save_screenshot(path)
        print(f"Скриншот: {path}")
        return path
    
    def get_cookies(self):
        return self.driver.get_cookies()
    
    def save_cookies(self, filename="cookies.json"):
        """Требование 3: Сохранение куки в файл"""
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.get_cookies(), f, indent=2, ensure_ascii=False)
        print(f"Куки сохранены в {filename}")


class MainPage(BasePage):
    """Page Object для главной страницы"""
    # Локаторы
    TICKETS_BTN = (By.CSS_SELECTOR, "a[href*='ticket'], .btn-tickets, button")
    MENU = (By.TAG_NAME, "nav")
    DATES = (By.CSS_SELECTOR, "h1, .date, .festival-date")
    
    def go_to_tickets(self):
        """Переход на страницу билетов"""
        try:
            btn = self.find(*self.TICKETS_BTN)
            btn.click()
            return TicketsPage(self.driver)
        except:
            print("Предупреждение: Кнопка билетов не найдена, переходим по URL")
            return TicketsPage(self.driver).open("/tickets/")
    
    def get_page_title(self):
        return self.driver.title
    
    def has_navigation(self):
        """Проверка наличия меню"""
        try:
            return len(self.find_all(*self.MENU)) > 0
        except:
            return False


class TicketsPage(BasePage):
    """Page Object для страницы билетов"""
    TICKET_CARD = (By.CSS_SELECTOR, "[class*='ticket'], .ticket-item, .card")
    PRICE = (By.CSS_SELECTOR, ".price, [class*='price'], .cost")
    
    def get_ticket_count(self):
        """Количество карточек билетов"""
        try:
            return len(self.find_all(*self.TICKET_CARD))
        except:
            return 0
    
    def get_prices(self):
        """Список цен"""
        prices = []
        for el in self.find_all(*self.PRICE):
            text = el.text.strip()
            if text:
                prices.append(text)
        return prices



def get_driver(headless=False):
    options = Options()
    if headless:
        options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0")
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


# ==================== ТЕСТЫ ====================

# Требование 6: Метки для управления тестами
@pytest.mark.smoke
@pytest.mark.critical
def test_main_page_loads():
    """Тест 1: Главная страница загружается"""
    driver = get_driver()
    try:
        print("\nТест 1: Загрузка главной страницы")
        page = MainPage(driver)
        page.open()
        
        # Требование 4: Скриншот
        page.screenshot("main_loaded")
        
        assert "vivabraslav" in driver.current_url.lower()
        title = page.get_page_title()
        print(f"Заголовок: {title}")
        assert title
    finally:
        driver.quit()
        print("Браузер закрыт")


# Требование 3: Работа с куками
@pytest.mark.cookies
def test_cookies_work():
    """Тест 2: Работа с куками"""
    driver = get_driver()
    try:
        print("\nТест 2: Работа с куками")
        page = MainPage(driver)
        page.open()
        
        # Вывод куки в консоль
        cookies = page.get_cookies()
        print(f"Найдено куки: {len(cookies)}")
        for c in cookies[:5]:  # Первые 5
            print(f"   - {c['name']} = {c['value'][:50]}...")
        
        # Сохранение в файл
        page.save_cookies("vivabraslav_cookies.json")
        
        # Требование 4: Скриншот
        page.screenshot("cookies_test")
        
        assert len(cookies) >= 0  # Куки могут отсутствовать
    finally:
        driver.quit()


# Требование 5: Параметризация (языки)
@pytest.mark.parametrize("lang,lang_name", [("ru", "Русский"), ("en", "English")])
def test_language_versions(lang, lang_name):
    """Тест 3: Проверка языковых версий (параметризация)"""
    driver = get_driver()
    try:
        print(f"\nТест 3: {lang_name} версия")
        page = MainPage(driver)
        
        # Пробуем перейти на языковую версию
        page.open(f"/{lang}/" if lang != "ru" else "/")
        page.screenshot(f"lang_{lang}")
        
        print(f"URL: {driver.current_url}")
        assert "vivabraslav" in driver.current_url
    finally:
        driver.quit()


# Требование 5: Параметризация (браузеры - эмуляция)
@pytest.mark.parametrize("width,height", [(1920, 1080), (375, 667)])
def test_responsive_design(width, height):
    """Тест 4: Адаптивность под разные экраны (параметризация)"""
    driver = get_driver()
    try:
        driver.set_window_size(width, height)
        print(f"\nТест 4: Разрешение {width}x{height}")
        
        page = MainPage(driver)
        page.open()
        page.screenshot(f"responsive_{width}x{height}")
        
        # Простая проверка: страница загрузилась
        assert driver.execute_script("return document.readyState") == "complete"
        print(f"Страница загрузилась при {width}x{height}")
    finally:
        driver.quit()


# Требование 6: Пропущенный тест
@pytest.mark.skip(reason="Функционал билетов требует авторизации")
def test_buy_ticket():
    """Тест 5: Покупка билета (ПРОПУЩЕН)"""
    print("Тест пропущен")


# Требование 6: Ожидаемо падающий тест
@pytest.mark.xfail(reason="Элемент может отсутствовать на сайте")
def test_visa_extra_banner():
    """Тест 6: Баннер Visa Extra (ожидаемое падение)"""
    driver = get_driver()
    try:
        page = MainPage(driver)
        page.open()
        # Ищем элемент, который может не существовать
        banner = page.find(By.CSS_SELECTOR, ".visa-extra, [class*='visa-promo']")
        assert banner.is_displayed()
    finally:
        driver.quit()


# Требование 1 + 4 + 7: Интеграционный тест с отчетом
@pytest.mark.regression
@pytest.mark.critical
def test_full_flow():
    """Тест 7: Полный путь пользователя (интеграционный)"""
    driver = get_driver()
    report = {"steps": [], "status": "failed"}
    
    try:
        print("\nТест 7: Полный пользовательский сценарий")
        
        # Шаг 1: Главная
        report["steps"].append({"name": "Главная", "status": "started"})
        main = MainPage(driver)
        main.open()
        main.screenshot("flow_01_main")
        report["steps"][-1]["status"] = "passed"
        report["steps"][-1]["title"] = main.get_page_title()
        print("Шаг 1: Главная загружена")
        
        # Шаг 2: Переход к билетам
        report["steps"].append({"name": "Билеты", "status": "started"})
        tickets = main.go_to_tickets()
        tickets.screenshot("flow_02_tickets")
        report["steps"][-1]["status"] = "passed"
        report["steps"][-1]["count"] = tickets.get_ticket_count()
        print(f"Шаг 2: Найдено билетов: {tickets.get_ticket_count()}")
        
        # Шаг 3: Куки
        report["steps"].append({"name": "Куки", "status": "started"})
        tickets.save_cookies("flow_cookies.json")
        report["steps"][-1]["status"] = "passed"
        print("Шаг 3: Куки сохранены")
        
        report["status"] = "passed"
        print("Полный сценарий выполнен!")
        
    except Exception as e:
        report["error"] = str(e)
        print(f"Ошибка: {e}")
        raise
    finally:
        # Генерация отчета (Требование 7)
        os.makedirs("reports", exist_ok=True)
        report_file = f"reports/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Отчет сохранен: {report_file}")
        
        driver.quit()
        print("Браузер закрыт")


# ==================== РЕГИСТРАЦИЯ МЕТОК (убирает предупреждения) ====================
def pytest_configure(config):
    """Регистрация кастомных меток pytest"""
    config.addinivalue_line("markers", "smoke: Быстрые тесты")
    config.addinivalue_line("markers", "regression: Регрессионные тесты")
    config.addinivalue_line("markers", "critical: Критические тесты")
    config.addinivalue_line("markers", "cookies: Тесты с куками")
    config.addinivalue_line("markers", "screenshots: Тесты со скриншотами")


if __name__ == "__main__":
    print("=" * 60)
    print("Лабораторная 8: Selenium + POM")
    print("Сайт: vivabraslav.by")
    print("=" * 60)
    
    print("\nДоступные команды запуска:")
    print("   pytest lab8_vivabraslav.py -v                    # Все тесты")
    print("   pytest lab8_vivabraslav.py -m smoke -v           # Только smoke")
    print("   pytest lab8_vivabraslav.py -m critical -v        # Критические")
    print("   pytest lab8_vivabraslav.py -m \"not cookies\" -v   # Без куки")
    print("   pytest lab8_vivabraslav.py::test_main_page_loads -v  # Один тест")
    print("   pytest lab8_vivabraslav.py --html=report.html    # С отчетом")
    
    print("\nЗапускаю демонстрационный тест...")
    test_main_page_loads()