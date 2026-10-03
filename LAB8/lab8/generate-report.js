const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, 'tests');
const REPORT_DIR = path.join(__dirname, 'report');
const JSON_FILE = path.join(REPORT_DIR, 'results.json');
const HTML_FILE = path.join(REPORT_DIR, 'index.html');

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

console.log(' Запуск тестов и сбор результатов...');
try {
    execSync(`npx mocha "${path.join(TESTS_DIR, '*.test.js')}" --reporter json --reporter-option output="${JSON_FILE}"`, { stdio: 'inherit' });
} catch {
    console.log('⚠ Тесты завершены (могут быть ошибки, отчёт генерируется)');
}

if (!fs.existsSync(JSON_FILE)) {
    console.error(' Не удалось создать JSON с результатами');
    process.exit(1);
}

const mochaData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

const html = `<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Viva Braslav — Отчёт</title>
</head>
<body>
    <h1>Viva Braslav 2026 — Отчёт по тестам</h1>
    <p id="date"></p>
    <h2>Статистика</h2>
    <div id="stats"></div>
    <h2>Тесты</h2>
    <div id="tests"></div>
    <script>
        var DATA = ${JSON.stringify({ stats: mochaData.stats, tests: mochaData.tests })};

        document.getElementById('date').textContent = new Date(DATA.stats.start).toLocaleString('ru-RU');
        var s = DATA.stats;
        document.getElementById('stats').innerHTML =
            'Всего тестов: ' + s.tests + '<br>' +
            ' Пройдено: ' + s.passes + '<br>' +
            ' Упало: ' + s.failures + '<br>' +
            ' Ожидает: ' + s.pending + '<br>' +
            '⏱ Длительность: ' + Math.round(s.duration / 1000) + ' сек';

        var container = document.getElementById('tests');
        DATA.tests.forEach(function(t) {
            //  Исправленная логика статусов
            var state = t.state || 'passed';
            var isPending = state === 'pending' || t.pending === true;
            var isFailed  = state === 'failed';
            
            var icon = isPending ? '⏳' : (isFailed ? '❌' : '✅');
            var bg = isFailed ? '#ffebee' : (isPending ? '#fff8e1' : '#fff');
            var border = isFailed ? 'border-left: 4px solid #d32f2f;' : (isPending ? 'border-left: 4px solid #fbc02d;' : 'border-left: 4px solid #4caf50;');
            
            var errHtml = '';
            if (isFailed && t.err && t.err.message) {
                errHtml = '<br><small style="color:#c62828">🔴 Ошибка: ' + t.err.message.replace(/</g, '&lt;').replace(/\\n/g, '<br>') + '</small>';
            }

            var div = document.createElement('div');
            div.style.cssText = 'margin-bottom:12px;padding:10px;background:' + bg + ';' + border + 'border-radius:4px;';
            div.innerHTML = '<b>' + icon + ' ' + (t.fullTitle || t.title).replace(/</g, '&lt;') + '</b>' +
                            '<br><small>⏱️ ' + ((t.duration||0)/1000).toFixed(1) + ' сек' + errHtml + '</small>';
            container.appendChild(div);
        });
    </script>
</body>
</html>`;

fs.writeFileSync(HTML_FILE, html, 'utf8');
console.log('\n✅ Отчёт сохранён: ' + HTML_FILE);
console.log('🌐 Откройте: file:///' + HTML_FILE.replace(/\\/g, '/'));