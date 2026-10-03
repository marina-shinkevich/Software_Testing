// Test Runner с параметризацией и управлением тестами
const { Builder } = require("selenium-webdriver");
require("edgedriver");

// Console colors
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const RESET  = "\x1b[0m";

// Test statuses
const STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  EXPECTED_FAILURE: 'expected_failure'
};

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.driver = null;
    this.config = {
      browser: 'edge',
      language: 'en',
      headless: false
    };
  }

  // Методы для добавления тестов с метаданными
  addTest(name, fn, metadata = {}) {
    this.tests.push({
      id: this.tests.length + 1,
      name,
      fn,
      metadata: {
        priority: metadata.priority || 3, // 1=high, 2=medium, 3=low
        tags: metadata.tags || [],
        skip: metadata.skip || false,
        expectedFailure: metadata.expectedFailure || false,
        dependsOn: metadata.dependsOn || [],
        ...metadata
      }
    });
    return this;
  }

  // Конфигурация браузера
  async configureBrowser(config = {}) {
    this.config = { ...this.config, ...config };
    
    const { Options } = require('selenium-webdriver/edge');
    const options = new Options();
    
    // Базовые опции
    options.addArguments("--start-maximized");
    options.addArguments("--disable-notifications");
    
    // Языковые настройки
    if (this.config.language === 'ru') {
      options.addArguments("--lang=ru");
    } else {
      options.addArguments("--lang=en");
    }
    
    // Headless режим
    if (this.config.headless) {
      options.addArguments("--headless=new");
    }
    
    this.driver = await new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ 
      implicit: 5000,
      pageLoad: 30000,
      script: 30000 
    });
    
    console.log(`${GREEN}  → Браузер запущен (${this.config.browser}, ${this.config.language})${RESET}`);
    return this.driver;
  }

  // Запуск тестов с фильтрацией
  async runTests(filters = {}) {
    console.log(`\n${CYAN}${"=".repeat(60)}`);
    console.log(`  ЗАПУСК ПАРАМЕТРИЗОВАННЫХ ТЕСТОВ`);
    console.log(`  Конфигурация: ${this.config.browser}, ${this.config.language}, ${this.config.headless ? 'headless' : 'normal'}`);
    console.log(`${"=".repeat(60)}${RESET}\n`);
    
    // Фильтрация тестов
    let testsToRun = this.filterTests(filters);
    
    // Сортировка по приоритету
    testsToRun.sort((a, b) => a.metadata.priority - b.metadata.priority);
    
    console.log(`${YELLOW}Запускается ${testsToRun.length} из ${this.tests.length} тестов${RESET}\n`);
    
    // Запуск тестов
    for (const test of testsToRun) {
      await this.runTest(test);
    }
    
    this.printSummary();
  }

  // Фильтрация тестов
  filterTests(filters) {
    return this.tests.filter(test => {
      // Пропущенные тесты
      if (test.metadata.skip && !filters.includeSkipped) {
        return false;
      }
      
      // Фильтр по тегам
      if (filters.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => test.metadata.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      // Фильтр по приоритету
      if (filters.minPriority && test.metadata.priority > filters.minPriority) {
        return false;
      }
      
      // Фильтр по имени
      if (filters.namePattern && !test.name.includes(filters.namePattern)) {
        return false;
      }
      
      // Проверка зависимостей
      if (test.metadata.dependsOn.length > 0) {
        const dependenciesMet = test.metadata.dependsOn.every(depId => {
          const depTest = this.results.find(r => r.id === depId);
          return depTest && depTest.status === STATUS.PASSED;
        });
        if (!dependenciesMet) {
          console.log(`${YELLOW}  ⚠ Тест "${test.name}" пропущен: не выполнены зависимости${RESET}`);
          return false;
        }
      }
      
      return true;
    });
  }

  // Запуск одного теста
  async runTest(test) {
    console.log(`${CYAN}[${test.id}] ${test.name}${RESET}`);
    console.log(`${YELLOW}  Теги: ${test.metadata.tags.join(', ') || 'нет'}${RESET}`);
    console.log(`${YELLOW}  Приоритет: ${test.metadata.priority}${RESET}`);
    
    // Проверка на пропуск
    if (test.metadata.skip) {
      console.log(`${YELLOW}  ⚠ ПРОПУЩЕН${RESET}`);
      this.results.push({
        id: test.id,
        name: test.name,
        status: STATUS.SKIPPED,
        message: 'Тест помечен как пропущенный'
      });
      return;
    }
    
    try {
      await test.fn(this.driver, this.config);
      
      if (test.metadata.expectedFailure) {
        console.log(`${RED}  ⚠ ОЖИДАЕМАЯ ОШИБКА: тест прошел, но должен был упасть${RESET}`);
        this.results.push({
          id: test.id,
          name: test.name,
          status: STATUS.EXPECTED_FAILURE,
          message: 'Тест прошел, но был помечен как ожидаемо падающий'
        });
      } else {
        console.log(`${GREEN}  ✔ ПРОЙДЕН${RESET}`);
        this.results.push({
          id: test.id,
          name: test.name,
          status: STATUS.PASSED
        });
      }
    } catch (error) {
      if (test.metadata.expectedFailure) {
        console.log(`${GREEN}  ✔ ОЖИДАЕМО ПАДАЮЩИЙ: ${error.message.substring(0, 50)}...${RESET}`);
        this.results.push({
          id: test.id,
          name: test.name,
          status: STATUS.EXPECTED_FAILURE,
          message: error.message
        });
      } else {
        console.log(`${RED}  ✘ ПРОВАЛЕН: ${error.message.substring(0, 50)}...${RESET}`);
        this.results.push({
          id: test.id,
          name: test.name,
          status: STATUS.FAILED,
          message: error.message
        });
      }
    }
    
    console.log('');
  }

  // Вывод результатов
  printSummary() {
    console.log(`\n${CYAN}${"=".repeat(60)}`);
    console.log(`  РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ`);
    console.log(`${"=".repeat(60)}${RESET}`);
    
    const passed = this.results.filter(r => r.status === STATUS.PASSED).length;
    const failed = this.results.filter(r => r.status === STATUS.FAILED).length;
    const skipped = this.results.filter(r => r.status === STATUS.SKIPPED).length;
    const expectedFailures = this.results.filter(r => r.status === STATUS.EXPECTED_FAILURE).length;
    
    console.log(`${GREEN}  Пройдено: ${passed}${RESET}`);
    console.log(`${RED}  Провалено: ${failed}${RESET}`);
    console.log(`${YELLOW}  Пропущено: ${skipped}${RESET}`);
    console.log(`${CYAN}  Ожидаемо падающих: ${expectedFailures}${RESET}`);
    console.log(`  Всего: ${this.results.length}`);
    
    // Детали по проваленным тестам
    if (failed > 0) {
      console.log(`\n${RED}Проваленные тесты:${RESET}`);
      this.results
        .filter(r => r.status === STATUS.FAILED)
        .forEach(test => {
          console.log(`  ${test.id}. ${test.name}: ${test.message}`);
        });
    }
    
    console.log("═".repeat(60) + "\n");
  }

  // Закрытие браузера
  async cleanup() {
    if (this.driver) {
      await this.driver.sleep(1000);
      await this.driver.quit();
      console.log(`${GREEN}Браузер закрыт${RESET}`);
    }
  }
}

module.exports = TestRunner;