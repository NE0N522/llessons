window.LESSONS = window.LESSONS || {};
window.LESSONS[23] = {
  "id": 23,
  "learn": [
    "Отличишь раскладку вдоль одной оси от двумерной сетки.",
    "Создашь колонки с помощью долей fr и настроишь промежутки.",
    "Повторишь дорожки и задашь минимальную ширину карточек."
  ],
  "steps": [
    {
      "id": "flex-or-grid",
      "title": "Flexbox или Grid: какой способ выбрать?",
      "text": "<p><strong>Flexbox удобен, когда нужно выстроить элементы вдоль одной оси.</strong> Это может быть строка навигации, кнопок или содержимое карточки. <strong>Grid подходит, когда важны строки и колонки вместе</strong>, например каталог товаров с общей шириной колонок.</p><p>Инструменты можно сочетать: сетка страницы может быть Grid, а элементы внутри карточки — Flexbox. В примерах сравни, нужно ли синхронно контролировать колонки и ряды. Подробные раскладки Flexbox изучаются в <a href=\"lesson-view.html?lesson=29\">отдельном уроке</a>.</p>",
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
    "columns": [
      "Запись",
      "Смысл",
      "Когда пригодится"
    ],
    "rows": [
      [
        "display: grid",
        "Включает сетку у контейнера",
        "Нужно контролировать строки и колонки"
      ],
      [
        "1fr",
        "Доля свободного места",
        "Колонки делят оставшуюся ширину"
      ],
      [
        "repeat(3, 1fr)",
        "Три равные колонки",
        "Ряд карточек одного размера"
      ],
      [
        "minmax(14rem, 1fr)",
        "Размер от минимума до доли",
        "Адаптивная карточная сетка"
      ],
      [
        "gap",
        "Расстояние между ячейками",
        "Промежутки внутри сетки"
      ]
    ]
  },
  "practice": {
    "intro": "Начни со стартового кода, затем сверяйся с чек-листом. Решение можно открыть после попытки.",
    "tasks": [
      {
        "title": "Три колонки каталога",
        "task": "Расположи три карточки в одинаковых колонках.",
        "starter": {
          "html": "<section class=\"grid\"><article>HTML</article><article>CSS</article><article>Проекты</article></section>",
          "css": ".grid { /* опиши колонки и промежуток */ }"
        },
        "checklist": [
          "Включён display: grid.",
          "Колонки имеют ожидаемый размер.",
          "Проверь длинное содержимое и узкую ширину."
        ],
        "solution": {
          "html": "<section class=\"grid\"><article>HTML</article><article>CSS</article><article>Проекты</article></section>",
          "css": ".grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }\n.grid > * { min-width: 0; padding: 16px; border-radius: 12px; background: #edf2ff; }"
        }
      },
      {
        "title": "Карточки с минимальной шириной",
        "task": "Повторяй столько колонок, сколько помещается, сохраняя карточкам минимум 14rem.",
        "starter": {
          "html": "<section class=\"grid\"><article>Маршрут у озера</article><article>Прогулка по лесу</article><article>Старый город</article><article>Семейный парк</article></section>",
          "css": ".grid { /* опиши колонки и промежуток */ }"
        },
        "checklist": [
          "Включён display: grid.",
          "Колонки имеют ожидаемый размер.",
          "Проверь длинное содержимое и узкую ширину."
        ],
        "solution": {
          "html": "<section class=\"grid\"><article>Маршрут у озера</article><article>Прогулка по лесу</article><article>Старый город</article><article>Семейный парк</article></section>",
          "css": ".grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 14px; }\n.grid > * { min-width: 0; padding: 16px; border-radius: 12px; background: #edf2ff; }"
        }
      },
      {
        "title": "Выделенная карточка",
        "task": "Растяни главный блок на две колонки, остальные оставь в обычных ячейках.",
        "starter": {
          "html": "<section class=\"grid\"><article>План недели</article><article>Задачи</article><article>Заметки</article></section>",
          "css": ".grid { /* опиши колонки и промежуток */ }"
        },
        "checklist": [
          "Включён display: grid.",
          "Колонки имеют ожидаемый размер.",
          "Проверь длинное содержимое и узкую ширину."
        ],
        "solution": {
          "html": "<section class=\"grid\"><article>План недели</article><article>Задачи</article><article>Заметки</article></section>",
          "css": ".grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }\n.grid > * { min-width: 0; padding: 16px; border-radius: 12px; background: #edf2ff; }"
        }
      },
      {
        "title": "Расписание по дням",
        "task": "Размести пять блоков в трёх колонках и объясни, откуда появляется следующий ряд.",
        "starter": {
          "html": "<section class=\"grid\"><article>Понедельник</article><article>Вторник</article><article>Среда</article><article>Четверг</article><article>Пятница</article></section>",
          "css": ".grid { /* опиши колонки и промежуток */ }"
        },
        "checklist": [
          "Включён display: grid.",
          "Колонки имеют ожидаемый размер.",
          "Проверь длинное содержимое и узкую ширину."
        ],
        "solution": {
          "html": "<section class=\"grid\"><article>Понедельник</article><article>Вторник</article><article>Среда</article><article>Четверг</article><article>Пятница</article></section>",
          "css": ".grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }\n.grid > * { min-width: 0; padding: 16px; border-radius: 12px; background: #edf2ff; }"
        }
      }
    ],
    "hints": [
      "Начни с display: grid.",
      "Попробуй repeat() и fr для одинаковых дорожек.",
      "Для минимальной ширины используй minmax()."
    ]
  },
  "can": [
    "Объяснить разницу между одной осью и двумерной сеткой.",
    "Создать несколько колонок с помощью fr.",
    "Повторить дорожки и ограничить их минимальную ширину."
  ],
  "projects": [
    {
      "title": "Каталог занятий",
      "about": "Собери адаптивную сетку и проверь длинное содержимое.",
      "steps": [
        "Определи структуру колонок.",
        "Задай gap и minmax().",
        "Проверь мобильный экран."
      ],
      "done": [
        "Колонки не выходят за контейнер.",
        "Карточки читаемы.",
        "Сетка меняется с шириной окна."
      ],
      "stretch": "Добавь grid-template-areas.",
      "example": {
        "title": "Каталог занятий",
        "description": "Пример двумерной сетки на CSS Grid.",
        "html": "<main class=\"grid\"><article><h2>HTML-клуб</h2><p>Вторник · 15:30</p></article><article><h2>Мастерская игр</h2><p>Четверг · 17:00</p></article><article><h2>Цвет и типографика</h2><p>Пятница · 14:00</p></article></main>",
        "css": "body{margin:0;padding:20px;background:#f1f4f8;font:16px/1.5 system-ui,sans-serif}.grid{max-width:900px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));gap:14px}.grid article{padding:18px;border:1px solid #d7e0e8;border-radius:14px;background:white}.grid h2{margin:0 0 8px;font-size:19px}.grid p{margin:0;color:#586a7e}"
      }
    },
    {
      "title": "Панель недели",
      "about": "Собери адаптивную сетку и проверь длинное содержимое.",
      "steps": [
        "Определи структуру колонок.",
        "Задай gap и minmax().",
        "Проверь мобильный экран."
      ],
      "done": [
        "Колонки не выходят за контейнер.",
        "Карточки читаемы.",
        "Сетка меняется с шириной окна."
      ],
      "stretch": "Добавь grid-template-areas.",
      "example": {
        "title": "Панель недели",
        "description": "Пример двумерной сетки на CSS Grid.",
        "html": "<main class=\"grid\"><article class=\"featured\"><h2>План на неделю</h2><p>Главные задачи команды</p></article><article><h2>Сроки</h2><p>Пятница</p></article><article><h2>Заметки</h2><p>Новый дизайн</p></article></main>",
        "css": "body{margin:0;padding:20px;background:#f1f4f8;font:16px/1.5 system-ui,sans-serif}.grid{max-width:850px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.grid article{min-width:0;padding:18px;border-radius:14px;background:white}.grid .featured{grid-column:span 2;background:#eaf0fb}@media(max-width:600px){.grid{grid-template-columns:1fr}.grid .featured{grid-column:auto}}"
      }
    }
  ],
  "title": "CSS Grid: первые двумерные сетки",
  "goal": "Создавать строки и колонки, задавать их долями и собирать повторяемые сетки карточек.",
  "quiz": [
    {
      "question": "Когда удобнее Grid?",
      "answer": "Когда нужно контролировать строки и колонки вместе."
    },
    {
      "question": "Что означает 1fr?",
      "answer": "Одну долю свободного места сетки."
    },
    {
      "question": "Что задаёт repeat(3, 1fr)?",
      "answer": "Три одинаковые колонки."
    },
    {
      "question": "Зачем нужен minmax()?",
      "answer": "Чтобы ограничить допустимый размер дорожки."
    }
  ]
};
