window.LESSONS = window.LESSONS || {};
window.LESSONS[1] = {
  "id": 1,
  "learn": [
    "Создашь HTML-документ и разберёшь роли head и body.",
    "Добавишь заголовки, абзацы, списки, ссылки и изображения с осмысленным alt.",
    "Освоишь переносы строк, сохранение пробелов и ссылки на разделы."
  ],
  "teacher": {
    "plan": [
      {
        "title": "Старт и цель: Начни с doctype, lang и метаданных",
        "minutes": 10,
        "steps": [
          1
        ]
      },
      {
        "title": "Разбор шагов 1–5: Начни с doctype, lang и метаданных · Заголовки и абзацы · Ссылки и относительные пути · Почта, телефон, якорь и скачивание · Картинки и альтернативный текст",
        "minutes": 40,
        "steps": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "title": "Разбор шагов 6–9: Строчные элементы и выделение · Маркированный и нумерованный список · Сохранение пробелов и перенос строки · Редактор кода и проверка",
        "minutes": 35,
        "steps": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "title": "Практика и самостоятельная сборка",
        "minutes": 25,
        "steps": []
      },
      {
        "title": "Повторение и вопросы",
        "minutes": 10,
        "steps": []
      }
    ],
    "review": [
      {
        "q": "Какое правило нужно вспомнить для шага «Начни с doctype, lang и метаданных»?",
        "a": "DOCTYPE включает современный режим; lang, head и body задают язык, настройки и видимое содержимое."
      },
      {
        "q": "Какое правило нужно вспомнить для шага «Ссылки и относительные пути»?",
        "a": "Для перехода внутри страницы значения href=\"#имя\" и id=\"имя\" должны совпадать."
      },
      {
        "q": "Какое правило нужно вспомнить для шага «Строчные элементы и выделение»?",
        "a": "Сначала выбери семантическое выделение, а внешний вид меняй отдельным CSS-правилом."
      },
      {
        "q": "Какое правило нужно вспомнить для шага «Редактор кода и проверка»?",
        "a": "Сохрани файл с расширением .html и проверь его в браузере после каждого небольшого изменения."
      }
    ],
    "tips": [
      "Начни с вопроса о теме «Начни с doctype, lang и метаданных»: пусть ученик назовёт роль элемента или свойства своими словами, затем покажи пример.",
      "После шага «Картинки и альтернативный текст» предложи закрыть код и восстановить небольшой фрагмент по памяти, объясняя каждую строку.",
      "Заверши занятиe практикой «Собери афишу экскурсии»: сначала попроси спланировать структуру, затем сравните результат с образцом."
    ],
    "answers": "<p><strong>Образец для разбора:</strong> сравни с практикой урока. Ученик объясняет, какие части относятся к HTML, какие правила задают внешний вид и где элементы связываются между собой.</p><h4>Фрагмент HTML</h4><pre><code>&lt;!doctype html&gt;\n&lt;html lang=\"ru\"&gt;\n&lt;head&gt;\n  &lt;meta charset=\"utf-8\"&gt;\n  &lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"&gt;\n  &lt;title&gt;Первая страница: каркас, текст, ссылки, картинки — практика&lt;/title&gt;\n&lt;/head&gt;\n&lt;body&gt;\n  &lt;main class=\"page\"&gt;\n    &lt;header class=\"hero\"&gt;&lt;p class=\"eyebrow\"&gt;УЧЕБНЫЙ ПРОЕКТ&lt;/p&gt;&lt;h1&gt;Небольшую страницу по теме «Первая страница: каркас, текст, ссылки, картинки»&lt;/h1&gt;&lt;p&gt;Небольшой макет, который можно улучшать по шагам.&lt;/p&gt;&lt;a class=\"action\" href=\"#details\"&gt;Посмотреть содержание&lt;/a&gt;&lt;/header&gt;\n    &lt;section class=\"cards\" id=\"details\"&gt;&lt;article class=\"card\"&gt;&lt;h2&gt;Основная часть&lt;/h2&gt;&lt;p&gt;Добавь полезное описание и подпись.&lt;/p&gt;&lt;/article&gt;&lt;article class=\"card\"&gt;&lt;h2&gt;Следующий шаг&lt;/h2&gt;&lt;p&gt;Проверь поведение при длинном тексте.&lt;/p&gt;&lt;/article&gt;&lt;/section&gt;\n  &lt;/main&gt;\n&lt;/body&gt;\n&lt;/html&gt;</code></pre><h4>Фрагмент CSS</h4><pre><code>*{box-sizing:border-box}\nbody{margin:0;padding:24px;background:#f2f5f2;color:#29372f;font:16px/1.6 Arial,sans-serif}\n.page{max-width:900px;margin:auto}\n.hero{padding:clamp(22px,5vw,48px);border-radius:22px;background:#e4efe7}\n.eyebrow{color:#52755d;font-size:.75rem;font-weight:700;letter-spacing:.12em}\nh1{max-width:18ch;font-size:clamp(2rem,6vw,3.6rem);line-height:1.1}\n.action{display:inline-block;padding:10px 14px;border-radius:8px;background:#326649;color:white;text-decoration:none}\n.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;margin-top:18px}\n.card{padding:18px;border:1px solid #d7e0d9;border-radius:14px;background:white}\n@media(max-width:520px){body{padding:14px}}</code></pre>"
  },
  "steps": [
    {
      "id": "doctype-lang-metadata",
      "title": "Начни с doctype, lang и метаданных",
      "text": "<p><strong>HTML-документ</strong> начинается с <code>&lt;!doctype html&gt;</code>: это объявление режима HTML5, а не видимый тег страницы. Затем <code>&lt;html lang=\"ru\"&gt;</code> задаёт корень документа и язык текста. В примерах <code>&lt;head&gt;</code> содержит кодировку, описание, масштаб экрана и название вкладки, а <code>&lt;body&gt;</code> — то, что читает посетитель.</p><p>Посмотри, как один и тот же каркас получает разные <code>&lt;title&gt;</code> и <code>meta description</code>. Если убрать <code>charset</code>, кириллица может отображаться неверно; если забыть viewport, мобильный браузер уменьшит страницу целиком. Не помещай видимый абзац в <code>head</code>: там хранятся настройки документа, а не содержимое.</p>",
      "try": {
        "title": "1. HTML-документ",
        "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Моя первая страница</title>\n</head>\n<body>\n  <h1>Привет, браузер!</h1>\n</body>\n</html>",
        "css": "",
        "height": 275
      },
      "examples": [
        {
          "title": "1. HTML-документ",
          "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Моя первая страница</title>\n</head>\n<body>\n  <h1>Привет, браузер!</h1>\n</body>\n</html>",
          "css": "",
          "height": 275
        },
        {
          "title": "2. Страница с метаданными",
          "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"description\" content=\"Новости научного музея\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Музей открытий</title>\n</head>\n<body>\n  <main><h1>Музей открытий</h1></main>\n</body>\n</html>",
          "css": "",
          "height": 275
        }
      ],
      "remember": "DOCTYPE включает современный режим; lang, head и body задают язык, настройки и видимое содержимое.",
      "mistake": {
        "bad": "<html><head><h1>Привет</h1></head></html>",
        "good": "<html lang=\"ru\"><head><title>Страница</title></head><body><h1>Привет</h1></body></html>",
        "why": "Заголовок для посетителя находится в body; head сообщает браузеру метаданные и подключает ресурсы."
      }
    },
    {
      "id": "headings-paragraphs",
      "title": "Заголовки и абзацы",
      "text": "<p><strong>Заголовки описывают иерархию материала</strong>, а не просто выбирают размер шрифта. В статье про парк один <code>&lt;h1&gt;</code> называет тему; несколько <code>&lt;h2&gt;</code> обозначают равноправные разделы. Элемент <code>&lt;p&gt;</code> собирает предложения в самостоятельный абзац. Во втором образце метка, заголовок и описание карточки тоже читаются в понятном порядке.</p><p>В предпросмотре сравни интервалы между <code>h1</code>, <code>h2</code> и абзацами: CSS меняет размер и отступ, но не уровень темы. Не выбирай <code>h3</code> только потому, что его стандартный шрифт меньше. Частая ошибка — пропустить уровень ради внешнего вида; оставь последовательность заголовков логичной, а визуальный размер настрой CSS.</p>",
      "try": {
        "title": "1. Заголовки статьи",
        "html": "<article>\n  <h1>Как устроен городской парк</h1>\n  <p>Короткое вступление к статье.</p>\n\n  <h2>Деревья и тень</h2>\n  <p>Подробности одного раздела.</p>\n\n  <h2>Дорожки и площадки</h2>\n  <p>Ещё один самостоятельный раздел.</p>\n</article>",
        "css": "article { max-width: 42rem; margin: 0 auto; font: 1rem/1.65 system-ui; }\nh1 { font-size: 2rem; }\nh2 { margin-top: 1.6em; font-size: 1.35rem; }\np { color: #526174; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Заголовки статьи",
          "html": "<article>\n  <h1>Как устроен городской парк</h1>\n  <p>Короткое вступление к статье.</p>\n\n  <h2>Деревья и тень</h2>\n  <p>Подробности одного раздела.</p>\n\n  <h2>Дорожки и площадки</h2>\n  <p>Ещё один самостоятельный раздел.</p>\n</article>",
          "css": "article { max-width: 42rem; margin: 0 auto; font: 1rem/1.65 system-ui; }\nh1 { font-size: 2rem; }\nh2 { margin-top: 1.6em; font-size: 1.35rem; }\np { color: #526174; }",
          "height": 275
        },
        {
          "title": "2. Карточка с иерархией текста",
          "html": "<article class=\"card\">\n  <p class=\"label\">НАБЛЮДЕНИЕ · 04</p>\n  <h2>Свет возвращается</h2>\n  <p>Вечером город постепенно включает фонари.</p>\n</article>",
          "css": ".card { max-width: 25rem; padding: 1.4rem; border: 1px solid #d9e1eb; border-radius: 14px; }\n.label { color: #4866a4; font-size: .75rem; font-weight: 700; }\nh2 { margin: .4rem 0; }",
          "height": 275
        }
      ],
      "remember": "Выбирай h1–h6 по вложенности раздела, а размер букв задавай CSS.",
      "mistake": {
        "bad": "<h1>Парк</h1><h4>Деревья</h4>",
        "good": "<h1>Парк</h1><h2>Деревья</h2>",
        "why": "Переход сразу к h4 ломает навигационную иерархию, хотя CSS может сделать такой заголовок визуально красивым."
      }
    },
    {
      "id": "links-paths",
      "title": "Ссылки и относительные пути",
      "text": "<p><strong>Ссылка соединяет страницу с другим адресом или местом.</strong> В первом образце <code>href=\"#routes\"</code> ведёт к элементу с <code>id=\"routes\"</code>, а <code>about.html</code> открывает соседнюю страницу. Во втором показаны специальные адреса <code>mailto:</code> и <code>tel:</code>, а атрибут <code>download</code> предлагает сохранить файл. Текст ссылки сообщает, что произойдёт после нажатия.</p><p>В превью проверь якорь: значение после решётки должно точно совпадать с <code>id</code>, включая регистр. Относительный путь считается от текущего HTML-файла, поэтому ссылка на файл из вложенной папки будет отличаться. Не ставь пустой <code>href=\"#\"</code> как заглушку: он обычно переносит страницу вверх и не ведёт к содержанию.</p>",
      "try": {
        "title": "1. Ссылки и переходы",
        "html": "<nav aria-label=\"Разделы статьи\">\n  <a href=\"#routes\">Маршруты</a>\n  <a href=\"about.html\">О проекте</a>\n</nav>\n\n<section id=\"routes\">\n  <h2>Маршруты выходного дня</h2>\n  <p>Этот раздел найден по ссылке-якорю.</p>\n</section>",
        "css": "nav { display: flex; flex-wrap: wrap; gap: 1rem; }\na { color: #315f47; }\nsection { margin-top: 2rem; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Ссылки и переходы",
          "html": "<nav aria-label=\"Разделы статьи\">\n  <a href=\"#routes\">Маршруты</a>\n  <a href=\"about.html\">О проекте</a>\n</nav>\n\n<section id=\"routes\">\n  <h2>Маршруты выходного дня</h2>\n  <p>Этот раздел найден по ссылке-якорю.</p>\n</section>",
          "css": "nav { display: flex; flex-wrap: wrap; gap: 1rem; }\na { color: #315f47; }\nsection { margin-top: 2rem; }",
          "height": 275
        },
        {
          "title": "2. Контакты и файл",
          "html": "<p>Напиши автору: <a href=\"mailto:guide@example.test\">guide@example.test</a></p>\n<p>Позвони: <a href=\"tel:+70000000000\">+7 000 000-00-00</a></p>\n<a href=\"files/plan.pdf\" download>Скачать план прогулки</a>",
          "css": "a { display: inline-block; margin: .35rem; color: #315f47; }",
          "height": 275
        }
      ],
      "remember": "Для перехода внутри страницы значения href=\"#имя\" и id=\"имя\" должны совпадать.",
      "mistake": {
        "bad": "<a href=\"#contact\">Контакты</a><section id=\"contacts\">…</section>",
        "good": "<a href=\"#contact\">Контакты</a><section id=\"contact\">…</section>",
        "why": "Даже одна лишняя буква разрывает связь между ссылкой и целью."
      }
    },
    {
      "id": "link-types-download-anchors",
      "title": "Почта, телефон, якорь и скачивание",
      "text": "<p><strong>Разный адрес в href задаёт разное действие.</strong> Ссылка на статью ведёт к файлу about.html, якорь #routes перемещает к разделу с тем же id, а mailto и tel открывают подходящее приложение. Атрибут download у ссылки на памятку предлагает скачать файл. В каждом варианте видимый текст заранее объясняет ожидаемый переход.</p><p>Проверь якорь, чтобы id существовал ровно в одном месте; браузер не найдёт цель при несовпадении даже одного символа. Для внешнего сайта нужен полный адрес, для соседней страницы — путь относительно текущего файла. Не указывай javascript: и не используй пустую ссылку для декоративного текста; если действие меняет состояние, позже изучим подходящую кнопку.</p>",
      "try": {
        "title": "1. Ссылки и переходы",
        "html": "<nav aria-label=\"Разделы статьи\">\n  <a href=\"#routes\">Маршруты</a>\n  <a href=\"about.html\">О проекте</a>\n</nav>\n\n<section id=\"routes\">\n  <h2>Маршруты выходного дня</h2>\n  <p>Этот раздел найден по ссылке-якорю.</p>\n</section>",
        "css": "nav { display: flex; flex-wrap: wrap; gap: 1rem; }\na { color: #315f47; }\nsection { margin-top: 2rem; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Ссылки и переходы",
          "html": "<nav aria-label=\"Разделы статьи\">\n  <a href=\"#routes\">Маршруты</a>\n  <a href=\"about.html\">О проекте</a>\n</nav>\n\n<section id=\"routes\">\n  <h2>Маршруты выходного дня</h2>\n  <p>Этот раздел найден по ссылке-якорю.</p>\n</section>",
          "css": "nav { display: flex; flex-wrap: wrap; gap: 1rem; }\na { color: #315f47; }\nsection { margin-top: 2rem; }",
          "height": 275
        },
        {
          "title": "2. Контакты и файл",
          "html": "<p>Напиши автору: <a href=\"mailto:guide@example.test\">guide@example.test</a></p>\n<p>Позвони: <a href=\"tel:+70000000000\">+7 000 000-00-00</a></p>\n<a href=\"files/plan.pdf\" download>Скачать план прогулки</a>",
          "css": "a { display: inline-block; margin: .35rem; color: #315f47; }",
          "height": 275
        }
      ],
      "remember": "Ссылку создаёт a с содержательным текстом и подходящим href.",
      "mistake": {
        "bad": "<a href=\"#routes\">Перейти</a><section id=\"route\">…</section>",
        "good": "<a href=\"#routes\">Маршруты</a><section id=\"routes\">…</section>",
        "why": "Якорная цель должна совпасть с href посимвольно, а текст ссылки должен сообщать направление."
      }
    },
    {
      "id": "images-alt",
      "title": "Картинки и альтернативный текст",
      "text": "<p><strong>Тег img показывает файл, а alt передаёт его смысл тем, кто не видит картинку.</strong> У пейзажа текст описывает горный хребет; у второго фото стоит пустой <code>alt=\"\"</code>, потому что заголовок рядом уже сообщает полезную информацию. <code>width</code> и <code>height</code> резервируют место до загрузки, а <code>loading=\"lazy\"</code> откладывает загрузку изображения ниже первого экрана.</p><p>Оба примера заключают изображение в <code>figure</code> и добавляют подпись через <code>figcaption</code>; в карточке CSS задаёт размер и скругление. Проверь, что путь в <code>src</code> существует и alt не начинается словами «картинка с изображением». Не оставляй у содержательной фотографии пустое описание и не дублируй в alt длинную подпись.</p>",
      "try": {
        "title": "1. Смысловая фотография с alt и размерами",
        "html": "<figure class=\"place\">\n  <img src=\"assets/mountains.svg\" width=\"960\" height=\"600\" loading=\"lazy\" alt=\"Горный хребет над зелёной долиной\">\n  <figcaption>Вид с северной тропы</figcaption>\n</figure>",
        "css": ".place { max-width: 32rem; margin: 0; }\nimg { display: block; width: 100%; height: auto; border-radius: 14px; }\nfigcaption { margin-top: .5rem; color: #586574; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Смысловая фотография с alt и размерами",
          "html": "<figure class=\"place\">\n  <img src=\"assets/mountains.svg\" width=\"960\" height=\"600\" loading=\"lazy\" alt=\"Горный хребет над зелёной долиной\">\n  <figcaption>Вид с северной тропы</figcaption>\n</figure>",
          "css": ".place { max-width: 32rem; margin: 0; }\nimg { display: block; width: 100%; height: auto; border-radius: 14px; }\nfigcaption { margin-top: .5rem; color: #586574; }",
          "height": 275
        },
        {
          "title": "2. Декоративное фото не повторяет текст",
          "html": "<article class=\"profile\">\n  <img src=\"assets/forest-trail.svg\" width=\"96\" height=\"96\" loading=\"lazy\" alt=\"\">\n  <div><h2>Маршрут у озера</h2><p>Фото здесь только украшает карточку.</p></div>\n</article>",
          "css": ".profile { display: flex; align-items: center; gap: 1rem; max-width: 30rem; padding: 1rem; border: 1px solid #dce4dd; border-radius: 14px; }\n.profile img { width: 72px; height: 72px; object-fit: cover; border-radius: 12px; }\np { margin: 0; color: #57655b; }",
          "height": 275
        }
      ],
      "remember": "Содержательная картинка получает короткий alt; декоративная — пустой alt=\"\".",
      "mistake": {
        "bad": "<img src=\"assets/mountains.svg\" alt=\"\">",
        "good": "<img src=\"assets/mountains.svg\" alt=\"Горный хребет над долиной\">",
        "why": "Пейзаж передаёт содержание, поэтому его описание нужно пользователю экранного диктора."
      }
    },
    {
      "id": "inline-emphasis",
      "title": "Строчные элементы и выделение",
      "text": "<p><strong>Некоторые строчные элементы показывают, как именно оформлена часть текста.</strong> В первом примере <code>b</code> и <code>i</code> выделяют слова, а <code>del</code> и <code>ins</code> показывают удалённую и добавленную версию. Эти элементы не начинают новый абзац: они остаются внутри строки.</p><p>Во втором варианте <code>sub</code> и <code>sup</code> ставят маленький символ ниже или выше строки, например в формуле <code>H&lt;sub&gt;2&lt;/sub&gt;O</code> или в записи площади. Для выделения по смыслу и для декоративного вида выбирай подходящий тег или CSS-класс; не добавляй элементы только ради случайного жирного начертания.</p>",
      "try": {
        "title": "Строчные элементы: отметки и индексы",
        "html": "<p>Важно: <b>не оставляй мусор</b>.</p>\n<p>Латинское название: <i>Quercus robur</i>.</p>\n<p>Цена: <del>900 сом</del> <ins>700 сом</ins>.</p>",
        "css": "b { color: #9b3d32; }\nins { color: #256b49; }",
        "height": 240
      },
      "examples": [
        {
          "title": "1. Отметки в тексте",
          "html": "<p>Важно: <b>не оставляй мусор</b>.</p>\n<p><i>Quercus robur</i> — латинское название дуба.</p>\n<p>Старая цена <del>900 сом</del>, новая — <ins>700 сом</ins>.</p>",
          "css": "b { color: #9b3d32; }\nins { color: #256b49; }",
          "height": 255
        },
        {
          "title": "2. Индексы в формулах",
          "html": "<p>Формула воды: H<sub>2</sub>O</p>\n<p>Площадь участка: 12 м<sup>2</sup></p>\n<span>Строчные элементы остаются в строке.</span>",
          "css": "sub, sup { color: #326649; }\nspan { padding: 4px 8px; background: #edf4ed; }",
          "height": 255
        }
      ],
      "remember": "b и i оформляют фрагмент, del и ins показывают изменение, sub и sup задают нижний и верхний индекс.",
      "mistake": {
        "bad": "<span style=\"font-weight:bold\">Важно</span>",
        "good": "<strong>Важно</strong>",
        "why": "span с жирным шрифтом сообщает только оформление, тогда как strong передаёт важность и без CSS."
      }
    },
    {
      "id": "html-lists",
      "title": "Маркированный и нумерованный список",
      "text": "<p><strong>Маркированный список строится через ul, нумерованный — через ol.</strong> Список связывает пункты одной темы. Элемент <code>ul</code> подходит для вещей без фиксированного порядка, например набора для пикника; <code>ol</code> — для шагов, которые нужно выполнить последовательно. Каждый пункт находится в <code>li</code>. В первом примере вложенный <code>ul</code> размещён внутри пункта «Перекус», потому что фрукты и орехи относятся именно к нему.</p><p>Во втором варианте порядок действий важен: поменяй местами пункты и увидишь, что смысл процедуры меняется. CSS добавляет промежуток между соседними <code>li</code>, но не должен подменять маркеры картинками ради смысла. Не клади <code>li</code> прямо в <code>div</code>: без родителя <code>ul</code> или <code>ol</code> структура списка неверна.</p>",
      "try": {
        "title": "1. Список покупок и подсписок",
        "html": "<h2>Для пикника</h2>\n<ul>\n  <li>Вода</li>\n  <li>Перекус\n    <ul><li>Фрукты</li><li>Орехи</li></ul>\n  </li>\n  <li>Карта маршрута</li>\n</ul>",
        "css": "li { margin-block: .45rem; }\nul ul { color: #526174; font-size: .95rem; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Список покупок и подсписок",
          "html": "<h2>Для пикника</h2>\n<ul>\n  <li>Вода</li>\n  <li>Перекус\n    <ul><li>Фрукты</li><li>Орехи</li></ul>\n  </li>\n  <li>Карта маршрута</li>\n</ul>",
          "css": "li { margin-block: .45rem; }\nul ul { color: #526174; font-size: .95rem; }",
          "height": 275
        },
        {
          "title": "2. Последовательность шагов",
          "html": "<h2>Опубликовать страницу</h2>\n<ol>\n  <li>Сохрани файлы в папку проекта.</li>\n  <li>Проверь страницу в браузере.</li>\n  <li>Загрузи папку на хостинг.</li>\n</ol>",
          "css": "ol { max-width: 30rem; padding: 1.2rem 1.2rem 1.2rem 2.7rem; border-radius: 12px; background: #eef3ff; }\nli + li { margin-top: .65rem; }",
          "height": 275
        }
      ],
      "remember": "ul обозначает набор без порядка, ol — последовательность, li — один пункт.",
      "mistake": {
        "bad": "<ol><li>Проверить код</li><li>Сохранить проект</li></ol>",
        "good": "<ol><li>Сохранить проект</li><li>Проверить код</li></ol>",
        "why": "В нумерованном списке порядок выполнения влияет на результат, поэтому располагай действия по ходу работы."
      }
    },
    {
      "id": "whitespace-pre-line-break",
      "title": "Сохранение пробелов и перенос строки",
      "text": "<p><strong>HTML обычно сворачивает подряд идущие пробелы и переносы исходного файла в один пробел.</strong> Поэтому в первом абзаце несколько пробелов не растянут текст. Элемент pre сохраняет исходные пробелы и строки; это полезно для команд или кода. Браузер также показывает содержимое pre в моноширинном шрифте, а CSS добавляет фон и внутренний отступ.</p><p>Во втором образце br переносит строку внутри почтового адреса, который остаётся одним смысловым блоком address. На узком экране длинная команда в pre прокручивается внутри своего блока. Не вставляй десятки br между предложениями, чтобы создать расстояние: для разных мыслей используй p, а интервалы настраивай CSS.</p>",
      "try": {
        "title": "1. Пробелы в тексте",
        "html": "<p>Браузер       объединяет\n  обычные пробелы и переносы в HTML.</p>\n<pre>Команда:  npm run start\nПуть:     ./assets/logo.svg</pre>",
        "css": "pre { padding: 1rem; overflow: auto; border-radius: 10px; background: #20283a; color: #fff; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Пробелы в тексте",
          "html": "<p>Браузер       объединяет\n  обычные пробелы и переносы в HTML.</p>\n<pre>Команда:  npm run start\nПуть:     ./assets/logo.svg</pre>",
          "css": "pre { padding: 1rem; overflow: auto; border-radius: 10px; background: #20283a; color: #fff; }",
          "height": 275
        },
        {
          "title": "2. Принудительный перенос строки",
          "html": "<address>\n  Улица Садовая, дом 12<br>\n  Город Озёрный<br>\n  <a href=\"mailto:hello@example.test\">hello@example.test</a>\n</address>",
          "css": "address { line-height: 1.8; font-style: normal; }\na { color: #315f47; }",
          "height": 275
        }
      ],
      "remember": "Обычные пробелы сворачиваются; pre сохраняет формат, а br нужен для смыслового переноса внутри блока.",
      "mistake": {
        "bad": "<p>Адрес<br><br><br>Город</p>",
        "good": "<address>Адрес<br>Город</address>",
        "why": "Повторные br не задают отступ и запутывают структуру; перенос строки применяй только внутри одного блока."
      }
    },
    {
      "id": "editor-save-preview",
      "title": "Редактор кода и проверка",
      "text": "<p><strong>Редактор хранит исходный текст, браузер показывает его результат.</strong> В первом примере разметка для <code>index.html</code> содержит заголовок и абзац. Сохрани файл с расширением <code>.html</code>, затем открой его в браузере. Во втором варианте измени текст внутри <code>h2</code> и сравни страницу после сохранения.</p><p>Редактируй по одному изменению: так проще понять, какая строка повлияла на результат. Если браузер показывает старую версию, проверь, что сохранил нужный файл и обновил именно его вкладку. Частая ошибка новичка — назвать документ <code>index.html.txt</code>; включи отображение расширений в системе и убедись, что конец имени действительно <code>.html</code>.</p>",
      "try": {
        "title": "1. Сохрани файл и проверь страницу",
        "html": "<!-- Сохрани код как index.html -->\n<main>\n  <h1>Мой первый проект</h1>\n  <p>Сохрани файл, затем открой его в браузере.</p>\n</main>",
        "css": "main { max-width: 42rem; margin: 2rem auto; padding: 1rem; font-family: system-ui, sans-serif; }\nh1 { color: #315f47; }",
        "height": 275
      },
      "examples": [
        {
          "title": "1. Сохрани файл и проверь страницу",
          "html": "<!-- Сохрани код как index.html -->\n<main>\n  <h1>Мой первый проект</h1>\n  <p>Сохрани файл, затем открой его в браузере.</p>\n</main>",
          "css": "main { max-width: 42rem; margin: 2rem auto; padding: 1rem; font-family: system-ui, sans-serif; }\nh1 { color: #315f47; }",
          "height": 275
        },
        {
          "title": "2. Измени код и сравни результат",
          "html": "<!-- Попробуй изменить текст заголовка -->\n<section>\n  <h2>Городской сад</h2>\n  <p>Проверь изменения после сохранения файла.</p>\n</section>",
          "css": "section { padding: 1.25rem; border: 1px solid #dce3e8; border-radius: 12px; }\nh2 { margin-top: 0; }",
          "height": 275
        }
      ],
      "remember": "Сохрани файл с расширением .html и проверь его в браузере после каждого небольшого изменения.",
      "mistake": {
        "bad": "index.html.txt",
        "good": "index.html",
        "why": "Текстовый редактор может незаметно добавить .txt, и браузер тогда не распознает документ как HTML-страницу."
      }
    }
  ],
  "cheatsheet": {
    "lang": "html",
    "code": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Моя страница</title>\n  <link rel=\"stylesheet\" href=\"./style.css\">\n</head>\n<body>\n  <h1>Название страницы</h1>\n  <p>Короткое описание.</p>\n  <a href=\"#details\">Подробнее</a>\n  <img src=\"photo.jpg\" alt=\"Описание изображения\">\n  <ul><li>Первый пункт</li></ul>\n</body>\n</html>"
  },
  "practice": {
    "intro": "Собери афишу экскурсии: начни с каркаса HTML, добавь заголовки, ссылки, изображение и список, а затем проверь страницу в браузере.",
    "stages": [
      {
        "title": "Подготовь основу · Начни с doctype, lang и метаданных",
        "task": "Для проекта «афишу субботней экскурсии в городской сад» выполни шаг «Начни с doctype, lang и метаданных»: DOCTYPE включает современный режим; lang, head и body задают язык, настройки и видимое содержимое. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<html lang=\"ru\"><head><title>Страница</title></head><body><h1>Привет</h1></body></html>», отличает его от ошибки «<html><head><h1>Привет</h1></head></html>» и объясняет: Заголовок для посетителя находится в body; head сообщает браузеру метаданные и подключает ресурсы."
      },
      {
        "title": "Добавь ключевой приём · Ссылки и относительные пути",
        "task": "Для проекта «афишу субботней экскурсии в городской сад» выполни шаг «Ссылки и относительные пути»: Для перехода внутри страницы значения href=\"#имя\" и id=\"имя\" должны совпадать. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<a href=\"#contact\">Контакты</a><section id=\"contact\">…</section>», отличает его от ошибки «<a href=\"#contact\">Контакты</a><section id=\"contacts\">…</section>» и объясняет: Даже одна лишняя буква разрывает связь между ссылкой и целью."
      },
      {
        "title": "Собери рабочий фрагмент · Строчные элементы и выделение",
        "task": "Для проекта «афишу субботней экскурсии в городской сад» выполни шаг «Строчные элементы и выделение»: Сначала выбери семантическое выделение, а внешний вид меняй отдельным CSS-правилом. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<strong>Важно</strong>», отличает его от ошибки «<span style=\"font-weight:bold\">Важно</span>» и объясняет: span с жирным шрифтом сообщает только оформление, тогда как strong передаёт важность и без CSS."
      },
      {
        "title": "Проверь и объясни · Редактор кода и проверка",
        "task": "Для проекта «афишу субботней экскурсии в городской сад» выполни шаг «Редактор кода и проверка»: Сохрани файл с расширением .html и проверь его в браузере после каждого небольшого изменения. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «index.html», отличает его от ошибки «index.html.txt» и объясняет: Текстовый редактор может незаметно добавить .txt, и браузер тогда не распознает документ как HTML-страницу."
      }
    ],
    "hints": [
      "Если застрял на «Начни с doctype, lang и метаданных», проверь правило: DOCTYPE включает современный режим; lang, head и body задают язык, настройки и видимое содержимое. Частая ошибка: <html><head><h1>Привет</h1></head></html> — Заголовок для посетителя находится в body; head сообщает браузеру метаданные и подключает ресурсы.",
      "Если застрял на «Ссылки и относительные пути», проверь правило: Для перехода внутри страницы значения href=\"#имя\" и id=\"имя\" должны совпадать. Частая ошибка: <a href=\"#contact\">Контакты</a><section id=\"contacts\">…</section> — Даже одна лишняя буква разрывает связь между ссылкой и целью.",
      "Если застрял на «Строчные элементы и выделение», проверь правило: Сначала выбери семантическое выделение, а внешний вид меняй отдельным CSS-правилом. Частая ошибка: <span style=\"font-weight:bold\">Важно</span> — span с жирным шрифтом сообщает только оформление, тогда как strong передаёт важность и без CSS."
    ],
    "solution": {
      "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Первая страница: каркас, текст, ссылки, картинки — практика</title>\n</head>\n<body>\n  <main class=\"page\">\n    <header class=\"hero\"><p class=\"eyebrow\">УЧЕБНЫЙ ПРОЕКТ</p><h1>Небольшую страницу по теме «Первая страница: каркас, текст, ссылки, картинки»</h1><p>Небольшой макет, который можно улучшать по шагам.</p><a class=\"action\" href=\"#details\">Посмотреть содержание</a></header>\n    <section class=\"cards\" id=\"details\"><article class=\"card\"><h2>Основная часть</h2><p>Добавь полезное описание и подпись.</p></article><article class=\"card\"><h2>Следующий шаг</h2><p>Проверь поведение при длинном тексте.</p></article></section>\n  </main>\n</body>\n</html>",
      "css": "*{box-sizing:border-box}\nbody{margin:0;padding:24px;background:#f2f5f2;color:#29372f;font:16px/1.6 Arial,sans-serif}\n.page{max-width:900px;margin:auto}\n.hero{padding:clamp(22px,5vw,48px);border-radius:22px;background:#e4efe7}\n.eyebrow{color:#52755d;font-size:.75rem;font-weight:700;letter-spacing:.12em}\nh1{max-width:18ch;font-size:clamp(2rem,6vw,3.6rem);line-height:1.1}\n.action{display:inline-block;padding:10px 14px;border-radius:8px;background:#326649;color:white;text-decoration:none}\n.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;margin-top:18px}\n.card{padding:18px;border:1px solid #d7e0d9;border-radius:14px;background:white}\n@media(max-width:520px){body{padding:14px}}"
    },
    "findError": {
      "code": ".page { width: 1000px; }\n.action { outline: none; }\nimg { width: 400px; }",
      "solution": "<p>Фиксированная ширина переполняет мобильный экран; ограничь контейнер через max-width и оставь width:100%. Не убирай клавиатурный контур без заметной замены. Изображению задай max-width:100% и подходящее соотношение сторон.</p>"
    }
  },
  "can": [
    "Создать файл .html с языком страницы и метаданными.",
    "Выбрать заголовок, абзац или список по смыслу.",
    "Создать ссылку на страницу, файл или раздел.",
    "Добавить изображение с понятным alt и проверить его в браузере."
  ],
  "projects": [
    {
      "title": "Страница рецепта для семейной книги",
      "about": "Семья хочет сохранить один любимый рецепт на странице, которую удобно читать и распечатать.",
      "steps": [
        "Сделай заголовок и короткое вступление.",
        "Добавь фото с alt, ингредиенты списком и нумерованные шаги приготовления.",
        "Оформи страницу отдельным CSS: шрифт, цвета, отступы и ширина текста."
      ],
      "done": [
        "Заголовок заметен, список легко читать.",
        "Путь к изображению и подключение CSS работают.",
        "Текст не прилипает к краям окна."
      ],
      "stretch": "Добавь блок «Совет повара» с отдельным цветом и рамкой.",
      "example": {
        "title": "Страница рецепта для семейной книги",
        "description": "Образец готовой страницы для проекта «Страница рецепта для семейной книги». Семейный рецепт завтрака: продукты, понятные шаги и небольшой совет перед подачей.",
        "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Тёплая каша с тыквой</title>\n  <link rel=\"stylesheet\" href=\"./style.css\">\n  \n</head>\n<body>\n  <div class=\"demo demo--recipe\" id=\"top\" style=\"--accent:#8a4f31;--soft:#eaf0f7\">\n    <header class=\"demo-header\"><a class=\"demo-brand\" href=\"#top\">ПРИМЕР ПРОЕКТА</a><nav class=\"demo-nav\" aria-label=\"Навигация по странице\"><a href=\"#top\">О проекте</a><a href=\"#details\">Подробности</a></nav></header>\n    <main>\n      <section class=\"demo-hero\" aria-labelledby=\"project-title\"><span class=\"demo-kicker\">ИЗ СЕМЕЙНОЙ КНИГИ</span><h1 id=\"project-title\">Тёплая каша с тыквой</h1><p class=\"demo-lead\">Семейный рецепт завтрака: продукты, понятные шаги и небольшой совет перед подачей.</p></section>\n      <section class=\"demo-section\" id=\"details\"><h2>Что важно знать</h2><div class=\"demo-grid demo-recipe-grid\"><figure class=\"demo-figure\"><img src=\"../assets/porridge.svg\" alt=\"Миска золотистой каши с кусочками тыквы\"><figcaption>Каша с тыквой — простой домашний завтрак</figcaption></figure><div><h2>Что понадобится</h2><ul class=\"demo-list\"><li>1 стакан пшена</li><li>2 стакана молока</li><li>250 г тыквы</li><li>Щепотка соли</li></ul><div class=\"demo-note\"><b>Совет:</b> Дай каше постоять под крышкой пять минут: так она станет мягче.</div></div></div><section class=\"demo-section\"><h2>Как приготовить</h2><ol class=\"demo-list\"><li>Промой пшено тёплой водой.</li><li>Нарежь тыкву небольшими кусочками и провари 8 минут.</li><li>Добавь крупу и молоко; вари на слабом огне около 20 минут.</li></ol></section></section>\n    </main>\n    <footer class=\"demo-footer\">Учебный пример HTML и CSS · макет для обсуждения на занятии</footer>\n  </div>\n</body>\n</html>",
        "css": ":root { color-scheme: light; }\n* { box-sizing: border-box; }\nbody { margin: 0; color: #202635; background: #f4f6f8; font: 15px/1.55 Arial, sans-serif; }\na { color: inherit; }\n.demo { --accent: #365c8d; --soft: #eaf0f7; --ink: #202635; max-width: 1100px; min-height: 100vh; margin: 0 auto; padding: 0 26px 46px; background: #fff; }\n.demo-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 66px; border-bottom: 1px solid #e8ebef; }\n.demo-brand { color: var(--accent); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-decoration: none; text-transform: uppercase; }\n.demo-nav { display: flex; flex-wrap: wrap; gap: 16px; color: #626b79; font-size: 12px; }\n.demo-nav a { display: flex; align-items: center; min-height: 44px; text-decoration: none; }\n.demo-nav a:hover, .demo-nav a:focus-visible { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }\n.demo-hero { position: relative; overflow: hidden; margin: 22px 0; padding: clamp(24px,5vw,56px); border-radius: 20px; background: linear-gradient(120deg,var(--soft),#fff 72%); }\n.demo-hero::after { position: absolute; right: -54px; bottom: -120px; width: 280px; height: 280px; border: 1px solid #d8e0eb; border-radius: 50%; content: ''; }\n.demo-kicker { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .14em; }\n.demo h1 { max-width: 760px; margin: 11px 0 10px; font-size: clamp(30px,5vw,48px); line-height: 1.08; letter-spacing: -.045em; }\n.demo-lead { max-width: 670px; margin: 0; color: #5e6877; font-size: 16px; }\n.demo-section { margin: 30px 0; }\n.demo-section h2 { margin: 0 0 13px; font-size: 21px; letter-spacing: -.025em; }\n.demo-section > p { max-width: 720px; color: #5e6877; }\n.demo-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 13px; }\n.demo-card { min-width: 0; padding: 19px; border: 1px solid #e7eaf0; border-radius: 14px; background: #fff; }\n.demo-card small { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\n.demo-card h3 { margin: 9px 0 6px; font-size: 17px; }\n.demo-card p { margin: 0; color: #647080; font-size: 13px; }\n.demo-note { margin: 18px 0; padding: 14px 16px; border-left: 3px solid var(--accent); border-radius: 0 10px 10px 0; background: var(--soft); color: #424d5d; font-size: 13px; }\n.demo-list { display: grid; gap: 8px; margin: 0; padding-left: 21px; color: #465264; }\n.demo-cta { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; margin-top: 12px; padding: 10px 16px; border-radius: 9px; color: #fff; background: var(--accent); font-size: 13px; font-weight: 700; text-decoration: none; transition: filter .16s ease,transform .16s ease; }\n.demo-cta:hover, .demo-cta:focus-visible { filter: brightness(.9); outline: 3px solid #d6deea; outline-offset: 2px; }\n.demo-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8ebef; color: #77808e; font-size: 11px; }\n.demo-footer-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }\n.demo-footer-columns h2 { margin: 0 0 6px; color: #344050; font-size: 12px; }\n.demo-footer-columns p { margin: 0; }\n.demo-footer-columns a { color: var(--accent); }\n.demo-table-wrap { overflow-x: auto; border: 1px solid #e3e7ed; border-radius: 12px; }\n.demo-table { width: 100%; border-collapse: collapse; text-align: left; }\n.demo-table caption { padding: 13px; color: #5b6574; font-size: 12px; text-align: left; }\n.demo-table th, .demo-table td { padding: 12px 14px; border-top: 1px solid #e8ebef; }\n.demo-table thead th { color: var(--accent); background: var(--soft); font-size: 11px; }\n.demo-table tbody th { font-size: 12px; }\n.demo-table tbody td { color: #596473; font-size: 12px; }\n.demo-figure { margin: 0; }\n.demo-figure img { display: block; width: 100%; max-height: 300px; object-fit: cover; border-radius: 14px; }\n.demo-figure figcaption { margin-top: 6px; color: #707a88; font-size: 11px; }\n.demo-gallery { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 9px; }\n.demo-gallery figure { margin: 0; }\n.demo-gallery img { display: block; width: 100%; height: 130px; object-fit: cover; border-radius: 10px; }\n.demo-gallery figcaption { margin-top: 5px; color: #677180; font-size: 10px; }\n.demo-link-list { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin: 17px 0; }\n.demo-link-list b { flex-basis: 100%; font-size: 13px; }\n.demo-link-list a { padding: 8px 10px; border: 1px solid #e3e8ef; border-radius: 8px; color: var(--accent); font-size: 11px; font-weight: 700; text-decoration: none; }\n.demo-link-list a:hover,.demo-link-list a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }\n.demo-inline-book { display: inline-block; vertical-align: top; width: 30%; min-height: 270px; margin: 0 1.4% 12px 0; padding: 13px; border: 1px solid #e7eaf0; border-radius: 12px; background: linear-gradient(145deg,#fff,var(--soft)); }\n.demo-inline-book small { color: var(--accent); font-size: 10px; font-weight: 800; }\n.demo-inline-book b { display: block; margin: 22px 0 5px; font-size: 15px; }\n.demo-inline-book span { color: #677180; font-size: 11px; }\n.demo-book-cover { min-height: 100px; display: grid; place-items: end start; padding: 11px; border-radius: 6px; color: #fff; background: linear-gradient(145deg,var(--cover),#1d2f3e); box-shadow: 2px 3px 6px #20263525; font-size: 13px; font-weight: 700; }\n.demo-inline-book p { margin: 7px 0 0; color: #657181; font-size: 10px; }\n.demo-profile-list { display: flex; flex-wrap: wrap; gap: 12px; }\n.demo-profile { display: inline-block; vertical-align: top; width: calc(50% - 6px); overflow: hidden; border: 1px solid #e6eaf0; border-radius: 12px; background: #fff; }\n.demo-profile > img { display: block; width: 100%; height: 110px; object-fit: cover; }\n.demo-profile-copy { padding: 14px; }\n.demo-profile-copy small { color: var(--accent); font-size: 9px; font-weight: 800; }\n.demo-profile-copy h3 { margin: 6px 0 2px; font-size: 16px; }\n.demo-profile-copy > b { color: #5c6877; font-size: 11px; }\n.demo-profile-copy p { min-height: 38px; color: #647080; font-size: 11px; }\n.demo-profile-copy a { color: var(--accent); font-size: 11px; font-weight: 700; }\n.demo-flex-grid { display: flex; flex-wrap: wrap; align-items: stretch; gap: 13px; }\n.demo-flex-grid .demo-card { flex: 1 1 220px; }\n.demo-circle-row { display: flex; flex-wrap: wrap; gap: 18px; }\n.demo-circle { width: 150px; text-align: center; }\n.demo-circle-art { width: 112px; height: 112px; display: grid; place-items: center; margin: 0 auto 11px; border-radius: 50%; color: #fff; background: var(--bubble); box-shadow: inset -10px -12px 25px #0002; font-size: 13px; font-weight: 700; }\n.demo-circle b, .demo-circle span { display: block; }\n.demo-circle span { color: #697382; font-size: 11px; }\n.demo-stage { position: relative; min-height: 310px; overflow: hidden; border: 1px solid #e5e8ee; border-radius: 16px; background: repeating-linear-gradient(0deg,#fff,#fff 39px,#edf0f4 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#edf0f4 40px); }\n.scene-block { position: absolute; display: grid; place-items: center; border: 1px solid var(--accent); border-radius: 10px; color: var(--accent); background: var(--soft); font-size: 12px; font-weight: 700; }\n.scene-wide { inset: 11% 20% auto; height: 45px; }\n.scene-platform { left: 24%; right: 24%; bottom: 14%; height: 68px; color: #fff; background: var(--accent); }\n.scene-panel { left: 8%; top: 38%; width: 28%; height: 68px; }\n.scene-panel-alt { left: auto; right: 8%; }\n.scene-route { left: 45%; top: 34%; width: 10%; height: 40px; border-style: dashed; background: #fff; }\n.demo-poster { position: relative; overflow: hidden; min-height: 280px; padding: 30px; border-radius: 18px; color: #fff; background: linear-gradient(135deg,#1c354d,var(--accent)); }\n.demo-poster h2 { max-width: 530px; margin: 24px 0 8px; font-size: clamp(26px,4vw,40px); }\n.demo-poster p { color: #e5ebf4; }\n.demo-date { position: absolute; top: 18px; right: 18px; display: grid; place-items: center; width: 78px; height: 78px; border-radius: 50%; color: #27344a; background: #f5d887; font-size: 12px; font-weight: 800; text-align: center; }\n.demo-fixed-cta { position: fixed; right: 18px; bottom: 18px; z-index: 10; margin: 0; box-shadow: 0 8px 24px #12223855; }\n.demo-map { position: relative; min-height: 250px; overflow: hidden; border: 1px solid #d9e1e9; border-radius: 16px; background: linear-gradient(165deg,#edf3e8 0 44%,#c9e4ec 44% 58%,#eff1e5 58%); }\n.demo-map::before { position: absolute; left: 12%; top: 62%; width: 77%; border-top: 4px dashed #bd754b; transform: rotate(-16deg); content: \"\"; }\n.demo-map-marker { position: absolute; left: var(--x); top: var(--y); z-index: 2; display: grid; place-items: center; width: 32px; height: 32px; border: 3px solid #fff; border-radius: 50%; color: #fff; background: var(--accent); box-shadow: 0 3px 9px #1d304033; font-size: 10px; font-weight: 800; transform: translate(-50%,-50%); }\n.demo-stop-list { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 9px; margin-top: 12px; counter-reset: stop; }\n.demo-stop { position: relative; padding: 16px 13px; border: 1px solid #e6eaf0; border-radius: 12px; }\n.demo-stop b { display: block; color: var(--accent); font-size: 11px; }\n.demo-stop span { display: block; margin: 8px 0 3px; font-size: 13px; font-weight: 700; }\n.demo-stop small { color: #748090; }\n.demo-chess { position: relative; display: grid; grid-template-columns: repeat(8,1fr); width: min(100%,400px); aspect-ratio: 1; overflow: hidden; border: 5px solid #273345; border-radius: 6px; }\n.demo-square:nth-child(16n+1), .demo-square:nth-child(16n+3), .demo-square:nth-child(16n+5), .demo-square:nth-child(16n+7), .demo-square:nth-child(16n+10), .demo-square:nth-child(16n+12), .demo-square:nth-child(16n+14), .demo-square:nth-child(16n+16) { background: #dbe4d6; }\n.demo-square { background: #738a72; }\n.demo-piece { position: absolute; left: calc((var(--x) + .5) * 12.5%); top: calc((var(--y) + .5) * 12.5%); z-index: 2; width: 12.5%; height: 12.5%; transform: translate(-50%,-50%); color: #202635; font: 34px/1 Georgia,serif; text-align: center; text-shadow: 0 1px 2px #fff; }\n.demo-seat-grid { display: grid; grid-template-columns: repeat(6,minmax(22px,1fr)); gap: 7px; max-width: 500px; }\n.demo-seat { display: grid; place-items: center; aspect-ratio: 1.2; border: 1px solid #aab4c2; border-radius: 5px 5px 2px 2px; color: #596474; background: #edf0f4; font-size: 10px; }\n.demo-seat.is-taken { border-color: #4b806c; color: #fff; background: #4b806c; }\n.demo-legend { display: flex; flex-wrap: wrap; gap: 14px; margin: 14px 0; color: #5c6674; font-size: 11px; }\n.demo-legend span { display: inline-flex; align-items: center; gap: 6px; }\n.demo-legend i { width: 12px; height: 12px; border: 1px solid #aab4c2; border-radius: 3px; background: #edf0f4; }\n.demo-legend .taken { border-color: #4b806c; background: #4b806c; }\n.demo-kanban { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }\n.demo-column { padding: 13px; border-radius: 12px; background: #f3f5f8; }\n.demo-column h3 { margin: 0 0 10px; font-size: 13px; }\n.demo-task { margin-top: 8px; padding: 12px; border: 1px solid #e5e9ef; border-radius: 9px; background: #fff; font-size: 12px; }\n.demo-filter-label { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }\n.demo-filter-label span { padding: 6px 10px; border: 1px solid #e6eaf0; border-radius: 999px; color: #5d6877; font-size: 10px; }\n.demo-menu-list { display: flex; gap: 5px; padding: 0; margin: 0 0 24px; list-style: none; }\n.demo-menu-group { position: relative; }\n.demo-menu-group > a { display: flex; align-items: center; min-height: 44px; padding: 10px 12px; border-radius: 8px; color: #3c4858; font-size: 13px; text-decoration: none; }\n.demo-submenu { position: absolute; top: 100%; left: 0; z-index: 5; display: none; min-width: 205px; padding: 7px; border: 1px solid #e5e8ef; border-radius: 10px; background: #fff; box-shadow: 0 14px 34px #20263520; }\n.demo-submenu a { display: flex; align-items: center; min-height: 44px; padding: 9px; border-radius: 6px; font-size: 12px; text-decoration: none; }\n.demo-submenu a:hover, .demo-submenu a:focus-visible { color: var(--accent); background: var(--soft); }\n.demo-menu-group:hover .demo-submenu, .demo-menu-group:focus-within .demo-submenu { display: block; }\n.demo-hint { margin: 8px 0; padding: 12px; border: 1px solid #e5e8ef; border-radius: 9px; }\n.demo-hint summary { cursor: pointer; color: var(--accent); font-size: 13px; font-weight: 700; }\n.demo-hint p { margin: 9px 0 0; color: #5e6877; font-size: 12px; }\n.demo-product { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: center; padding: 22px; border: 1px solid #e6eaf0; border-radius: 16px; }\n.demo-product-art { min-height: 210px; display: grid; place-items: center; border-radius: 12px; color: var(--accent); background: linear-gradient(145deg,var(--soft),#fff); font-size: 56px; }\n.demo-product:hover { box-shadow: 0 15px 36px #20263518; transform: translateY(-2px); transition: transform .2s ease,box-shadow .2s ease; }\n.demo-product:focus-within { outline: 3px solid #d6deea; outline-offset: 3px; }\n.demo-facts { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin: 16px 0; }\n.demo-fact { padding: 12px; border-radius: 10px; background: var(--soft); }\n.demo-fact b, .demo-fact span { display: block; }\n.demo-fact span { margin-top: 4px; color: #626d7c; font-size: 11px; }\n.demo-form { display: grid; gap: 14px; max-width: 650px; padding: 21px; border: 1px solid #e4e8ef; border-radius: 14px; }\n.demo-form fieldset { display: grid; gap: 9px; margin: 0; padding: 13px; border: 1px solid #e4e8ef; border-radius: 10px; }\n.demo-form legend { padding: 0 5px; font-weight: 700; }\n.demo-field { display: grid; gap: 5px; color: #485465; font-size: 12px; font-weight: 700; }\n.demo-field input, .demo-field select, .demo-field textarea { width: 100%; min-height: 43px; padding: 10px; border: 1px solid #cfd6df; border-radius: 7px; color: var(--ink); background: #fff; font: inherit; font-weight: 400; }\n.demo-field textarea { min-height: 100px; resize: vertical; }\n.demo-form > input, .demo-form > select, .demo-form > textarea { width: 100%; min-height: 43px; padding: 10px; border: 1px solid #cfd6df; border-radius: 7px; color: var(--ink); background: #fff; font: inherit; }\n.demo-form input:focus-visible, .demo-form select:focus-visible, .demo-form textarea:focus-visible { outline: 3px solid #d6deea; outline-offset: 1px; }\n.demo-radio { display: flex; align-items: center; gap: 8px; font-size: 12px; }\n.help-search { display: flex; gap: 8px; margin: 18px 0; }\n.help-search__label--visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; clip-path: inset(50%); }\n.help-search__input { min-width: 0; flex: 1; padding: 10px; border: 1px solid #cfd6df; border-radius: 8px; }\n.help-search__button { min-height: 44px; padding: 9px 15px; border: 0; border-radius: 8px; color: #fff; background: var(--accent); font-weight: 700; }\n.help-topic-list { margin-top: 14px; }\n.help-topic { min-height: 150px; padding: 17px; border: 1px solid #e6eaf0; border-radius: 12px; }\n.help-topic__count { color: var(--accent); font-size: 10px; font-weight: 800; }\n.help-topic__title { margin: 9px 0 5px; }\n.help-topic__description { color: #647080; font-size: 12px; }\n.demo-event-link { display: block; color: inherit; text-decoration: none; transition: transform .18s ease,box-shadow .18s ease; }\n.demo-event-link:hover,.demo-event-link:focus-visible { transform: translateY(-3px); box-shadow: 0 12px 26px #20263516; outline: 2px solid #b7c4d7; outline-offset: 2px; }\n.demo-event-link span { color: var(--accent); font-size: 11px; font-weight: 700; }\n.demo-event-link::before { display: block; width: 38px; margin-bottom: 11px; border-top: 3px solid var(--accent); content: \"\"; transform-origin: left; transition: transform .2s ease; }\n.demo-event-link:hover::before,.demo-event-link:focus-visible::before { transform: scaleX(1.5); }\n.demo-news-index { display: grid; gap: 8px; }\n.demo-news-index a { padding: 12px 14px; border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; color: #33445d; background: var(--soft); font-size: 12px; font-weight: 700; text-decoration: none; }\n.demo-news-index a:hover,.demo-news-index a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }\n.demo-news-article { margin-top: 22px; padding: 18px; border: 1px solid #e6eaf0; border-radius: 12px; }\n.demo-news-article > small { color: var(--accent); font-weight: 800; }\n.demo-news-article h3 { margin: 7px 0; }\n.demo-news-article p { color: #5e6877; }\n.demo-news-card { margin: 10px 0; }\n.demo-optional-panel--hidden { display: none; }\n.demo--landing-hotel .demo-hero { color: #fff; background: linear-gradient(90deg,#152d42dc,#152d4270),url('../assets/mountains.svg') center/cover; }\n.demo--landing-hotel .demo-hero .demo-kicker,.demo--landing-hotel .demo-hero .demo-lead { color: #fff; }\n.demo--landing-hotel .demo-hero::after { border-color: #ffffff55; }\n.demo--landing-tour .demo-hero { background: linear-gradient(110deg,#18334dce,#18334d38),url('../assets/mountains.svg') center/cover; color: #fff; }\n.demo--landing-tour .demo-hero .demo-kicker,.demo--landing-tour .demo-hero .demo-lead { color: #fff; }\n.demo--landing-app .demo-app-image img { max-height: 230px; }\n.demo--bootstrap-anime .demo-header,.demo--bootstrap-events .demo-header { display: none; }\n.demo-status { display: inline-block; padding: 4px 7px; border-radius: 999px; font-size: 9px; font-weight: 800; }\n.demo-status--upcoming { color: #8c5612; background: #fff1d8; }\n.demo-status--confirmed { color: #28624b; background: #e4f4eb; }\n.demo-status--done { color: #586171; background: #eceff3; }\n.demo-skills { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }\n.demo-skills li { padding: 7px 10px; border-radius: 999px; color: var(--accent); background: var(--soft); font-size: 11px; font-weight: 700; }\n.demo-bootstrap-hero { padding: 32px; border-radius: 14px; color: white; background: #263958; }\n.demo-bootstrap-hero h2 { font-size: 29px; }\n.demo-bootstrap-card { height: 100%; padding: 18px; border: 1px solid #e1e5ea; border-radius: 10px; background: white; }\n@media (max-width: 700px) { .demo { padding: 0 16px 32px; } .demo-header { align-items: flex-start; flex-direction: column; justify-content: center; padding: 13px 0; } .demo-nav { gap: 11px; } .demo-grid,.demo-kanban { grid-template-columns: 1fr; } .demo-stop-list { grid-template-columns: repeat(2,minmax(0,1fr)); } .demo-inline-book { width: 47%; } .demo-product { grid-template-columns: 1fr; } .demo-circle { width: 125px; } .demo-circle-art { width: 96px; height: 96px; } .demo-fixed-cta { position: static !important; margin-top: 12px; } .demo-gallery { grid-template-columns: 1fr; } .demo-gallery img { height: 190px; } .demo-footer-columns { grid-template-columns: 1fr; } }\n@media (max-width: 430px) { .demo h1 { font-size: 30px; } .demo-seat-grid { gap: 4px; } .demo-seat { font-size: 8px; } .demo-stop-list { grid-template-columns: 1fr 1fr; } .demo-menu-list { flex-wrap: wrap; } .demo-profile { width: 100%; } .demo-inline-book { width: 100%; } }\n@media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } .demo-product:hover { transform: none; } }\n.demo { --accent: #8a4f31; --soft: #eaf0f7; }\n.demo-recipe-grid { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); align-items: start; } .demo-recipe-grid h2 { margin-top: 0; } .demo-recipe-grid .demo-list { gap: 4px; }"
      }
    },
    {
      "title": "Профиль школьного кружка",
      "about": "Кружку нужен небольшой сайт-визитка, чтобы новички узнали расписание и что взять на первое занятие.",
      "steps": [
        "Сделай шапку, название, описание и разделы «Когда встречаемся» и «Что принести».",
        "Добавь ссылку для связи и список необходимых вещей.",
        "Примени первые правила CSS для фона, текста и промежутков."
      ],
      "done": [
        "У страницы есть корректный HTML-каркас и понятный title.",
        "Ссылка ведёт на настоящий адрес.",
        "Содержание разбито на заголовки, абзацы и списки."
      ],
      "stretch": "Добавь изображение с осмысленным alt и карточку ближайшей встречи.",
      "example": {
        "title": "Профиль школьного кружка",
        "description": "Образец готовой страницы для проекта «Профиль школьного кружка». Собираем простые механизмы, учимся работать в команде и постепенно знакомимся с кодом.",
        "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Кружок робототехники</title>\n  <link rel=\"stylesheet\" href=\"./style.css\">\n  \n</head>\n<body>\n  <div class=\"demo demo--club\" id=\"top\" style=\"--accent:#8a4f31;--soft:#eaf0f7\">\n    <header class=\"demo-header\"><a class=\"demo-brand\" href=\"#top\">ПРИМЕР ПРОЕКТА</a><nav class=\"demo-nav\" aria-label=\"Навигация по странице\"><a href=\"#top\">О проекте</a><a href=\"#details\">Подробности</a></nav></header>\n    <main>\n      <section class=\"demo-hero\" aria-labelledby=\"project-title\"><span class=\"demo-kicker\">ШКОЛА · 5–8 КЛАССЫ</span><h1 id=\"project-title\">Кружок робототехники</h1><p class=\"demo-lead\">Собираем простые механизмы, учимся работать в команде и постепенно знакомимся с кодом.</p></section>\n      <section class=\"demo-section\" id=\"details\"><h2>Что важно знать</h2><div class=\"demo-grid\"><article class=\"demo-card\"><small>РАСПИСАНИЕ</small><h3>Когда встречаемся</h3><p>По средам, 16:00–17:30 · кабинет 24</p></article><article class=\"demo-card\"><small>ПЕРВОЕ ЗАНЯТИЕ</small><h3>Что взять</h3><p>Тетрадь, карандаш и хорошее настроение. Наборы выдадим на месте.</p></article><article class=\"demo-card\"><small>ЭТА СРЕДА</small><h3>Ближайшая встреча</h3><p>Соберём машину, которая едет по линии.</p></article></div><section class=\"demo-section\"><h2>Что нужно знать</h2><ul class=\"demo-list\"><li>Опыт не нужен</li><li>Можно прийти на пробное занятие</li><li>Запись: club@example.edu</li></ul><a class=\"demo-cta\" href=\"mailto:club@example.edu\">Написать руководителю</a></section></section>\n    </main>\n    <footer class=\"demo-footer\">Учебный пример HTML и CSS · макет для обсуждения на занятии</footer>\n  </div>\n</body>\n</html>",
        "css": ":root { color-scheme: light; }\n* { box-sizing: border-box; }\nbody { margin: 0; color: #202635; background: #f4f6f8; font: 15px/1.55 Arial, sans-serif; }\na { color: inherit; }\n.demo { --accent: #365c8d; --soft: #eaf0f7; --ink: #202635; max-width: 1100px; min-height: 100vh; margin: 0 auto; padding: 0 26px 46px; background: #fff; }\n.demo-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 66px; border-bottom: 1px solid #e8ebef; }\n.demo-brand { color: var(--accent); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-decoration: none; text-transform: uppercase; }\n.demo-nav { display: flex; flex-wrap: wrap; gap: 16px; color: #626b79; font-size: 12px; }\n.demo-nav a { display: flex; align-items: center; min-height: 44px; text-decoration: none; }\n.demo-nav a:hover, .demo-nav a:focus-visible { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }\n.demo-hero { position: relative; overflow: hidden; margin: 22px 0; padding: clamp(24px,5vw,56px); border-radius: 20px; background: linear-gradient(120deg,var(--soft),#fff 72%); }\n.demo-hero::after { position: absolute; right: -54px; bottom: -120px; width: 280px; height: 280px; border: 1px solid #d8e0eb; border-radius: 50%; content: ''; }\n.demo-kicker { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .14em; }\n.demo h1 { max-width: 760px; margin: 11px 0 10px; font-size: clamp(30px,5vw,48px); line-height: 1.08; letter-spacing: -.045em; }\n.demo-lead { max-width: 670px; margin: 0; color: #5e6877; font-size: 16px; }\n.demo-section { margin: 30px 0; }\n.demo-section h2 { margin: 0 0 13px; font-size: 21px; letter-spacing: -.025em; }\n.demo-section > p { max-width: 720px; color: #5e6877; }\n.demo-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 13px; }\n.demo-card { min-width: 0; padding: 19px; border: 1px solid #e7eaf0; border-radius: 14px; background: #fff; }\n.demo-card small { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }\n.demo-card h3 { margin: 9px 0 6px; font-size: 17px; }\n.demo-card p { margin: 0; color: #647080; font-size: 13px; }\n.demo-note { margin: 18px 0; padding: 14px 16px; border-left: 3px solid var(--accent); border-radius: 0 10px 10px 0; background: var(--soft); color: #424d5d; font-size: 13px; }\n.demo-list { display: grid; gap: 8px; margin: 0; padding-left: 21px; color: #465264; }\n.demo-cta { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; margin-top: 12px; padding: 10px 16px; border-radius: 9px; color: #fff; background: var(--accent); font-size: 13px; font-weight: 700; text-decoration: none; transition: filter .16s ease,transform .16s ease; }\n.demo-cta:hover, .demo-cta:focus-visible { filter: brightness(.9); outline: 3px solid #d6deea; outline-offset: 2px; }\n.demo-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8ebef; color: #77808e; font-size: 11px; }\n.demo-footer-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }\n.demo-footer-columns h2 { margin: 0 0 6px; color: #344050; font-size: 12px; }\n.demo-footer-columns p { margin: 0; }\n.demo-footer-columns a { color: var(--accent); }\n.demo-table-wrap { overflow-x: auto; border: 1px solid #e3e7ed; border-radius: 12px; }\n.demo-table { width: 100%; border-collapse: collapse; text-align: left; }\n.demo-table caption { padding: 13px; color: #5b6574; font-size: 12px; text-align: left; }\n.demo-table th, .demo-table td { padding: 12px 14px; border-top: 1px solid #e8ebef; }\n.demo-table thead th { color: var(--accent); background: var(--soft); font-size: 11px; }\n.demo-table tbody th { font-size: 12px; }\n.demo-table tbody td { color: #596473; font-size: 12px; }\n.demo-figure { margin: 0; }\n.demo-figure img { display: block; width: 100%; max-height: 300px; object-fit: cover; border-radius: 14px; }\n.demo-figure figcaption { margin-top: 6px; color: #707a88; font-size: 11px; }\n.demo-gallery { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 9px; }\n.demo-gallery figure { margin: 0; }\n.demo-gallery img { display: block; width: 100%; height: 130px; object-fit: cover; border-radius: 10px; }\n.demo-gallery figcaption { margin-top: 5px; color: #677180; font-size: 10px; }\n.demo-link-list { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin: 17px 0; }\n.demo-link-list b { flex-basis: 100%; font-size: 13px; }\n.demo-link-list a { padding: 8px 10px; border: 1px solid #e3e8ef; border-radius: 8px; color: var(--accent); font-size: 11px; font-weight: 700; text-decoration: none; }\n.demo-link-list a:hover,.demo-link-list a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }\n.demo-inline-book { display: inline-block; vertical-align: top; width: 30%; min-height: 270px; margin: 0 1.4% 12px 0; padding: 13px; border: 1px solid #e7eaf0; border-radius: 12px; background: linear-gradient(145deg,#fff,var(--soft)); }\n.demo-inline-book small { color: var(--accent); font-size: 10px; font-weight: 800; }\n.demo-inline-book b { display: block; margin: 22px 0 5px; font-size: 15px; }\n.demo-inline-book span { color: #677180; font-size: 11px; }\n.demo-book-cover { min-height: 100px; display: grid; place-items: end start; padding: 11px; border-radius: 6px; color: #fff; background: linear-gradient(145deg,var(--cover),#1d2f3e); box-shadow: 2px 3px 6px #20263525; font-size: 13px; font-weight: 700; }\n.demo-inline-book p { margin: 7px 0 0; color: #657181; font-size: 10px; }\n.demo-profile-list { display: flex; flex-wrap: wrap; gap: 12px; }\n.demo-profile { display: inline-block; vertical-align: top; width: calc(50% - 6px); overflow: hidden; border: 1px solid #e6eaf0; border-radius: 12px; background: #fff; }\n.demo-profile > img { display: block; width: 100%; height: 110px; object-fit: cover; }\n.demo-profile-copy { padding: 14px; }\n.demo-profile-copy small { color: var(--accent); font-size: 9px; font-weight: 800; }\n.demo-profile-copy h3 { margin: 6px 0 2px; font-size: 16px; }\n.demo-profile-copy > b { color: #5c6877; font-size: 11px; }\n.demo-profile-copy p { min-height: 38px; color: #647080; font-size: 11px; }\n.demo-profile-copy a { color: var(--accent); font-size: 11px; font-weight: 700; }\n.demo-flex-grid { display: flex; flex-wrap: wrap; align-items: stretch; gap: 13px; }\n.demo-flex-grid .demo-card { flex: 1 1 220px; }\n.demo-circle-row { display: flex; flex-wrap: wrap; gap: 18px; }\n.demo-circle { width: 150px; text-align: center; }\n.demo-circle-art { width: 112px; height: 112px; display: grid; place-items: center; margin: 0 auto 11px; border-radius: 50%; color: #fff; background: var(--bubble); box-shadow: inset -10px -12px 25px #0002; font-size: 13px; font-weight: 700; }\n.demo-circle b, .demo-circle span { display: block; }\n.demo-circle span { color: #697382; font-size: 11px; }\n.demo-stage { position: relative; min-height: 310px; overflow: hidden; border: 1px solid #e5e8ee; border-radius: 16px; background: repeating-linear-gradient(0deg,#fff,#fff 39px,#edf0f4 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#edf0f4 40px); }\n.scene-block { position: absolute; display: grid; place-items: center; border: 1px solid var(--accent); border-radius: 10px; color: var(--accent); background: var(--soft); font-size: 12px; font-weight: 700; }\n.scene-wide { inset: 11% 20% auto; height: 45px; }\n.scene-platform { left: 24%; right: 24%; bottom: 14%; height: 68px; color: #fff; background: var(--accent); }\n.scene-panel { left: 8%; top: 38%; width: 28%; height: 68px; }\n.scene-panel-alt { left: auto; right: 8%; }\n.scene-route { left: 45%; top: 34%; width: 10%; height: 40px; border-style: dashed; background: #fff; }\n.demo-poster { position: relative; overflow: hidden; min-height: 280px; padding: 30px; border-radius: 18px; color: #fff; background: linear-gradient(135deg,#1c354d,var(--accent)); }\n.demo-poster h2 { max-width: 530px; margin: 24px 0 8px; font-size: clamp(26px,4vw,40px); }\n.demo-poster p { color: #e5ebf4; }\n.demo-date { position: absolute; top: 18px; right: 18px; display: grid; place-items: center; width: 78px; height: 78px; border-radius: 50%; color: #27344a; background: #f5d887; font-size: 12px; font-weight: 800; text-align: center; }\n.demo-fixed-cta { position: fixed; right: 18px; bottom: 18px; z-index: 10; margin: 0; box-shadow: 0 8px 24px #12223855; }\n.demo-map { position: relative; min-height: 250px; overflow: hidden; border: 1px solid #d9e1e9; border-radius: 16px; background: linear-gradient(165deg,#edf3e8 0 44%,#c9e4ec 44% 58%,#eff1e5 58%); }\n.demo-map::before { position: absolute; left: 12%; top: 62%; width: 77%; border-top: 4px dashed #bd754b; transform: rotate(-16deg); content: \"\"; }\n.demo-map-marker { position: absolute; left: var(--x); top: var(--y); z-index: 2; display: grid; place-items: center; width: 32px; height: 32px; border: 3px solid #fff; border-radius: 50%; color: #fff; background: var(--accent); box-shadow: 0 3px 9px #1d304033; font-size: 10px; font-weight: 800; transform: translate(-50%,-50%); }\n.demo-stop-list { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 9px; margin-top: 12px; counter-reset: stop; }\n.demo-stop { position: relative; padding: 16px 13px; border: 1px solid #e6eaf0; border-radius: 12px; }\n.demo-stop b { display: block; color: var(--accent); font-size: 11px; }\n.demo-stop span { display: block; margin: 8px 0 3px; font-size: 13px; font-weight: 700; }\n.demo-stop small { color: #748090; }\n.demo-chess { position: relative; display: grid; grid-template-columns: repeat(8,1fr); width: min(100%,400px); aspect-ratio: 1; overflow: hidden; border: 5px solid #273345; border-radius: 6px; }\n.demo-square:nth-child(16n+1), .demo-square:nth-child(16n+3), .demo-square:nth-child(16n+5), .demo-square:nth-child(16n+7), .demo-square:nth-child(16n+10), .demo-square:nth-child(16n+12), .demo-square:nth-child(16n+14), .demo-square:nth-child(16n+16) { background: #dbe4d6; }\n.demo-square { background: #738a72; }\n.demo-piece { position: absolute; left: calc((var(--x) + .5) * 12.5%); top: calc((var(--y) + .5) * 12.5%); z-index: 2; width: 12.5%; height: 12.5%; transform: translate(-50%,-50%); color: #202635; font: 34px/1 Georgia,serif; text-align: center; text-shadow: 0 1px 2px #fff; }\n.demo-seat-grid { display: grid; grid-template-columns: repeat(6,minmax(22px,1fr)); gap: 7px; max-width: 500px; }\n.demo-seat { display: grid; place-items: center; aspect-ratio: 1.2; border: 1px solid #aab4c2; border-radius: 5px 5px 2px 2px; color: #596474; background: #edf0f4; font-size: 10px; }\n.demo-seat.is-taken { border-color: #4b806c; color: #fff; background: #4b806c; }\n.demo-legend { display: flex; flex-wrap: wrap; gap: 14px; margin: 14px 0; color: #5c6674; font-size: 11px; }\n.demo-legend span { display: inline-flex; align-items: center; gap: 6px; }\n.demo-legend i { width: 12px; height: 12px; border: 1px solid #aab4c2; border-radius: 3px; background: #edf0f4; }\n.demo-legend .taken { border-color: #4b806c; background: #4b806c; }\n.demo-kanban { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }\n.demo-column { padding: 13px; border-radius: 12px; background: #f3f5f8; }\n.demo-column h3 { margin: 0 0 10px; font-size: 13px; }\n.demo-task { margin-top: 8px; padding: 12px; border: 1px solid #e5e9ef; border-radius: 9px; background: #fff; font-size: 12px; }\n.demo-filter-label { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }\n.demo-filter-label span { padding: 6px 10px; border: 1px solid #e6eaf0; border-radius: 999px; color: #5d6877; font-size: 10px; }\n.demo-menu-list { display: flex; gap: 5px; padding: 0; margin: 0 0 24px; list-style: none; }\n.demo-menu-group { position: relative; }\n.demo-menu-group > a { display: flex; align-items: center; min-height: 44px; padding: 10px 12px; border-radius: 8px; color: #3c4858; font-size: 13px; text-decoration: none; }\n.demo-submenu { position: absolute; top: 100%; left: 0; z-index: 5; display: none; min-width: 205px; padding: 7px; border: 1px solid #e5e8ef; border-radius: 10px; background: #fff; box-shadow: 0 14px 34px #20263520; }\n.demo-submenu a { display: flex; align-items: center; min-height: 44px; padding: 9px; border-radius: 6px; font-size: 12px; text-decoration: none; }\n.demo-submenu a:hover, .demo-submenu a:focus-visible { color: var(--accent); background: var(--soft); }\n.demo-menu-group:hover .demo-submenu, .demo-menu-group:focus-within .demo-submenu { display: block; }\n.demo-hint { margin: 8px 0; padding: 12px; border: 1px solid #e5e8ef; border-radius: 9px; }\n.demo-hint summary { cursor: pointer; color: var(--accent); font-size: 13px; font-weight: 700; }\n.demo-hint p { margin: 9px 0 0; color: #5e6877; font-size: 12px; }\n.demo-product { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: center; padding: 22px; border: 1px solid #e6eaf0; border-radius: 16px; }\n.demo-product-art { min-height: 210px; display: grid; place-items: center; border-radius: 12px; color: var(--accent); background: linear-gradient(145deg,var(--soft),#fff); font-size: 56px; }\n.demo-product:hover { box-shadow: 0 15px 36px #20263518; transform: translateY(-2px); transition: transform .2s ease,box-shadow .2s ease; }\n.demo-product:focus-within { outline: 3px solid #d6deea; outline-offset: 3px; }\n.demo-facts { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin: 16px 0; }\n.demo-fact { padding: 12px; border-radius: 10px; background: var(--soft); }\n.demo-fact b, .demo-fact span { display: block; }\n.demo-fact span { margin-top: 4px; color: #626d7c; font-size: 11px; }\n.demo-form { display: grid; gap: 14px; max-width: 650px; padding: 21px; border: 1px solid #e4e8ef; border-radius: 14px; }\n.demo-form fieldset { display: grid; gap: 9px; margin: 0; padding: 13px; border: 1px solid #e4e8ef; border-radius: 10px; }\n.demo-form legend { padding: 0 5px; font-weight: 700; }\n.demo-field { display: grid; gap: 5px; color: #485465; font-size: 12px; font-weight: 700; }\n.demo-field input, .demo-field select, .demo-field textarea { width: 100%; min-height: 43px; padding: 10px; border: 1px solid #cfd6df; border-radius: 7px; color: var(--ink); background: #fff; font: inherit; font-weight: 400; }\n.demo-field textarea { min-height: 100px; resize: vertical; }\n.demo-form > input, .demo-form > select, .demo-form > textarea { width: 100%; min-height: 43px; padding: 10px; border: 1px solid #cfd6df; border-radius: 7px; color: var(--ink); background: #fff; font: inherit; }\n.demo-form input:focus-visible, .demo-form select:focus-visible, .demo-form textarea:focus-visible { outline: 3px solid #d6deea; outline-offset: 1px; }\n.demo-radio { display: flex; align-items: center; gap: 8px; font-size: 12px; }\n.help-search { display: flex; gap: 8px; margin: 18px 0; }\n.help-search__label--visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; clip-path: inset(50%); }\n.help-search__input { min-width: 0; flex: 1; padding: 10px; border: 1px solid #cfd6df; border-radius: 8px; }\n.help-search__button { min-height: 44px; padding: 9px 15px; border: 0; border-radius: 8px; color: #fff; background: var(--accent); font-weight: 700; }\n.help-topic-list { margin-top: 14px; }\n.help-topic { min-height: 150px; padding: 17px; border: 1px solid #e6eaf0; border-radius: 12px; }\n.help-topic__count { color: var(--accent); font-size: 10px; font-weight: 800; }\n.help-topic__title { margin: 9px 0 5px; }\n.help-topic__description { color: #647080; font-size: 12px; }\n.demo-event-link { display: block; color: inherit; text-decoration: none; transition: transform .18s ease,box-shadow .18s ease; }\n.demo-event-link:hover,.demo-event-link:focus-visible { transform: translateY(-3px); box-shadow: 0 12px 26px #20263516; outline: 2px solid #b7c4d7; outline-offset: 2px; }\n.demo-event-link span { color: var(--accent); font-size: 11px; font-weight: 700; }\n.demo-event-link::before { display: block; width: 38px; margin-bottom: 11px; border-top: 3px solid var(--accent); content: \"\"; transform-origin: left; transition: transform .2s ease; }\n.demo-event-link:hover::before,.demo-event-link:focus-visible::before { transform: scaleX(1.5); }\n.demo-news-index { display: grid; gap: 8px; }\n.demo-news-index a { padding: 12px 14px; border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; color: #33445d; background: var(--soft); font-size: 12px; font-weight: 700; text-decoration: none; }\n.demo-news-index a:hover,.demo-news-index a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }\n.demo-news-article { margin-top: 22px; padding: 18px; border: 1px solid #e6eaf0; border-radius: 12px; }\n.demo-news-article > small { color: var(--accent); font-weight: 800; }\n.demo-news-article h3 { margin: 7px 0; }\n.demo-news-article p { color: #5e6877; }\n.demo-news-card { margin: 10px 0; }\n.demo-optional-panel--hidden { display: none; }\n.demo--landing-hotel .demo-hero { color: #fff; background: linear-gradient(90deg,#152d42dc,#152d4270),url('../assets/mountains.svg') center/cover; }\n.demo--landing-hotel .demo-hero .demo-kicker,.demo--landing-hotel .demo-hero .demo-lead { color: #fff; }\n.demo--landing-hotel .demo-hero::after { border-color: #ffffff55; }\n.demo--landing-tour .demo-hero { background: linear-gradient(110deg,#18334dce,#18334d38),url('../assets/mountains.svg') center/cover; color: #fff; }\n.demo--landing-tour .demo-hero .demo-kicker,.demo--landing-tour .demo-hero .demo-lead { color: #fff; }\n.demo--landing-app .demo-app-image img { max-height: 230px; }\n.demo--bootstrap-anime .demo-header,.demo--bootstrap-events .demo-header { display: none; }\n.demo-status { display: inline-block; padding: 4px 7px; border-radius: 999px; font-size: 9px; font-weight: 800; }\n.demo-status--upcoming { color: #8c5612; background: #fff1d8; }\n.demo-status--confirmed { color: #28624b; background: #e4f4eb; }\n.demo-status--done { color: #586171; background: #eceff3; }\n.demo-skills { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }\n.demo-skills li { padding: 7px 10px; border-radius: 999px; color: var(--accent); background: var(--soft); font-size: 11px; font-weight: 700; }\n.demo-bootstrap-hero { padding: 32px; border-radius: 14px; color: white; background: #263958; }\n.demo-bootstrap-hero h2 { font-size: 29px; }\n.demo-bootstrap-card { height: 100%; padding: 18px; border: 1px solid #e1e5ea; border-radius: 10px; background: white; }\n@media (max-width: 700px) { .demo { padding: 0 16px 32px; } .demo-header { align-items: flex-start; flex-direction: column; justify-content: center; padding: 13px 0; } .demo-nav { gap: 11px; } .demo-grid,.demo-kanban { grid-template-columns: 1fr; } .demo-stop-list { grid-template-columns: repeat(2,minmax(0,1fr)); } .demo-inline-book { width: 47%; } .demo-product { grid-template-columns: 1fr; } .demo-circle { width: 125px; } .demo-circle-art { width: 96px; height: 96px; } .demo-fixed-cta { position: static !important; margin-top: 12px; } .demo-gallery { grid-template-columns: 1fr; } .demo-gallery img { height: 190px; } .demo-footer-columns { grid-template-columns: 1fr; } }\n@media (max-width: 430px) { .demo h1 { font-size: 30px; } .demo-seat-grid { gap: 4px; } .demo-seat { font-size: 8px; } .demo-stop-list { grid-template-columns: 1fr 1fr; } .demo-menu-list { flex-wrap: wrap; } .demo-profile { width: 100%; } .demo-inline-book { width: 100%; } }\n@media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } .demo-product:hover { transform: none; } }\n.demo { --accent: #8a4f31; --soft: #eaf0f7; }\n.demo-card:nth-child(2) { background: var(--soft); }"
      }
    }
  ],
  "title": "HTML с нуля: каркас, текст и ссылки",
  "goal": "Создай понятную страницу с правильным каркасом, текстом, ссылками, изображениями и списками."
};
