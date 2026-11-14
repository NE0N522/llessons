window.LESSONS = window.LESSONS || {};
window.LESSONS[14] = {
  "id": 14,
  "learn": [
    "Разберёшь схему Блок__Элемент--Модификатор.",
    "Научишься выбирать классы по роли, а не по цвету или размеру.",
    "Упорядочишь компонентные стили для нескольких страниц."
  ],
  "steps": [
    {
      "id": "bem-block-element-modifier",
      "title": "Блок, элемент, модификатор",
      "text": "<p><strong>БЭМ описывает классы как блок, элемент и модификатор.</strong> В примере самостоятельная карточка названа event-card, её дата и заголовок — event-card__date и event-card__title, а featured-вариант обозначен event-card--featured. Два класса на article могут работать одновременно: базовый задаёт общую карточку, модификатор меняет один её вариант.</p><p>Посмотри, как CSS отдельно оформляет дату и выделенную карточку. Название объясняет роль, поэтому такой блок можно повторить в другом месте. Не путай два дефиса модификатора с двумя подчёркиваниями элемента: event-card__featured выглядел бы частью блока, а не его состоянием.</p>",
      "remember": "В БЭМ блок самостоятельный, элемент принадлежит блоку через __, модификатор задаёт вариант через --.",
      "examples": [
        {
          "title": "1. Блок, элемент, модификатор",
          "html": "<article class=\"event-card event-card--featured\">\n  <p class=\"event-card__date\">СУББОТА · 12:00</p>\n  <h2 class=\"event-card__title\">Экскурсия по саду</h2>\n  <a class=\"event-card__link\" href=\"#details\">Подробности</a>\n</article>",
          "css": ".event-card { padding: 1rem; border: 1px solid #dce4de; }\n.event-card__date { color: #52745b; }\n.event-card--featured { border-color: #52745b; }",
          "height": 275
        },
        {
          "title": "2. Независимые имена компонентов",
          "html": "<header class=\"site-header\"><a class=\"site-header__brand\">Лаборатория</a><button class=\"site-header__menu-button\">Меню</button></header>\n<article class=\"notice notice--warning\">Проверь адрес перед отправкой.</article>",
          "css": ".site-header { display: flex; justify-content: space-between; }\n.notice { padding: .8rem; }\n.notice--warning { background: #fff3df; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": "<article class=\"event-card__featured\">",
        "good": "<article class=\"event-card event-card--featured\">",
        "why": "Модификатор добавляется к базовому блоку и не заменяет его класс."
      }
    },
    {
      "id": "bem-semantic-class-names",
      "title": "Осмысленные имена классов",
      "text": "<p><strong>Осмысленный класс сообщает, какую роль выполняет элемент.</strong> В примере profile-card — блок, profile-card__name и profile-card__role — его части. Класс button--danger задаёт вариант кнопки удаления, но сам базовый button остаётся в разметке. Слово в class должно быть названием компонента или состояния, а не случайной нумерацией.</p><p>Сравни два имени и представь, что цвет кнопки изменится: danger по-прежнему описывает действие, а red уже станет неверным. Классы не меняют HTML-тег и не создают готовый стиль, пока CSS не содержит подходящее правило. Не называй компонент box1 или span1: через неделю по такому имени трудно найти его смысл.</p>",
      "remember": "Давай классам устойчивые названия по роли элемента и оставляй модификатор рядом с базовым классом.",
      "examples": [
        {
          "title": "1. Имя описывает роль",
          "html": "<article class=\"profile-card\"><h2 class=\"profile-card__name\">Амина</h2><p class=\"profile-card__role\">Исследователь</p></article>",
          "css": ".profile-card { padding: 1rem; }\n.profile-card__name { margin: 0; }\n.profile-card__role { color: #667386; }",
          "height": 275
        },
        {
          "title": "2. Модификатор меняет состояние блока",
          "html": "<button class=\"button button--danger\">Удалить черновик</button>",
          "css": ".button { padding: .7rem 1rem; border-radius: 8px; }\n.button--danger { color: white; background: #a93c3c; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": "<button class=\"red-big-left\">Удалить</button>",
        "good": "<button class=\"button button--danger\">Удалить</button>",
        "why": "Имя по цвету и размеру перестанет подходить, когда внешний вид изменится."
      }
    },
    {
      "id": "component-and-page-scope",
      "title": "Компонентные стили",
      "text": "<p><strong>Компонентный стиль оформляет повторяемый элемент, а стиль страницы — её особую область.</strong> В примере .button и .button--primary подходят разным кнопкам сайта. Класс .about-page ограничивает широкую колонку страницей «О нас», поэтому правило для заголовка не меняет все h1 курса. Комментарии в CSS лишь поясняют назначение фрагментов и сами не подключают никаких ресурсов.</p><p>Проверь селектор: общее правило отвечает за повторное использование, уточняющий родительский класс — за локальное оформление. Если такой компонент появится на другой странице, базовый стиль останется доступным. Не превращай универсальное имя button в правило для одной уникальной страницы, если другие кнопки должны выглядеть иначе.</p>",
      "remember": "Повторяемое оформление держи на классе компонента, частный макет ограничивай классом страницы.",
      "examples": [
        {
          "title": "1. Стили компонента отдельно",
          "html": "<button class=\"button button--primary\">Записаться</button>",
          "css": "/* components/button.css */\n.button { padding: .7rem 1rem; border-radius: 8px; }\n.button--primary { color: white; background: #315f47; }",
          "height": 275
        },
        {
          "title": "2. Стиль конкретной страницы",
          "html": "<main class=\"about-page\"><h1>О нашей мастерской</h1></main>",
          "css": "/* pages/about.css */\n.about-page { max-width: 54rem; margin: 2rem auto; }\n.about-page h1 { color: #315f47; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": "h1 { color: #315f47; } /* нужно только на about */",
        "good": ".about-page h1 { color: #315f47; }",
        "why": "Общий селектор h1 изменит заголовки всех страниц, а родительский класс задаёт нужную область."
      }
    },
    {
      "id": "utility-classes-and-css-cascade",
      "title": "Utility-классы и порядок CSS",
      "text": "<p><strong>Utility-класс отвечает за небольшую повторяемую задачу, а компонентный класс — за целый предмет интерфейса.</strong> В примере stack включает раскладку, gap-md задаёт промежуток, а text-muted меняет тон второстепенного текста. У кнопки button объединяет общее оформление, а button--primary и button--quiet задают варианты.</p><p>Несколько utility можно перечислить в class, но порядок слов в HTML не задаёт очерёдность CSS. Если два правила подходят элементу, браузер учитывает специфичность и источник, затем порядок правил. Повторяющуюся длинную комбинацию удобнее собрать в компонент. Не добавляй классы наугад: каждый должен иметь соответствующее правило и понятную ответственность.</p>",
      "remember": "HTML перечисляет классы без приоритета; результат определяет каскад CSS и специфичность селекторов.",
      "examples": [
        {
          "title": "1. Переиспользуемые utility-классы",
          "html": "<article class=\"card stack gap-md text-muted\">\n  <h2 class=\"text-strong\">Городской сад</h2>\n  <p>Вход открыт с 9 до 18 часов.</p>\n</article>",
          "css": ".stack { display: grid; }\n.gap-md { gap: 1rem; }\n.text-muted { color: #647184; }\n.text-strong { color: #25344d; }",
          "height": 275
        },
        {
          "title": "2. Компонент и его задача",
          "html": "<button class=\"button button--primary\">Сохранить изменения</button>\n<button class=\"button button--quiet\">Отмена</button>",
          "css": ".button { min-height: 44px; padding: .6rem .9rem; border-radius: 8px; }\n.button--primary { color: white; background: #326849; }\n.button--quiet { border: 1px solid #aab5c2; background: white; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": "<p class=\"text-muted text-strong\">Подпись</p>",
        "good": "<p class=\"text-muted\">Подпись</p>",
        "why": "Обе утилиты задают конкурирующий цвет, а позиция класса в HTML не разрешает конфликт."
      }
    },
    {
      "id": "class-roles-and-reuse",
      "title": "Называй роль и переиспользуй нужные классы",
      "text": "<p><strong>Называй класс по роли элемента и переиспользуй только нужные классы.</strong> Хорошее имя помогает найти назначение элемента в HTML и CSS. В примере card отмечает карточку, stack собирает содержимое по вертикали, а container центрирует общий контент и ограничивает его ширину. Эти классы можно сочетать, потому что каждый отвечает за отдельную задачу. Классы не обязаны быть БЭМ, но должны оставаться понятными команде.</p><p>Посмотри, какой стиль действительно нужен двум карточкам, и повторяй только его. Общее имя .container пригодно для страниц, а .red-small-left плохо переживёт редизайн: визуальные детали могут измениться. Не создавай набор утилит для одного-единственного элемента, если проще назвать и оформить полноценный компонент.</p>",
      "remember": "Комбинируй понятные классы по ролям и переиспользуй только действительно общие правила.",
      "examples": [
        {
          "title": "1. Переиспользовать только нужные правила",
          "html": "<article class=\"card stack\"><h2>Экскурсия</h2><p>Продолжительность 45 минут</p></article>",
          "css": ".stack { display: grid; gap: .75rem; }\n.card { padding: 1rem; border: 1px solid #dce3e8; }",
          "height": 275
        },
        {
          "title": "2. Общий контейнер для страниц",
          "html": "<main class=\"container\"><h1>Контакты</h1><p>Мы отвечаем по будням.</p></main>",
          "css": ".container { width: min(100% - 2rem, 68rem); margin-inline: auto; }\n.container p { max-width: 60ch; }",
          "height": 275
        }
      ],
      "mistake": {
        "bad": "<article class=\"box1 red-small-left\">Экскурсия</article>",
        "good": "<article class=\"card stack\">Экскурсия</article>",
        "why": "Случайное имя не объясняет компонент, а цветоразмерное название жёстко привязывает его к виду."
      }
    }
  ],
  "cheatsheet": {
    "lang": "css",
    "code": "/* block */\n.card { padding: 20px; }\n\n/* element */\n.card__title { margin: 0; }\n\n/* modifier */\n.card--featured { border-color: #54785d; }\n\n/* компонент можно переиспользовать на разных страницах */"
  },
  "practice": {
    "intro": "Разметь карточки и навигацию в трёх страницах одного сайта. Используй единые имена классов и не копируй дублирующиеся правила.",
    "stages": [
      {
        "title": "Подготовь основу · Блок, элемент, модификатор",
        "task": "Для проекта «набор карточек экскурсионной программы с общими CSS-компонентами» выполни шаг «Блок, элемент, модификатор»: В БЭМ блок самостоятельный, элемент принадлежит блоку через __, модификатор задаёт вариант через --. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<article class=\"event-card event-card--featured\">», отличает его от ошибки «<article class=\"event-card__featured\">» и объясняет: Модификатор добавляется к базовому блоку и не заменяет его класс."
      },
      {
        "title": "Добавь ключевой приём · Осмысленные имена классов",
        "task": "Для проекта «набор карточек экскурсионной программы с общими CSS-компонентами» выполни шаг «Осмысленные имена классов»: Давай классам устойчивые названия по роли элемента и оставляй модификатор рядом с базовым классом. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<button class=\"button button--danger\">Удалить</button>», отличает его от ошибки «<button class=\"red-big-left\">Удалить</button>» и объясняет: Имя по цвету и размеру перестанет подходить, когда внешний вид изменится."
      },
      {
        "title": "Собери рабочий фрагмент · Порядок файлов и @import",
        "task": "Для проекта «набор карточек экскурсионной программы с общими CSS-компонентами» выполни шаг «Порядок файлов и @import»: Подключай существующие таблицы в предсказуемом порядке и не дублируй один файл разными способами. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<link rel=\"stylesheet\" href=\"css/components.css\">», отличает его от ошибки «<link rel=\"stylesheet\" href=\"css/compnents.css\">» и объясняет: Опечатка в пути не подключит файл, даже если правило внутри написано правильно."
      },
      {
        "title": "Проверь и объясни · Называй роль и переиспользуй нужные классы",
        "task": "Для проекта «набор карточек экскурсионной программы с общими CSS-компонентами» выполни шаг «Называй роль и переиспользуй нужные классы»: Комбинируй понятные классы по ролям и переиспользуй только действительно общие правила. Примени правило к реальному элементу страницы и покажи результат в браузерном предпросмотре.",
        "check": "Контрольная точка: ученик находит в коде «<article class=\"card stack\">Экскурсия</article>», отличает его от ошибки «<article class=\"box1 red-small-left\">Экскурсия</article>» и объясняет: Случайное имя не объясняет компонент, а цветоразмерное название жёстко привязывает его к виду."
      }
    ],
    "hints": [
      "Если застрял на «Блок, элемент, модификатор», проверь правило: В БЭМ блок самостоятельный, элемент принадлежит блоку через __, модификатор задаёт вариант через --. Частая ошибка: <article class=\"event-card__featured\"> — Модификатор добавляется к базовому блоку и не заменяет его класс.",
      "Если застрял на «Осмысленные имена классов», проверь правило: Давай классам устойчивые названия по роли элемента и оставляй модификатор рядом с базовым классом. Частая ошибка: <button class=\"red-big-left\">Удалить</button> — Имя по цвету и размеру перестанет подходить, когда внешний вид изменится.",
      "Если застрял на «Порядок файлов и @import», проверь правило: Подключай существующие таблицы в предсказуемом порядке и не дублируй один файл разными способами. Частая ошибка: <link rel=\"stylesheet\" href=\"css/compnents.css\"> — Опечатка в пути не подключит файл, даже если правило внутри написано правильно."
    ],
    "solution": {
      "html": "<!doctype html>\n<html lang=\"ru\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>БЭМ и организация CSS — практика</title>\n</head>\n<body>\n  <main class=\"page\">\n    <header class=\"hero\"><p class=\"eyebrow\">УЧЕБНЫЙ ПРОЕКТ</p><h1>Небольшую страницу по теме «БЭМ и организация CSS»</h1><p>Небольшой макет, который можно улучшать по шагам.</p><a class=\"action\" href=\"#details\">Посмотреть содержание</a></header>\n    <section class=\"cards\" id=\"details\"><article class=\"card\"><h2>Основная часть</h2><p>Добавь полезное описание и подпись.</p></article><article class=\"card\"><h2>Следующий шаг</h2><p>Проверь поведение при длинном тексте.</p></article></section>\n  </main>\n</body>\n</html>",
      "css": "*{box-sizing:border-box}\nbody{margin:0;padding:24px;background:#f2f5f2;color:#29372f;font:16px/1.6 Arial,sans-serif}\n.page{max-width:900px;margin:auto}\n.hero{padding:clamp(22px,5vw,48px);border-radius:22px;background:#e4efe7}\n.eyebrow{color:#52755d;font-size:.75rem;font-weight:700;letter-spacing:.12em}\nh1{max-width:18ch;font-size:clamp(2rem,6vw,3.6rem);line-height:1.1}\n.action{display:inline-block;padding:10px 14px;border-radius:8px;background:#326649;color:white;text-decoration:none}\n.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;margin-top:18px}\n.card{padding:18px;border:1px solid #d7e0d9;border-radius:14px;background:white}\n@media(max-width:520px){body{padding:14px}}"
    },
    "findError": {
      "code": ".page { width: 1000px; }\n.action { outline: none; }\nimg { width: 400px; }",
      "solution": "<p>Фиксированная ширина переполняет мобильный экран; ограничь контейнер через max-width и оставь width:100%. Не убирай клавиатурный контур без заметной замены. Изображению задай max-width:100% и подходящее соотношение сторон.</p>"
    }
  },
  "can": [
    "Назвать блок, элемент и модификатор в классе.",
    "Придумать классу имя, которое объясняет его роль.",
    "Повторно использовать компонент на другой странице.",
    "Разложить CSS так, чтобы правила было легко найти."
  ],
  "projects": [
    {
      "title": "Страница службы поддержки в стиле БЭМ",
      "about": "Команда продукта просит оформить страницу помощи с карточками тем, поисковой полосой и панелью контактов.",
      "steps": [
        "Раздели интерфейс на блоки и назови элементы по схеме block__element--modifier.",
        "Сделай Flexbox-раскладку для шапки и контактных карточек.",
        "Добавь демонстрационные поля поиска и обратной связи с понятными подписями."
      ],
      "done": [
        "Имена классов описывают компонент, элемент или вариант.",
        "Нет длинных цепочек селекторов по вложенности.",
        "Форма и кнопки имеют понятные роли и состояния."
      ],
      "stretch": "Сделай второй визуальный модификатор карточки через --featured.",
      "example": {
        "title": "Мини-библиотека компонентов",
        "description": "Образец организации CSS: блоки и элементы названы по БЭМ, общие стили собраны отдельно. Это один возможный вариант выполнения задания.",
        "html": "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><meta name=\"description\" content=\"Образец организации CSS: блоки и элементы названы по БЭМ, общие стили собраны отдельно.\"><title>Мини-библиотека компонентов</title><link rel=\"stylesheet\" href=\"./style.css\"></head><body><div class=\"demo demo--lesson-14\"><header class=\"demo-header\"><a class=\"demo-brand\" href=\"#top\">ПРАКТИЧЕСКИЙ ПРИМЕР</a><nav class=\"demo-nav\" aria-label=\"Навигация\"><a href=\"#top\">Обзор</a><a href=\"#details\">Подробности</a></nav></header><main id=\"top\"><section class=\"demo-hero\"><p class=\"eyebrow\">УЧЕБНЫЙ ПРОЕКТ</p><h1 id=\"demo-title\">Мини-библиотека компонентов</h1><p class=\"demo-lead\">Образец организации CSS: блоки и элементы названы по БЭМ, общие стили собраны отдельно.</p></section><section class=\"demo-section\" id=\"details\" aria-labelledby=\"demo-title\"><section class=\"showcase\"><div class=\"project-card project-card--featured\"><p class=\"eyebrow\">КАТАЛОГ · ВЫБОР РЕДАКЦИИ</p><h2 class=\"project-card__title\">Тёплый свет</h2><p class=\"project-card__text\">Путеводитель по маленьким книжным магазинам города.</p><a class=\"button-link\" href=\"#details\">Открыть подборку</a></div><div class=\"project-card\"><p class=\"eyebrow\">НОВАЯ ЗАМЕТКА</p><h2 class=\"project-card__title\">Место у окна</h2><p class=\"project-card__text\">Три тихих кафе, где удобно читать.</p><span class=\"badge\">6 минут</span></div></section></section></main><footer class=\"demo-footer\">Пример для урока 14 · HTML и CSS · локальные учебные материалы</footer></div></body></html>",
        "css": "*{box-sizing:border-box}body{margin:0;padding:clamp(16px,4vw,44px);background:#f1f4f1;color:#26332f;font:16px/1.6 Arial,system-ui,sans-serif}.demo{max-width:1040px;margin:auto;--accent:#8a563d;--paper:#f1f4f1}.demo-header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 0 24px}.demo-brand{color:var(--accent);font-weight:800;text-decoration:none}.demo-nav{display:flex;gap:14px;flex-wrap:wrap}.demo-nav a{color:#475650;text-decoration:none}.demo-nav a:hover,.demo-nav a:focus-visible{color:var(--accent);text-decoration:underline;text-underline-offset:4px}.demo-nav a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}.demo-hero{padding:clamp(22px,5vw,44px);margin-bottom:18px;border-radius:24px;background:linear-gradient(130deg,#ffffff,#ffffffb8);border:1px solid #dfe5e1}.eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.14em;color:var(--accent)}.demo-hero h1{max-width:18ch;font-size:clamp(2rem,5vw,3.5rem);line-height:1.07;margin:.25em 0}.demo-lead{max-width:65ch;color:#59665f}.demo-section{margin:18px 0}.showcase{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px}.demo-footer{margin-top:22px;padding:18px 0;border-top:1px solid #d8dfdb;color:#66716b;font-size:.88rem}img,video,iframe{max-width:100%}.demo-section iframe{display:block;width:100%;height:auto;aspect-ratio:16/9;border:0;border-radius:16px}a{overflow-wrap:anywhere}@media(max-width:560px){body{padding:14px}.demo-header{align-items:flex-start;flex-direction:column}.demo-nav{gap:8px 14px}.showcase{display:flex;flex-direction:column}.showcase>*{width:100%}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}\n.project-card{flex:1 1 18rem;padding:26px;background:white;border:1px solid #eadccf;border-radius:22px}.project-card--featured{background:#fff4e7;border-color:#dfb58e}.project-card__title{margin:.3em 0;font-family:Georgia,serif}.project-card__text{color:#6b5b4c}.button-link{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:999px;background:var(--accent);color:white;text-decoration:none}.badge{display:inline-block;padding:5px 10px;border-radius:99px;background:#efe5db;color:#594536;font-size:.85rem}"
      }
    },
    {
      "title": "Компоненты расписания команды",
      "about": "Организации нужен еженедельный план с карточками мероприятий и единым набором повторно используемых стилей.",
      "steps": [
        "Создай блок schedule с элементами title, day, event и status.",
        "Собери ряды и карточки Flexbox-ом.",
        "Проверь, где исходная папка называет классы «БЭМ», но схема не соблюдается, и исправь выбранную часть."
      ],
      "done": [
        "Одинаковые элементы оформляются общими классами.",
        "Модификатор не копирует весь набор правил базового блока.",
        "Имена соответствуют HTML и CSS."
      ],
      "stretch": "Добавь два состояния события: --upcoming и --cancelled.",
      "example": {
        "title": "Командная страница по БЭМ",
        "description": "Независимые блоки, осмысленные элементы и общий utility-класс для визуального повторного использования. Это один возможный вариант выполнения задания.",
        "html": "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><meta name=\"description\" content=\"Независимые блоки, осмысленные элементы и общий utility-класс для визуального повторного использования.\"><title>Командная страница по БЭМ</title><link rel=\"stylesheet\" href=\"./style.css\"></head><body><div class=\"demo demo--lesson-14\"><header class=\"demo-header\"><a class=\"demo-brand\" href=\"#top\">ПРАКТИЧЕСКИЙ ПРИМЕР</a><nav class=\"demo-nav\" aria-label=\"Навигация\"><a href=\"#top\">Обзор</a><a href=\"#details\">Подробности</a></nav></header><main id=\"top\"><section class=\"demo-hero\"><p class=\"eyebrow\">УЧЕБНЫЙ ПРОЕКТ</p><h1 id=\"demo-title\">Командная страница по БЭМ</h1><p class=\"demo-lead\">Независимые блоки, осмысленные элементы и общий utility-класс для визуального повторного использования.</p></section><section class=\"demo-section\" id=\"details\" aria-labelledby=\"demo-title\"><section class=\"showcase\"><article class=\"team-card\"><img src=\"../assets/riverbank.svg\" alt=\"Река и зелёные берега\" width=\"800\" height=\"520\" loading=\"lazy\"><div class=\"team-card__body\"><span class=\"team-card__role\">ИССЛЕДОВАНИЯ</span><h2 class=\"team-card__name\">Лейла Асанова</h2><p class=\"team-card__bio\">Помогает командам превращать сложные данные в простые истории.</p><a class=\"text-link\" href=\"mailto:team@example.test\">Написать команде</a></div></article><article class=\"team-card team-card--compact\"><img src=\"../assets/mountains.svg\" alt=\"Горный пейзаж\" width=\"800\" height=\"520\" loading=\"lazy\"><div class=\"team-card__body\"><span class=\"team-card__role\">ДИЗАЙН-СИСТЕМА</span><h2 class=\"team-card__name\">Тимур Кадыров</h2><p class=\"team-card__bio\">Следит за едиными компонентами сайта.</p></div></article></section></section></main><footer class=\"demo-footer\">Пример для урока 14 · HTML и CSS · локальные учебные материалы</footer></div></body></html>",
        "css": "*{box-sizing:border-box}body{margin:0;padding:clamp(16px,4vw,44px);background:#f1f4f1;color:#26332f;font:16px/1.6 Arial,system-ui,sans-serif}.demo{max-width:1040px;margin:auto;--accent:#46665a;--paper:#f1f4f1}.demo-header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 0 24px}.demo-brand{color:var(--accent);font-weight:800;text-decoration:none}.demo-nav{display:flex;gap:14px;flex-wrap:wrap}.demo-nav a{color:#475650;text-decoration:none}.demo-nav a:hover,.demo-nav a:focus-visible{color:var(--accent);text-decoration:underline;text-underline-offset:4px}.demo-nav a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}.demo-hero{padding:clamp(22px,5vw,44px);margin-bottom:18px;border-radius:24px;background:linear-gradient(130deg,#ffffff,#ffffffb8);border:1px solid #dfe5e1}.eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.14em;color:var(--accent)}.demo-hero h1{max-width:18ch;font-size:clamp(2rem,5vw,3.5rem);line-height:1.07;margin:.25em 0}.demo-lead{max-width:65ch;color:#59665f}.demo-section{margin:18px 0}.showcase{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px}.demo-footer{margin-top:22px;padding:18px 0;border-top:1px solid #d8dfdb;color:#66716b;font-size:.88rem}img,video,iframe{max-width:100%}.demo-section iframe{display:block;width:100%;height:auto;aspect-ratio:16/9;border:0;border-radius:16px}a{overflow-wrap:anywhere}@media(max-width:560px){body{padding:14px}.demo-header{align-items:flex-start;flex-direction:column}.demo-nav{gap:8px 14px}.showcase{display:flex;flex-direction:column}.showcase>*{width:100%}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}\n.team-card{flex:1 1 19rem;overflow:hidden;border:1px solid #d8e3dc;border-radius:22px;background:white}.team-card img{display:block;width:100%;aspect-ratio:16/8;object-fit:cover}.team-card__body{padding:22px}.team-card__role{font-size:.72rem;font-weight:800;letter-spacing:.12em;color:var(--accent)}.team-card__name{margin:.45rem 0}.team-card__bio{color:#58665f}.team-card--compact .team-card__body{padding:17px}.text-link{color:#245c49;font-weight:700}"
      }
    }
  ],
  "title": "БЭМ: имена классов и структура CSS",
  "goal": "Давай блокам и их частям понятные имена и повторно используй стили на нескольких страницах."
};
