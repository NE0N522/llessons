window.LESSONS = window.LESSONS || {};
window.LESSONS[23] = {
  "id": 23,
  "learn": [
    "Настроишь направление и выравнивание элементов с Flexbox.",
    "Добавишь промежутки, перенос и гибкий размер карточек.",
    "Узнаешь, как CSS Grid задаёт колонки с помощью fr и minmax()."
  ],
  "teacher": {
    "plan": [
      {
        "title": "Старт и цель: Ось и направление: включаем Flexbox",
        "minutes": 10,
        "steps": [
          1
        ]
      },
      {
        "title": "Разбор шагов 1–5: Ось и направление: включаем Flexbox · Распределяем и выравниваем элементы · Добавляем промежутки и перенос · Управляем размером: basis, grow и shrink · Собираем карточки с одинаковой высотой",
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
        "title": "Разбор шагов 6–9: Строим панель действий и сохраняем порядок чтения · Выбираем Flexbox или Grid · Столбцы и fr · repeat и minmax",
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
        "q": "Какое правило нужно вспомнить для шага «Ось и направление: включаем Flexbox»?",
        "a": "Сначала назови направление главной оси. Это подскажет, в какую сторону будут работать свойства выравнивания."
      },
      {
        "q": "Какое правило нужно вспомнить для шага «Добавляем промежутки и перенос»?",
        "a": "gap — промежуток внутри группы; padding — место внутри элемента; margin — место снаружи."
      },
      {
        "q": "Какое правило нужно вспомнить для шага «Строим панель действий и сохраняем порядок чтения»?",
        "a": "Пиши HTML в том порядке, в котором человек должен прочитать и пройти интерфейс. Визуальный порядок должен это поддерживать."
      },
      {
        "q": "Какое правило нужно вспомнить для шага «repeat и minmax»?",
        "a": "Repeat сокращает запись дорожек, minmax ограничивает допустимую ширину каждой колонки."
      }
    ],
    "tips": [
      "Начни с вопроса о теме «Ось и направление: включаем Flexbox»: пусть ученик назовёт роль элемента или свойства своими словами, затем покажи пример.",
      "После шага «Собираем карточки с одинаковой высотой» предложи закрыть код и восстановить небольшой фрагмент по памяти, объясняя каждую строку.",
      "Заверши занятиe практикой «Собери каталог маршрутов»: сначала попроси спланировать структуру, затем сравните результат с образцом."
    ],
    "answers": "<p><strong>Образец для разбора:</strong> сравни с практикой урока. Ученик объясняет, какие части относятся к HTML, какие правила задают внешний вид и где элементы связываются между собой.</p><h4>Фрагмент HTML</h4><pre><code>&lt;main class=\"board\"&gt;\n  &lt;header class=\"board__header\"&gt;\n    &lt;div&gt;&lt;p class=\"eyebrow\"&gt;ПЛАН НА СЕГОДНЯ&lt;/p&gt;&lt;h1&gt;День проекта&lt;/h1&gt;&lt;/div&gt;\n    &lt;a class=\"button\" href=\"#tasks\"&gt;Открыть задачи&lt;/a&gt;\n  &lt;/header&gt;\n  &lt;section class=\"stats\" aria-label=\"Сводка проекта\"&gt;\n    &lt;article class=\"stat\"&gt;&lt;span&gt;Команда&lt;/span&gt;&lt;strong&gt;8 человек&lt;/strong&gt;&lt;/article&gt;\n    &lt;article class=\"stat\"&gt;&lt;span&gt;Готово&lt;/span&gt;&lt;strong&gt;6 задач&lt;/strong&gt;&lt;/article&gt;\n    &lt;article class=\"stat\"&gt;&lt;span&gt;До показа&lt;/span&gt;&lt;strong&gt;3 дня&lt;/strong&gt;&lt;/article&gt;\n  &lt;/section&gt;\n  &lt;section class=\"tasks\" id=\"tasks\" aria-label=\"Задачи команды\"&gt;\n    &lt;article class=\"task\"&gt;&lt;div&gt;&lt;h2&gt;Проверить макет&lt;/h2&gt;&lt;p&gt;Дизайн · сегодня&lt;/p&gt;&lt;/div&gt;&lt;span class=\"badge\"&gt;В работе&lt;/span&gt;&lt;/article&gt;\n    &lt;article class=\"task\"&gt;&lt;div&gt;&lt;h2&gt;Подготовить тексты&lt;/h2&gt;&lt;p&gt;Редактура · завтра&lt;/p&gt;&lt;/div&gt;&lt;span class=\"badge badge--done\"&gt;Готово&lt;/span&gt;&lt;/article&gt;\n  &lt;/section&gt;\n&lt;/main&gt;</code></pre><h4>Фрагмент CSS</h4><pre><code>* { box-sizing: border-box; }\nbody { margin: 0; color: #222a3b; background: #f4f6fa; font: 16px/1.5 Arial, sans-serif; }\n.board { max-width: 900px; margin: 0 auto; padding: 28px; }\n.board__header, .task { display: flex; align-items: center; justify-content: space-between; gap: 16px; }\n.eyebrow { color: #5869a9; font-size: 11px; font-weight: 800; letter-spacing: .1em; }\n.board h1 { margin: 4px 0 0; font-size: clamp(28px, 5vw, 42px); }\n.button { padding: 11px 15px; border-radius: 10px; color: white; background: #4558a8; text-decoration: none; font-weight: 700; }\n.stats, .tasks { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }\n.stat, .task { flex: 1 1 220px; min-width: 0; padding: 18px; border: 1px solid #dfe4ef; border-radius: 16px; background: white; }\n.stat { display: flex; flex-direction: column; gap: 5px; }\n.stat span, .task p { color: #5c6372; }\n.task &gt; div { min-width: 0; }\n.task h2 { margin: 0; font-size: 17px; }\n.task p { margin: 5px 0 0; }\n.badge { flex: 0 0 auto; padding: 6px 9px; border-radius: 99px; color: #394a91; background: #edf0ff; font-size: 12px; }\n.badge--done { color: #276346; background: #e6f6ed; }\n@media (max-width: 520px) { .board { padding: 20px; } .board__header { align-items: flex-start; flex-direction: column; } .task { align-items: flex-start; flex-direction: column; } }</code></pre>"
  },
  "steps": [
    {
      "id": "axes",
      "title": "Ось и направление: включаем Flexbox",
      "text": "<p><strong>Flexbox</strong> — способ расположить прямых детей контейнера вдоль одной оси. Включи его правилом <code>display: flex</code>; по умолчанию элементы стоят в строке — <code>row</code>.</p><p><strong>Главная ось</strong> идёт вдоль детей, <strong>поперечная</strong> пересекает её. В колонке <code>flex-direction: column</code> главная ось вертикальная, поэтому меняется и направление выравнивания. Сначала определи оси, потом выбирай свойства.</p>",
      "try": {
        "title": "1. Главная ось по строке",
        "html": "<div class=\"toolbar\"><strong>Парк рядом</strong><nav><a>Маршруты</a><a>О нас</a></nav><button>Войти</button></div>",
        "css": ".toolbar { display: flex; align-items: center; gap: 1rem; padding: .8rem; background: #f1f4fa; }\n.toolbar nav { display: flex; gap: .8rem; margin-left: auto; }",
        "height": 275
      },
      "remember": "Сначала назови направление главной оси. Это подскажет, в какую сторону будут работать свойства выравнивания.",
      "mistake": {
        "bad": "flex-direction: column-reverse;",
        "good": "flex-direction: column;",
        "why": "reverse переворачивает визуальный порядок. Не используй его для починки неправильного порядка в HTML."
      },
      "examples": [
        {
          "title": "1. Главная ось по строке",
          "html": "<div class=\"toolbar\"><strong>Парк рядом</strong><nav><a>Маршруты</a><a>О нас</a></nav><button>Войти</button></div>",
          "css": ".toolbar { display: flex; align-items: center; gap: 1rem; padding: .8rem; background: #f1f4fa; }\n.toolbar nav { display: flex; gap: .8rem; margin-left: auto; }",
          "height": 275
        },
        {
          "title": "2. Поворот главной оси",
          "html": "<div class=\"steps\"><b>01 · Найти маршрут</b><b>02 · Проверить погоду</b><b>03 · Взять воду</b></div>",
          "css": ".steps { display: flex; flex-direction: column; gap: .6rem; max-width: 20rem; }\n.steps b { padding: .8rem; border-radius: 8px; background: #e9f1e9; }",
          "height": 275
        }
      ]
    },
    {
      "id": "alignment",
      "title": "Распределяем и выравниваем элементы",
      "text": "<p><code>justify-content</code> распределяет свободное место вдоль <strong>главной оси</strong>. Например, <code>space-between</code> прижимает первый и последний элементы к краям, а <code>center</code> собирает группу посередине. Если места нет, свойство не может создать его из воздуха.</p><p><code>align-items</code> выравнивает детей поперёк главной оси. Для строки это обычно вертикаль: можно совместить текст и кнопку по центру. <code>align-self</code> позволяет одному ребёнку изменить общее выравнивание. Начинай с <code>center</code> или <code>stretch</code>; варианты вроде <code>baseline</code> нужны, когда важна общая линия текста.</p><p>Привычка проверять оси экономит время: не запоминай, что <code>justify</code> — «по горизонтали». Это не всегда так. В колонке главная ось вертикальна, и <code>justify-content</code> распределит пространство сверху вниз.</p>",
      "try": {
        "title": "1. Разнести группы по краям",
        "html": "<header class=\"bar\"><a>Городские прогулки</a><nav><a>Карта</a><a>Календарь</a></nav></header>",
        "css": ".bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; border: 1px solid #dce3e8; }\nnav { display: flex; gap: 1rem; }",
        "height": 275
      },
      "remember": "В паре «justify / align» сначала найди главную ось: первое работает вдоль неё, второе — поперёк.",
      "mistake": {
        "bad": "align-items: center; /* сдвигает меню вправо */",
        "good": "justify-content: center; /* центрирует по главной оси */",
        "why": "В строке поперечная ось вертикальная, поэтому align-items не двигает содержимое вправо."
      },
      "examples": [
        {
          "title": "1. Разнести группы по краям",
          "html": "<header class=\"bar\"><a>Городские прогулки</a><nav><a>Карта</a><a>Календарь</a></nav></header>",
          "css": ".bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; border: 1px solid #dce3e8; }\nnav { display: flex; gap: 1rem; }",
          "height": 275
        },
        {
          "title": "2. Выровнять внутри панели",
          "html": "<div class=\"event\"><span>СРЕДА</span><strong>Встреча клуба</strong><button>Открыть</button></div>",
          "css": ".event { display: flex; align-items: center; gap: 1rem; padding: .9rem; background: #f3f4fa; }\n.event strong { margin-right: auto; }",
          "height": 275
        }
      ]
    },
    {
      "id": "spacing-wrap",
      "title": "Добавляем промежутки и перенос",
      "text": "<p>Свойство <code>gap</code> задаёт расстояние между соседними элементами, не добавляя края вокруг всей группы. Это проще поддерживать, чем назначать каждому пункту отступ и убирать его у последнего. Для разных осей можно указать два значения: сначала между строками, потом между колонками.</p><p>По умолчанию дети строки стараются уместиться в одну линию. С <code>flex-wrap: wrap</code> лишние элементы переходят на следующую. Это особенно полезно для тегов, фильтров, небольших действий и карточек с разумной минимальной шириной. Перенос не задаёт число колонок: оно зависит от доступного места и ширины детей.</p><p>Попробуй сужать песочницу. Важный результат — не просто перенос, а сохранение расстояния и читаемости. Если элементы обязаны совпадать в колонках по строкам, лучше использовать Grid.</p>",
      "try": {
        "title": "1. Перенос фильтров",
        "html": "<nav class=\"filters\">\n  <a>Все маршруты</a><a>У воды</a><a>Для семьи</a><a>До 2 часов</a>\n</nav>",
        "css": ".filters { display: flex; flex-wrap: wrap; gap: .6rem; }\n.filters a { padding: .5rem .8rem; border-radius: 999px; background: #eef2ff; }",
        "height": 275
      },
      "remember": "gap — промежуток внутри группы; padding — место внутри элемента; margin — место снаружи.",
      "mistake": {
        "bad": ".chips { gap: 10px; } /* ожидаем перенос */",
        "good": ".chips { display: flex; flex-wrap: wrap; gap: 10px; }",
        "why": "gap сам по себе не включает ни Flexbox, ни перенос. Нужны оба правила."
      },
      "examples": [
        {
          "title": "1. Перенос фильтров",
          "html": "<nav class=\"filters\">\n  <a>Все маршруты</a><a>У воды</a><a>Для семьи</a><a>До 2 часов</a>\n</nav>",
          "css": ".filters { display: flex; flex-wrap: wrap; gap: .6rem; }\n.filters a { padding: .5rem .8rem; border-radius: 999px; background: #eef2ff; }",
          "height": 275
        },
        {
          "title": "2. Промежуток между элементами",
          "html": "<div class=\"chips\"><span>Для новичка</span><span>3,2 км</span><span>Есть тень</span></div>",
          "css": ".chips { display: flex; flex-wrap: wrap; gap: 10px 14px; padding: 12px; border: 1px solid #dde4df; }\n.chips span { padding: .4rem .6rem; background: #edf4ef; }",
          "height": 275
        }
      ]
    },
    {
      "id": "flex-values",
      "title": "Управляем размером: basis, grow и shrink",
      "text": "<p>Каждый flex-элемент начинается с исходного размера. Свойство <code>flex-basis</code> задаёт этот ориентир: например, <code>240px</code> просит отвести карточке примерно столько места. Оно не гарантирует точную ширину, потому что остальные свойства могут перераспределить пространство.</p><p><code>flex-grow</code> говорит, как делить свободное место: при значении <code>1</code> элемент может увеличиться. <code>flex-shrink</code> разрешает ему сжаться, когда места не хватает. Короткая запись <code>flex: 1 1 220px</code> задаёт grow, shrink и basis в этом порядке. Частая запись <code>flex: 1</code> распределяет доступное место между соседями, но иногда содержимому нужна минимальная ширина.</p><p>Проверь длинные слова и кнопки. Если колонка текста не хочет сжиматься, задай ей <code>min-width: 0</code>, а перенос слов — только там, где это уместно. Не лечи переполнение бесконечным уменьшением шрифта: сначала найди элемент, который удерживает строку.</p>",
      "try": {
        "title": "1. Гибкая ширина карточек",
        "html": "<section class=\"routes\"><article>Короткая тропа</article><article>Длинный маршрут для подготовленных</article><article>Путь у воды</article></section>",
        "css": ".routes { display: flex; flex-wrap: wrap; gap: 12px; }\n.routes article { flex: 1 1 12rem; min-width: 0; padding: 1rem; background: #eff4ee; }",
        "height": 275
      },
      "remember": "flex-basis — стартовый размер; grow делит лишнее место; shrink делит нехватку.",
      "mistake": {
        "bad": "flex: 0 0 280px; /* на телефоне колонка не сужается */",
        "good": "flex: 1 1 280px; min-width: 0;",
        "why": "Нулевые grow и shrink запрещают элементу менять размер. Для адаптивной колонки разреши сжатие."
      },
      "examples": [
        {
          "title": "1. Гибкая ширина карточек",
          "html": "<section class=\"routes\"><article>Короткая тропа</article><article>Длинный маршрут для подготовленных</article><article>Путь у воды</article></section>",
          "css": ".routes { display: flex; flex-wrap: wrap; gap: 12px; }\n.routes article { flex: 1 1 12rem; min-width: 0; padding: 1rem; background: #eff4ee; }",
          "height": 275
        },
        {
          "title": "2. Боковая панель фиксированной основы",
          "html": "<div class=\"layout\"><main>Основной материал с длинным текстом.</main><aside>Погода · 18 °C</aside></div>",
          "css": ".layout { display: flex; gap: 1rem; }\nmain { flex: 1 1 28rem; min-width: 0; }\naside { flex: 0 1 12rem; padding: 1rem; background: #fff4df; }",
          "height": 275
        }
      ]
    },
    {
      "id": "cards",
      "title": "Собираем карточки с одинаковой высотой",
      "text": "<p>Карточки в одном ряду удобно строить контейнером <code>display: flex</code> с <code>flex-wrap: wrap</code>. Базовая ширина задаётся через <code>flex-basis</code>, а свободное место делится через <code>flex-grow</code>. Например, <code>flex: 1 1 230px</code> означает: стремись к 230 пикселям, увеличивайся при наличии места и сжимайся, пока это возможно.</p><p>По умолчанию строка растягивает детей по поперечной оси, поэтому карточки одного ряда часто получаются одинаковой высоты. Чтобы кнопки стояли у нижнего края независимо от длины описания, сама карточка может быть колонкой, а кнопка — получить <code>margin-top: auto</code>. Так не приходится подбирать фиксированную высоту.</p><p>Расположение в flex-wrap зависит от ширины родителя, а не от жёсткого числа колонок. На большом экране карточек может быть три, на меньшем — две, на телефоне — одна. Если нужна точная двумерная сетка, сравни с уроком <a href=\"lesson-view.html?lesson=24#tracks\">CSS Grid</a>.</p>",
      "try": {
        "title": "1. Карточки одинаковой высоты",
        "html": "<section class=\"cards\"><article><h2>Озеро</h2><p>Короткая прогулка.</p><a href=\"#lake\">Маршрут</a></article><article><h2>Перевал</h2><p>Длинный маршрут с остановкой у смотровой площадки.</p><a href=\"#pass\">Маршрут</a></article></section>",
        "css": ".cards { display: flex; align-items: stretch; gap: 1rem; }\n.cards article { display: flex; flex: 1; flex-direction: column; padding: 1rem; border: 1px solid #dce3e8; border-radius: 12px; }\n.cards a { margin-top: auto; padding-top: 1rem; }",
        "height": 275
      },
      "remember": "Для карточек сначала задай гибкую основу, затем настрой их внутренний порядок отдельным Flexbox.",
      "mistake": {
        "bad": ".route-card { height: 340px; }",
        "good": ".route-card { display: flex; flex-direction: column; } .route-card a { margin-top: auto; }",
        "why": "Фиксированная высота ломает карточку с длинным текстом. Автоматический отступ держит действие внизу без жёсткой высоты."
      },
      "examples": [
        {
          "title": "1. Карточки одинаковой высоты",
          "html": "<section class=\"cards\"><article><h2>Озеро</h2><p>Короткая прогулка.</p><a href=\"#lake\">Маршрут</a></article><article><h2>Перевал</h2><p>Длинный маршрут с остановкой у смотровой площадки.</p><a href=\"#pass\">Маршрут</a></article></section>",
          "css": ".cards { display: flex; align-items: stretch; gap: 1rem; }\n.cards article { display: flex; flex: 1; flex-direction: column; padding: 1rem; border: 1px solid #dce3e8; border-radius: 12px; }\n.cards a { margin-top: auto; padding-top: 1rem; }",
          "height": 275
        },
        {
          "title": "2. Переносить карточки на узком экране",
          "html": "<section class=\"cards\"><article><h2>Сад</h2><p>Маршрут с фонтаном.</p></article><article><h2>Набережная</h2><p>Путь вдоль реки.</p></article><article><h2>Музей</h2><p>Экспозиция о городе.</p></article></section>",
          "css": ".cards { display: flex; flex-wrap: wrap; gap: 1rem; }\n.cards article { flex: 1 1 14rem; padding: 1rem; border-radius: 12px; background: #f0f4ef; }",
          "height": 275
        }
      ]
    },
    {
      "id": "interface",
      "title": "Строим панель действий и сохраняем порядок чтения",
      "text": "<p>Flexbox полезен не только для карточек. Навигация, группа кнопок, строка заголовка с датой или панель фильтров — всё это маленькие одномерные задачи. Сначала проверь, что порядок в HTML удобен для чтения: клавиатура и экранный диктор обычно идут по нему сверху вниз.</p><p>Свойство <code>order</code> меняет только визуальное положение flex-элемента. Оно не переставляет его в DOM и может запутать человека, который управляет сайтом клавиатурой. Используй его редко; для адаптации лучше изменить направление или перенос контейнера так, чтобы визуальный и логический порядок не расходились.</p><p>Для панели с разными по ширине группами можно применить <code>margin-left: auto</code> к действиям, которые нужно прижать к концу строки. На узком экране группу перенеси или поставь ниже. Не уменьшай кнопки до трудных для касания размеров: лучше дать им перейти на следующую строку.</p>",
      "try": {
        "title": "1. Навигация во Flexbox",
        "html": "<header class=\"site-head\"><a class=\"brand\" href=\"#home\">Тропа / рядом</a><nav aria-label=\"Разделы\"><a href=\"#routes\">Маршруты</a><a href=\"#about\">О нас</a></nav><button>Войти</button></header>",
        "css": ".site-head { display: flex; align-items: center; gap: 1rem; padding: 1rem; }\nnav { display: flex; gap: 1rem; margin-left: auto; }",
        "height": 275
      },
      "remember": "Пиши HTML в том порядке, в котором человек должен прочитать и пройти интерфейс. Визуальный порядок должен это поддерживать.",
      "mistake": {
        "bad": "order: -1; /* прячет проблему в порядке */",
        "good": "Переставь элементы в HTML и используй wrap или flex-direction для узкого экрана.",
        "why": "order не меняет последовательность клавиатуры и доступного чтения."
      },
      "examples": [
        {
          "title": "1. Навигация во Flexbox",
          "html": "<header class=\"site-head\"><a class=\"brand\" href=\"#home\">Тропа / рядом</a><nav aria-label=\"Разделы\"><a href=\"#routes\">Маршруты</a><a href=\"#about\">О нас</a></nav><button>Войти</button></header>",
          "css": ".site-head { display: flex; align-items: center; gap: 1rem; padding: 1rem; }\nnav { display: flex; gap: 1rem; margin-left: auto; }",
          "height": 275
        },
        {
          "title": "2. Ссылка отдельно от кнопки",
          "html": "<nav aria-label=\"Основная навигация\">\n  <a href=\"index.html\">Главная</a>\n  <a href=\"routes.html\">Маршруты</a>\n  <button type=\"button\">Открыть меню</button>\n</nav>",
          "css": "nav { display: flex; align-items: center; gap: .8rem; }\nbutton { min-height: 44px; padding: .5rem .8rem; }",
          "height": 275
        }
      ]
    },
    {
      "id": "flex-or-grid",
      "title": "Выбираем Flexbox или Grid",
      "text": "<p>Flexbox решает задачу вдоль одной оси: распределить элементы в строке или колонке и гибко поделить место. Grid управляет строками и столбцами сразу, поэтому подходит для сеток, где элементы должны совпадать по нескольким линиям. Выбор зависит от задачи, а не от того, какой инструмент «современнее».</p><p>Например, панель фильтров, меню и ряд карточек естественно переносятся через Flexbox. Шахматному полю нужна фиксированная сетка из восьми колонок и восьми рядов — это задача Grid. Позиционировать каждую клетку отдельно можно, но тогда при изменении размера приходится рассчитывать каждую координату.</p><p>В реальном интерфейсе методы сочетаются: Grid задаёт каркас страницы, а Flexbox выравнивает содержимое карточки. Начни с вопроса: мне нужно распределить элементы в одном направлении или одновременно контролировать две координатные линии? Ответ обычно сразу подсказывает выбор.</p>",
      "try": {
        "title": "1. Одномерный список Flexbox",
        "html": "<nav class=\"filters\"><a>Все</a><a>События</a><a>Бесплатно</a></nav>",
        "css": ".filters { display: flex; flex-wrap: wrap; gap: .6rem; }\na { padding: .5rem .8rem; background: #eef2f8; }",
        "height": 275
      },
      "remember": "Одно направление — Flexbox. Две линии, которые важно контролировать вместе — Grid. Сочетать их нормально.",
      "mistake": {
        "bad": "Создать 64 клетки и вручную расставить их через left и top.",
        "good": "Для шахматной доски задать display: grid и восемь колонок одинаковой доли.",
        "why": "Grid задаёт повторяющиеся строки и столбцы одной сеткой; Flexbox остаётся удобен для элементов внутри каждой клетки."
      },
      "examples": [
        {
          "title": "1. Одномерный список Flexbox",
          "html": "<nav class=\"filters\"><a>Все</a><a>События</a><a>Бесплатно</a></nav>",
          "css": ".filters { display: flex; flex-wrap: wrap; gap: .6rem; }\na { padding: .5rem .8rem; background: #eef2f8; }",
          "height": 275
        },
        {
          "title": "2. Двумерная сетка Grid",
          "html": "<div class=\"calendar\"><span>ПН</span><span>ВТ</span><span>СР</span><b>1</b><b>2</b><b>3</b></div>",
          "css": ".calendar { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; text-align: center; }\n.calendar > * { padding: .6rem; background: #eef2f8; }",
          "height": 275
        }
      ]
    },
    {
      "id": "grid-columns-fractions",
      "title": "Столбцы и fr",
      "text": "<p><strong>Grid строит двумерную сетку с явно заданными колонками и рядами.</strong> fr делит свободное место на доли: 2fr 1fr отдаёт основной области примерно вдвое больше пространства, чем боковой. В примерах повторяющиеся колонки можно задать через repeat(), а gap создаёт расстояние между ячейками.</p><p>Проверь ширину контейнера и измени число долей; содержимое должно оставаться внутри сетки. grid-template-columns задаёт структуру, а не стилизует отдельный ребёнок. Не путай fr с фиксированным пикселем: это часть доступного пространства после учёта gap и ограничений. Назови назначение каждой колонки и сравни их ширину после изменения.</p>",
      "try": {
        "title": "1. Две колонки с долями",
        "html": "<div class=\"layout\"><main><h2>Основной маршрут</h2><p>Описание пути через долину.</p></main><aside>Карта и погода</aside></div>",
        "css": ".layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }\nmain, aside { padding: 1rem; background: #eff3ee; }",
        "height": 275
      },
      "remember": "Колонки и ряды описываются на родителе, fr делит свободное пространство на доли.",
      "examples": [
        {
          "title": "1. Две колонки с долями",
          "html": "<div class=\"layout\"><main><h2>Основной маршрут</h2><p>Описание пути через долину.</p></main><aside>Карта и погода</aside></div>",
          "css": ".layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }\nmain, aside { padding: 1rem; background: #eff3ee; }",
          "height": 275
        },
        {
          "title": "2. Сетка с повторяющимися колонками",
          "html": "<section class=\"cards\"><article>Лес</article><article>Озеро</article><article>Холмы</article><article>Сад</article></section>",
          "css": ".cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }\n.cards article { min-height: 90px; padding: 1rem; background: #eef3ed; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": ".layout { grid-template-columns: 2fr 1fr; }",
        "good": ".layout { display: grid; grid-template-columns: 2fr 1fr; }",
        "why": "Без display:grid объявленные дорожки не создают сетку."
      }
    },
    {
      "id": "grid-repeat-minmax",
      "title": "repeat и minmax",
      "text": "<p><strong>repeat и minmax помогают описать множество адаптивных колонок коротко.</strong> В галерее repeat(auto-fit, minmax(14rem, 1fr)) создаёт столько колонок, сколько помещается, но не сжимает каждую меньше заданного минимума. Второй образец показывает разницу между фиксированным числом дорожек и повторяемой формулой.</p><p>Меняй ширину окна и наблюдай, как карточки переходят на новую строку без медиазапроса для каждого порога. Если минимум слишком велик, колонки не поместятся; если он слишком мал, заголовки будут ломаться. Не используй повтор без minmax для карточек с разным содержимым, если важна минимальная читаемая ширина.</p>",
      "try": {
        "title": "1. Карточки, которые сами заполняют строку",
        "html": "<div class=\"cards\"><article>Тихий лес</article><article>Берег озера</article><article>Смотровая площадка</article><article>Старый сад</article></div>",
        "css": ".cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 14px; }\narticle { padding: 1rem; border-radius: 12px; background: #eef3ed; }",
        "height": 275
      },
      "remember": "Repeat сокращает запись дорожек, minmax ограничивает допустимую ширину каждой колонки.",
      "examples": [
        {
          "title": "1. Карточки, которые сами заполняют строку",
          "html": "<div class=\"cards\"><article>Тихий лес</article><article>Берег озера</article><article>Смотровая площадка</article><article>Старый сад</article></div>",
          "css": ".cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 14px; }\narticle { padding: 1rem; border-radius: 12px; background: #eef3ed; }",
          "height": 275
        },
        {
          "title": "2. Минимум и максимум ширины",
          "html": "<div class=\"stats\"><div><b>6 км</b><span>длина</span></div><div><b>2 часа</b><span>время</span></div><div><b>Лёгкий</b><span>уровень</span></div></div>",
          "css": ".stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }\n.stats div { min-width: 0; padding: .8rem; background: #f0f3fa; }\n.stats span { display: block; color: #637084; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": "repeat(auto-fit, 1fr)",
        "good": "repeat(auto-fit, minmax(14rem, 1fr))",
        "why": "auto-fit требует повторяемый размер дорожки; minmax задаёт границы её роста."
      }
    }
  ],
  "cheatsheet": {
    "lang": "css",
    "code": ".toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.cards {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 20px;\n}"
  },
  "practice": {
    "intro": "Собери каталог маршрутов: выровняй панель действий с Flexbox и расположи карточки в сетку.",
    "stages": [
      {
        "title": "Подготовь основу · Ось и направление: включаем Flexbox",
        "task": "Для проекта «панель фильтров и ряд гибких карточек маршрутов» выполни шаг «Ось и направление: включаем Flexbox»: Сначала назови направление главной оси. Это подскажет, в какую сторону будут работать свойства выравнивания. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «flex-direction: column;», отличает его от ошибки «flex-direction: column-reverse;» и объясняет: reverse переворачивает визуальный порядок. Не используй его для починки неправильного порядка в HTML."
      },
      {
        "title": "Добавь ключевой приём · Добавляем промежутки и перенос",
        "task": "Для проекта «панель фильтров и ряд гибких карточек маршрутов» выполни шаг «Добавляем промежутки и перенос»: gap — промежуток внутри группы; padding — место внутри элемента; margin — место снаружи. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «.chips { display: flex; flex-wrap: wrap; gap: 10px; }», отличает его от ошибки «.chips { gap: 10px; } /* ожидаем перенос */» и объясняет: gap сам по себе не включает ни Flexbox, ни перенос. Нужны оба правила."
      },
      {
        "title": "Собери рабочий фрагмент · Собираем карточки с одинаковой высотой",
        "task": "Для проекта «панель фильтров и ряд гибких карточек маршрутов» выполни шаг «Собираем карточки с одинаковой высотой»: Для карточек сначала задай гибкую основу, затем настрой их внутренний порядок отдельным Flexbox. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «.route-card { display: flex; flex-direction: column; } .route-card a { margin-top: auto; }», отличает его от ошибки «.route-card { height: 340px; }» и объясняет: Фиксированная высота ломает карточку с длинным текстом. Автоматический отступ держит действие внизу без жёсткой высоты."
      },
      {
        "title": "Проверь и объясни · Выбираем Flexbox или Grid",
        "task": "Для проекта «панель фильтров и ряд гибких карточек маршрутов» выполни шаг «Выбираем Flexbox или Grid»: Одно направление — Flexbox. Две линии, которые важно контролировать вместе — Grid. Сочетать их нормально. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «Для шахматной доски задать display: grid и восемь колонок одинаковой доли.», отличает его от ошибки «Создать 64 клетки и вручную расставить их через left и top.» и объясняет: Grid задаёт повторяющиеся строки и столбцы одной сеткой; Flexbox остаётся удобен для элементов внутри каждой клетки."
      }
    ],
    "hints": [
      "Если застрял на «Ось и направление: включаем Flexbox», проверь правило: Сначала назови направление главной оси. Это подскажет, в какую сторону будут работать свойства выравнивания. Частая ошибка: flex-direction: column-reverse; — reverse переворачивает визуальный порядок. Не используй его для починки неправильного порядка в HTML.",
      "Если застрял на «Добавляем промежутки и перенос», проверь правило: gap — промежуток внутри группы; padding — место внутри элемента; margin — место снаружи. Частая ошибка: .chips { gap: 10px; } /* ожидаем перенос */ — gap сам по себе не включает ни Flexbox, ни перенос. Нужны оба правила.",
      "Если застрял на «Собираем карточки с одинаковой высотой», проверь правило: Для карточек сначала задай гибкую основу, затем настрой их внутренний порядок отдельным Flexbox. Частая ошибка: .route-card { height: 340px; } — Фиксированная высота ломает карточку с длинным текстом. Автоматический отступ держит действие внизу без жёсткой высоты."
    ],
    "findError": {
      "code": ".summary { display: flex; gap: 12px; }\n+.summary-card { flex: 0 0 260px; }\n+.summary-card { align-items: center; }",
      "solution": "<p>Две ошибки: фиксированные 260 пикселей вместе с <code>flex-shrink: 0</code> не дают карточкам сжиматься и могут вызвать горизонтальный скролл. А <code>align-items</code> действует на детей flex-контейнера, поэтому его нужно задать самому элементу <code>.summary-card</code> с <code>display: flex</code> или перенести правило на родителя — в зависимости от того, что выравниваем.</p><pre><code>.summary { display: flex; flex-wrap: wrap; gap: 12px; }\n.summary-card { flex: 1 1 220px; min-width: 0; display: flex; align-items: center; }</code></pre>"
    },
    "solution": {
      "html": "<main class=\"board\">\n  <header class=\"board__header\">\n    <div><p class=\"eyebrow\">ПЛАН НА СЕГОДНЯ</p><h1>День проекта</h1></div>\n    <a class=\"button\" href=\"#tasks\">Открыть задачи</a>\n  </header>\n  <section class=\"stats\" aria-label=\"Сводка проекта\">\n    <article class=\"stat\"><span>Команда</span><strong>8 человек</strong></article>\n    <article class=\"stat\"><span>Готово</span><strong>6 задач</strong></article>\n    <article class=\"stat\"><span>До показа</span><strong>3 дня</strong></article>\n  </section>\n  <section class=\"tasks\" id=\"tasks\" aria-label=\"Задачи команды\">\n    <article class=\"task\"><div><h2>Проверить макет</h2><p>Дизайн · сегодня</p></div><span class=\"badge\">В работе</span></article>\n    <article class=\"task\"><div><h2>Подготовить тексты</h2><p>Редактура · завтра</p></div><span class=\"badge badge--done\">Готово</span></article>\n  </section>\n</main>",
      "css": "* { box-sizing: border-box; }\nbody { margin: 0; color: #222a3b; background: #f4f6fa; font: 16px/1.5 Arial, sans-serif; }\n.board { max-width: 900px; margin: 0 auto; padding: 28px; }\n.board__header, .task { display: flex; align-items: center; justify-content: space-between; gap: 16px; }\n.eyebrow { color: #5869a9; font-size: 11px; font-weight: 800; letter-spacing: .1em; }\n.board h1 { margin: 4px 0 0; font-size: clamp(28px, 5vw, 42px); }\n.button { padding: 11px 15px; border-radius: 10px; color: white; background: #4558a8; text-decoration: none; font-weight: 700; }\n.stats, .tasks { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }\n.stat, .task { flex: 1 1 220px; min-width: 0; padding: 18px; border: 1px solid #dfe4ef; border-radius: 16px; background: white; }\n.stat { display: flex; flex-direction: column; gap: 5px; }\n.stat span, .task p { color: #5c6372; }\n.task > div { min-width: 0; }\n.task h2 { margin: 0; font-size: 17px; }\n.task p { margin: 5px 0 0; }\n.badge { flex: 0 0 auto; padding: 6px 9px; border-radius: 99px; color: #394a91; background: #edf0ff; font-size: 12px; }\n.badge--done { color: #276346; background: #e6f6ed; }\n@media (max-width: 520px) { .board { padding: 20px; } .board__header { align-items: flex-start; flex-direction: column; } .task { align-items: flex-start; flex-direction: column; } }"
    }
  },
  "can": [
    "Задать основную ось Flexbox.",
    "Выровнять элементы и управлять промежутками.",
    "Разрешить карточкам переноситься и расти.",
    "Создать колонки CSS Grid с repeat и minmax."
  ],
  "projects": [
    {
      "title": "Каталог маршрутов выходного дня",
      "about": "Собери страницу с шапкой, фильтрами и карточками трёх маршрутов. Flexbox помогает выравнивать меню, переносить фильтры и распределять карточки без жёсткой ширины.",
      "steps": [
        "Разметь страницу и навигацию в логичном порядке.",
        "Собери меню и строку фильтров через flex и gap.",
        "Настрой карточки с гибкой basis, wrap и одинаковым поведением действий.",
        "Проверь узкий экран и клавиатурный порядок."
      ],
      "done": [
        "Меню не перекрывается с названием.",
        "Фильтры переносятся на следующую строку.",
        "Карточки не задают странице горизонтальную прокрутку.",
        "Каждое действие имеет понятный текст ссылки."
      ],
      "stretch": "Добавь отдельный блок «На этой неделе» и используй Grid для сравнения маршрутов по дню и длительности.",
      "example": {
        "title": "Маршруты рядом",
        "description": "Навигация, переносимые фильтры и карточки маршрутов на Flexbox.",
        "html": "<!doctype html>\n<html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Маршруты рядом</title></head>\n<body><header class=\"site-head\"><a class=\"brand\" href=\"#home\">Тропа / рядом</a><nav><a href=\"#routes\">Маршруты</a><a href=\"#guide\">Как выбрать</a></nav><a class=\"join\" href=\"#guide\">В путь</a></header>\n<main class=\"page\" id=\"home\"><section class=\"intro\"><p class=\"eyebrow\">ИДЕИ ДЛЯ ВЫХОДНОГО</p><h1>Найди свою тропу</h1><p>Короткие маршруты, которые начинаются рядом и оставляют время на дорогу домой.</p><div class=\"filters\"><a href=\"#pine\">Лёгкие</a><a href=\"#river\">У воды</a><a href=\"#pine\">Для семьи</a><a href=\"#view\">До полудня</a></div></section>\n<section class=\"routes\" id=\"routes\" aria-label=\"Маршруты\"><article class=\"route\" id=\"pine\"><div class=\"route-top\"><span>01 · ЛЕС</span><span class=\"time\">2 часа</span></div><h2>Тихая сосновая тропа</h2><p>Мягкий подъём и площадка для отдыха в тени.</p><a href=\"#pine\">Посмотреть маршрут →</a></article><article class=\"route route--blue\" id=\"river\"><div class=\"route-top\"><span>02 · РЕКА</span><span class=\"time\">3 часа</span></div><h2>Поворот у воды</h2><p>Прогулка вдоль берега с местом для пикника.</p><a href=\"#river\">Посмотреть маршрут →</a></article><article class=\"route route--gold\" id=\"view\"><div class=\"route-top\"><span>03 · ХОЛМЫ</span><span class=\"time\">4 часа</span></div><h2>Смотровая площадка</h2><p>Длинный путь с панорамой на долину.</p><a href=\"#view\">Посмотреть маршрут →</a></article></section></main>\n<footer class=\"footer\" id=\"guide\"><span>Выбирай маршрут по силам и погоде.</span><a href=\"#home\">Наверх ↑</a></footer></body></html>",
        "css": "* { box-sizing: border-box; }\nbody { margin: 0; color: #202a2b; background: #f5f7f3; font: 16px/1.55 Arial, sans-serif; }\na { color: inherit; }\n.site-head { display: flex; align-items: center; gap: 24px; padding: 18px max(22px, calc((100% - 1120px) / 2)); border-bottom: 1px solid #e1e7de; background: #fff; }\n.brand { color: #25543d; font-weight: 800; text-decoration: none; }\n.site-head nav { display: flex; gap: 20px; margin-left: auto; }\n.site-head nav a, .footer a { text-decoration: none; }\n.join { padding: 9px 13px; border-radius: 9px; color: #fff; background: #2b6847; font-weight: 700; text-decoration: none; }\n.page { max-width: 1120px; margin: auto; padding: 56px 24px; }\n.intro { max-width: 700px; }\n.eyebrow { color: #3e7653; font-size: 11px; font-weight: 800; letter-spacing: .12em; }\nh1 { margin: 10px 0; font-size: clamp(36px, 6vw, 60px); line-height: 1.04; letter-spacing: -.045em; }\n.intro > p:not(.eyebrow) { max-width: 610px; color: #5c6960; font-size: 18px; }\n.filters { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 24px; }\n.filters a { padding: 8px 12px; border: 1px solid #dce5dc; border-radius: 99px; background: #fff; text-decoration: none; font-size: 13px; }\n.routes { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 38px; }\n.route { flex: 1 1 250px; display: flex; flex-direction: column; min-width: 0; min-height: 270px; padding: 22px; border: 1px solid #dce5dc; border-radius: 18px; background: #fff; }\n.route--blue { background: #edf5f7; }.route--gold { background: #fbf2e3; }\n.route-top { display: flex; justify-content: space-between; gap: 10px; color: #477057; font-size: 11px; font-weight: 800; letter-spacing: .08em; }\n.time { flex: 0 0 auto; padding: 4px 7px; border-radius: 99px; color: #58645b; background: rgba(255,255,255,.75); letter-spacing: 0; }\n.route h2 { margin: 32px 0 8px; font-size: 22px; line-height: 1.2; }\n.route p { flex: 1; color: #59665c; }\n.route > a { align-self: flex-start; margin-top: 14px; color: #2d6848; font-weight: 700; text-decoration: none; }\n.footer { display: flex; justify-content: space-between; gap: 16px; padding: 22px max(22px, calc((100% - 1072px) / 2)); color: #59665c; background: #eaf0e8; font-size: 13px; }\n@media (max-width: 620px) { .site-head { align-items: flex-start; flex-wrap: wrap; gap: 12px; padding: 16px 20px; }.site-head nav { order: 3; width: 100%; margin-left: 0; }.join { margin-left: auto; }.page { padding: 36px 20px; }.route { flex-basis: 100%; min-height: 230px; }.footer { flex-direction: column; padding: 20px; }}"
      }
    },
    {
      "title": "Панель задач команды",
      "about": "Собери рабочую панель проекта: шапку с действиями, строку показателей и список задач с метками статуса. Важно сохранить логичный порядок чтения и не сломать длинные названия задач.",
      "steps": [
        "Собери заголовок и навигацию в шапке.",
        "Разложи показатели на переносимые карточки.",
        "Выровняй задачи и их статусы внутри каждой строки.",
        "Проверь клавиатуру и узкий экран."
      ],
      "done": [
        "Основное действие заметно, но не вытесняет навигацию.",
        "Показатели делят доступное место и переносятся.",
        "Длинное название задачи не выталкивает статус за экран.",
        "Ссылки и кнопки идут в том же порядке, что и в HTML."
      ],
      "stretch": "Добавь переключатель фильтров по статусу. Для двухмерного календаря сравни Flexbox с Grid.",
      "example": {
        "title": "Панель команды: дневной обзор",
        "description": "Панель задач с гибкими показателями, переносом и внутренним выравниванием строк.",
        "html": "<!doctype html>\n<html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Обзор команды</title></head>\n<body><header class=\"topbar\"><a class=\"brand\" href=\"#home\">Команда / обзор</a><nav><a href=\"#today\">Сегодня</a><a href=\"#projects\">Проекты</a><a href=\"#people\">Люди</a></nav><button class=\"avatar\" aria-label=\"Профиль команды\">К</button></header>\n<main class=\"workspace\" id=\"home\"><div class=\"heading\"><div><p class=\"eyebrow\">СРЕДА, 14 МАЯ</p><h1>Хороший день для прогресса</h1></div><button class=\"primary\">+ Новая задача</button></div>\n<section class=\"metrics\" aria-label=\"Показатели команды\"><article><span>Открытые задачи</span><strong>12</strong><small>3 на этой неделе</small></article><article><span>Завершено</span><strong>28</strong><small>На 6 больше прошлой недели</small></article><article><span>Следующая встреча</span><strong>15:30</strong><small>Обзор макета</small></article></section>\n<section class=\"task-panel\" id=\"today\"><div class=\"panel-head\"><div><h2>На сегодня</h2><p>Три ближайших шага</p></div><a href=\"#today\">Все задачи →</a></div><article class=\"task\"><span class=\"task-dot\"></span><div class=\"task-copy\"><h3>Сверить мобильную версию экрана регистрации</h3><p>Дизайн · интерфейс</p></div><span class=\"status\">В работе</span><button class=\"more\" aria-label=\"Ещё для задачи регистрации\">•••</button></article><article class=\"task\"><span class=\"task-dot task-dot--gold\"></span><div class=\"task-copy\"><h3>Подготовить иллюстрации для страницы справки</h3><p>Редактура · материалы</p></div><span class=\"status status--waiting\">Ожидает</span><button class=\"more\" aria-label=\"Ещё для иллюстраций\">•••</button></article></section><section class=\"task-panel\" id=\"projects\"><div class=\"panel-head\"><h2>Проекты</h2><span>2 активных</span></div><p>Новый маршрут рядом · Сверка страницы регистрации</p></section><section class=\"task-panel\" id=\"people\"><div class=\"panel-head\"><h2>Люди</h2><span>3 участника</span></div><p>Кира · Артём · Малика</p></section></main></body></html>",
        "css": "* { box-sizing: border-box; }\nbody { margin: 0; color: #25283a; background: #f4f5f9; font: 15px/1.5 Arial, sans-serif; }\nbutton, a { font: inherit; }\n.topbar { min-height: 70px; display: flex; align-items: center; gap: 24px; padding: 12px max(22px, calc((100% - 1120px) / 2)); background: #fff; border-bottom: 1px solid #e6e7ef; }\n.brand { color: #31396d; font-weight: 800; text-decoration: none; }\n.topbar nav { display: flex; gap: 20px; margin-left: auto; }\n.topbar nav a { color: #5c6071; text-decoration: none; }\n.avatar { width: 38px; height: 38px; border: 0; border-radius: 50%; color: #fff; background: #6672b5; font-weight: 700; }\n.workspace { max-width: 1120px; margin: auto; padding: 40px 24px 64px; }\n.heading, .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; }\n.eyebrow { color: #6672b5; font-size: 10px; font-weight: 800; letter-spacing: .12em; }\nh1 { margin: 6px 0 0; font-size: clamp(28px, 4vw, 42px); line-height: 1.12; letter-spacing: -.04em; }\n.primary { flex: 0 0 auto; padding: 11px 14px; border: 0; border-radius: 10px; color: #fff; background: #4b5baa; font-weight: 700; }\n.metrics { display: flex; flex-wrap: wrap; gap: 13px; margin-top: 28px; }\n.metrics article { flex: 1 1 200px; display: flex; flex-direction: column; gap: 5px; min-width: 0; padding: 18px; border: 1px solid #e4e5ee; border-radius: 14px; background: #fff; }\n.metrics span, .metrics small, .panel-head p, .task-copy p { color: #707486; }\n.metrics strong { font-size: 27px; }\n.task-panel { margin-top: 28px; padding: 22px; border: 1px solid #e4e5ee; border-radius: 16px; background: #fff; }\n.panel-head { margin-bottom: 14px; }.panel-head h2, .panel-head p { margin: 0; }.panel-head p { font-size: 13px; }.panel-head a { color: #46579f; font-size: 13px; font-weight: 700; text-decoration: none; }\n.task { display: flex; align-items: center; gap: 12px; padding: 15px 0; border-top: 1px solid #eff0f4; }\n.task-dot { flex: 0 0 10px; height: 10px; border-radius: 50%; background: #596bb4; }.task-dot--gold { background: #d89a41; }\n.task-copy { flex: 1 1 auto; min-width: 0; }.task-copy h3 { margin: 0; font-size: 14px; }.task-copy p { margin: 4px 0 0; font-size: 12px; }\n.status { flex: 0 0 auto; padding: 6px 9px; border-radius: 99px; color: #3f538f; background: #eff1ff; font-size: 11px; font-weight: 700; }.status--waiting { color: #895d19; background: #fff4df; }\n.more { flex: 0 0 auto; border: 0; color: #72768a; background: transparent; }\n@media (max-width: 640px) { .topbar { flex-wrap: wrap; gap: 12px; padding: 12px 18px; }.topbar nav { order: 3; width: 100%; margin-left: 0; }.workspace { padding: 28px 18px 46px; }.heading { align-items: flex-start; flex-direction: column; }.task-panel { padding: 17px; }.task { align-items: flex-start; flex-wrap: wrap; }.task-copy { flex-basis: calc(100% - 34px); }.status { margin-left: 22px; } }"
      }
    }
  ],
  "title": "Flexbox и основы CSS Grid",
  "goal": "Распределяй элементы в гибкой строке и собери простую двумерную сетку карточек."
};
