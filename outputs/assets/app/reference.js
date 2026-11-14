(() => {
  const lesson = (id, step) => ({ id, step });
  const records = [
  [
    "tag",
    "<html>",
    "Корневой элемент, внутри которого находится весь HTML-документ.",
    [
      "<html lang=\"ru\">"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 3,
        "step": "document-head-metadata"
      }
    ]
  ],
  [
    "tag",
    "<head>",
    "Служебная часть документа: кодировка, название вкладки, настройки экрана и подключение CSS.",
    [
      "<head>…</head>"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 3,
        "step": "document-head-metadata"
      }
    ]
  ],
  [
    "tag",
    "<body>",
    "Содержимое страницы, которое видит посетитель: текст, изображения, формы и другие элементы.",
    [
      "<body>…</body>"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      }
    ]
  ],
  [
    "tag",
    "<title>",
    "Название страницы во вкладке и заголовок документа для браузера.",
    [
      "<title>Мой сайт</title>"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 3,
        "step": "document-head-metadata"
      }
    ]
  ],
  [
    "tag",
    "<meta>",
    "Передаёт служебные сведения: кодировку, ширину области просмотра, описание страницы.",
    [
      "<meta charset=\"utf-8\">"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 3,
        "step": "document-head-metadata"
      }
    ]
  ],
  [
    "tag",
    "<link>",
    "Подключает внешний файл в head; чаще всего таблицу стилей CSS.",
    [
      "<link rel=\"stylesheet\" href=\"style.css\">"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 5,
        "step": "css-rule-connection"
      },
      {
        "id": 17,
        "step": "bootstrap-container-grid"
      }
    ]
  ],
  [
    "tag",
    "<header>",
    "Вводная часть страницы или раздела: название, логотип, навигация или короткое вступление.",
    [
      "<header><h1>Журнал</h1></header>"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      },
      {
        "id": 16,
        "step": "hotel-nav"
      },
      {
        "id": 18,
        "step": "app-header"
      }
    ]
  ],
  [
    "tag",
    "<aside>",
    "Дополнительный, но связанный материал: заметка, подсказка или боковой блок.",
    [
      "<aside>Короткая заметка</aside>"
    ],
    [
      {
        "id": 19,
        "step": "portfolio-content"
      }
    ]
  ],
  [
    "tag",
    "<nav>",
    "Группирует основные навигационные ссылки. Дай нескольким nav понятные названия, если их больше одного.",
    [
      "<nav aria-label=\"Разделы\">…</nav>"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      },
      {
        "id": 16,
        "step": "hotel-nav"
      }
    ]
  ],
  [
    "tag",
    "<main>",
    "Главное содержимое страницы. Обычно на странице один видимый main.",
    [
      "<main>…</main>"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      },
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      }
    ]
  ],
  [
    "tag",
    "<section>",
    "Тематический раздел документа, обычно со своим заголовком.",
    [
      "<section><h2>Новости</h2>…</section>"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      },
      {
        "id": 18,
        "step": "app-sections"
      },
      {
        "id": 19,
        "step": "portfolio-structure"
      }
    ]
  ],
  [
    "tag",
    "<article>",
    "Самостоятельный материал, который можно читать отдельно: статья, новость или карточка публикации.",
    [
      "<article><h2>Заметка</h2>…</article>"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      }
    ]
  ],
  [
    "tag",
    "<footer>",
    "Заключительная часть страницы или самостоятельного раздела.",
    [
      "<footer>Контакты</footer>"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      },
      {
        "id": 18,
        "step": "app-footer"
      },
      {
        "id": 19,
        "step": "portfolio-structure"
      }
    ]
  ],
  [
    "tag",
    "<h1>–<h6>",
    "Заголовки шести уровней. Выбирай уровень по структуре, а размер меняй через CSS.",
    [
      "<h1>Название</h1>"
    ],
    [
      {
        "id": 1,
        "step": "headings-paragraphs"
      },
      {
        "id": 3,
        "step": "semantic-landmarks"
      }
    ]
  ],
  [
    "tag",
    "<p>",
    "Один абзац связного текста. Не используй его только ради отступа вокруг другого элемента.",
    [
      "<p>Текст абзаца.</p>"
    ],
    [
      {
        "id": 1,
        "step": "headings-paragraphs"
      }
    ]
  ],
  [
    "tag",
    "<a>",
    "Создаёт ссылку. href задаёт адрес страницы, файла, почты, телефона или фрагмента документа.",
    [
      "<a href=\"about.html\">О проекте</a>"
    ],
    [
      {
        "id": 1,
        "step": "links-paths"
      },
      {
        "id": 1,
        "step": "link-types-download-anchors"
      }
    ]
  ],
  [
    "tag",
    "<img>",
    "Показывает изображение. Для значимой картинки добавь alt с кратким описанием.",
    [
      "<img src=\"photo.webp\" alt=\"Горная долина\">"
    ],
    [
      {
        "id": 1,
        "step": "images-alt"
      },
      {
        "id": 3,
        "step": "figure-caption-description"
      }
    ]
  ],
  [
    "tag",
    "<figure> и <figcaption>",
    "Группируют изображение или схему и видимую подпись к ним.",
    [
      "<figure><img …><figcaption>Подпись</figcaption></figure>"
    ],
    [
      {
        "id": 3,
        "step": "figure-caption-description"
      }
    ]
  ],
  [
    "tag",
    "<ul>, <ol>, <li>",
    "Создают список: ul без заданного порядка, ol — последовательность; li — каждый пункт.",
    [
      "<ul><li>Первый пункт</li></ul>"
    ],
    [
      {
        "id": 1,
        "step": "html-lists"
      }
    ]
  ],
  [
    "tag",
    "<strong> и <em>",
    "Отмечают важность и смысловое ударение. Для чисто визуального оформления используй CSS.",
    [
      "<strong>Важно</strong>"
    ],
    [
      {
        "id": 1,
        "step": "inline-emphasis"
      },
      {
        "id": 3,
        "step": "semantic-landmarks"
      }
    ]
  ],
  [
    "tag",
    "<pre> и <code>",
    "code отмечает программный фрагмент, а pre сохраняет пробелы и переносы строк.",
    [
      "<pre><code>h1 { color: green; }</code></pre>"
    ],
    [
      {
        "id": 1,
        "step": "whitespace-pre-line-break"
      }
    ]
  ],
  [
    "tag",
    "<br>",
    "Переносит строку внутри одного смыслового блока, например в адресе. Не заменяет абзац или CSS-отступ.",
    [
      "Улица 1<br>Город"
    ],
    [
      {
        "id": 1,
        "step": "whitespace-pre-line-break"
      }
    ]
  ],
  [
    "tag",
    "<table>",
    "Представляет табличные данные в строках и столбцах. Не используй для раскладки всего сайта.",
    [
      "<table>…</table>"
    ],
    [
      {
        "id": 3,
        "step": "table-rows-cells"
      }
    ]
  ],
  [
    "tag",
    "<thead>, <tbody>, <tfoot>",
    "Группируют строки заголовка, основное содержимое и итог таблицы.",
    [
      "<tbody>…</tbody>"
    ],
    [
      {
        "id": 3,
        "step": "table-rows-cells"
      }
    ]
  ],
  [
    "tag",
    "<tr>, <th>, <td>",
    "Строка таблицы, ячейка-заголовок и обычная ячейка с данными.",
    [
      "<tr><th scope=\"col\">День</th><td>Понедельник</td></tr>"
    ],
    [
      {
        "id": 3,
        "step": "table-caption-headers"
      }
    ]
  ],
  [
    "tag",
    "<div> и <span>",
    "Нейтральные контейнеры без собственного смысла: div обычно группирует блок, span — небольшой строчный фрагмент.",
    [
      "<div class=\"card\"><span class=\"badge\">Новое</span></div>"
    ],
    [
      {
        "id": 1,
        "step": "inline-emphasis"
      },
      {
        "id": 5,
        "step": "css-selectors-tag-class-attribute"
      },
      {
        "id": 14,
        "step": "bem-semantic-class-names"
      }
    ]
  ],
  [
    "tag",
    "<style>",
    "Содержит CSS прямо в HTML-документе. Для проекта стили обычно выносят в отдельный файл.",
    [
      "<style>body { color: #243b2c; }</style>"
    ],
    [
      {
        "id": 5,
        "step": "css-rule-connection"
      }
    ]
  ],
  [
    "attribute",
    "lang",
    "Объявляет язык страницы или фрагмента, чтобы браузеры и вспомогательные технологии его распознавали.",
    [
      "<html lang=\"ru\">"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 3,
        "step": "document-head-metadata"
      }
    ]
  ],
  [
    "attribute",
    "charset",
    "Задаёт кодировку документа; для современных страниц обычно UTF-8.",
    [
      "<meta charset=\"utf-8\">"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      }
    ]
  ],
  [
    "attribute",
    "name и content",
    "В meta задают имя метаданных и его значение; используются, например, для viewport и описания.",
    [
      "<meta name=\"description\" content=\"Описание\">"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 3,
        "step": "document-head-metadata"
      }
    ]
  ],
  [
    "attribute",
    "href",
    "Адрес ссылки или файла, подключаемого через link.",
    [
      "<a href=\"#contact\">Контакты</a>"
    ],
    [
      {
        "id": 1,
        "step": "links-paths"
      },
      {
        "id": 1,
        "step": "link-types-download-anchors"
      }
    ]
  ],
  [
    "attribute",
    "src",
    "Путь или URL медиафайла. Относительный путь зависит от расположения текущего HTML-файла.",
    [
      "<img src=\"images/river.webp\" alt=\"Река\">"
    ],
    [
      {
        "id": 1,
        "step": "images-alt"
      }
    ]
  ],
  [
    "attribute",
    "alt",
    "Текстовая альтернатива изображения. Пустой alt уместен для чисто декоративной картинки.",
    [
      "<img src=\"map.webp\" alt=\"Маршрут от школы до парка\">"
    ],
    [
      {
        "id": 1,
        "step": "images-alt"
      },
      {
        "id": 3,
        "step": "figure-caption-description"
      }
    ]
  ],
  [
    "attribute",
    "id",
    "Уникальное имя элемента. Его можно использовать в якорной ссылке и в CSS.",
    [
      "<section id=\"contact\">…</section>"
    ],
    [
      {
        "id": 1,
        "step": "link-types-download-anchors"
      },
      {
        "id": 18,
        "step": "app-sections"
      }
    ]
  ],
  [
    "attribute",
    "class",
    "Даёт элементу имя или несколько имён для CSS и поиска в разметке.",
    [
      "<article class=\"card card--featured\">…</article>"
    ],
    [
      {
        "id": 5,
        "step": "css-selectors-tag-class-attribute"
      },
      {
        "id": 14,
        "step": "bem-semantic-class-names"
      }
    ]
  ],
  [
    "attribute",
    "download, target и rel",
    "Подсказывают скачать файл, выбрать место открытия ссылки и описать её отношение к странице.",
    [
      "<a href=\"guide.pdf\" download>Скачать</a>"
    ],
    [
      {
        "id": 1,
        "step": "link-types-download-anchors"
      }
    ]
  ],
  [
    "property",
    "display",
    "Определяет, как элемент участвует в потоке: block, inline, inline-block, flex, grid и другие режимы.",
    [
      ".menu{display:flex}"
    ],
    [
      {
        "id": 7,
        "step": "display-inline-block-block"
      },
      {
        "id": 23,
        "step": "axes"
      },
      {
        "id": 23,
        "step": "grid-columns-fractions"
      }
    ]
  ],
  [
    "property",
    "position",
    "Меняет способ позиционирования элемента: relative, absolute, fixed или sticky.",
    [
      ".badge{position:absolute;top:8px;right:8px}"
    ],
    [
      {
        "id": 7,
        "step": "relative-offsets-container"
      }
    ]
  ],
  [
    "property",
    "z-index",
    "Управляет порядком наложения в контексте наложения. Очень большое число не пересекает границы родительского контекста.",
    [
      ".popover{z-index:2}"
    ],
    [
      {
        "id": 7,
        "step": "fixed-sticky-position"
      }
    ]
  ],
  [
    "property",
    "box-sizing",
    "Определяет, включает ли заданная ширина внутренний отступ и рамку. Часто применяют border-box.",
    [
      "*{box-sizing:border-box}"
    ],
    [
      {
        "id": 5,
        "step": "box-model-border-box"
      }
    ]
  ],
  [
    "property",
    "margin и padding",
    "margin создаёт внешний отступ за рамкой, padding — внутренний промежуток между рамкой и содержимым.",
    [
      ".card{margin:1rem;padding:1rem}"
    ],
    [
      {
        "id": 5,
        "step": "box-model-border-box"
      },
      {
        "id": 5,
        "step": "color-models-hex-rgb-hsl"
      }
    ]
  ],
  [
    "property",
    "color и background",
    "Задают цвет текста и поверхности. Проверяй контраст во всех состояниях элемента.",
    [
      ".note{color:#243b2c;background:#eef5ef}"
    ],
    [
      {
        "id": 5,
        "step": "border-radius-shape"
      },
      {
        "id": 5,
        "step": "background-image-cover-position"
      }
    ]
  ],
  [
    "property",
    "width, max-width, min-width",
    "Задают ширину или её пределы. max-width часто помогает контенту сжиматься на телефоне.",
    [
      ".page{width:100%;max-width:70rem}"
    ],
    [
      {
        "id": 5,
        "step": "box-model-border-box"
      }
    ]
  ],
  [
    "property",
    "font-family, font-size, rem",
    "Настраивают семейство и размер шрифта. rem считается от размера шрифта корневого элемента.",
    [
      "body{font-family:system-ui,sans-serif;font-size:1rem}"
    ],
    [
      {
        "id": 5,
        "step": "font-family-fallback"
      }
    ]
  ],
  [
    "property",
    "font-weight, font-style, text-align",
    "Настраивают жирность, начертание и выравнивание текста.",
    [
      "h1{font-weight:700;text-align:left}"
    ],
    [
      {
        "id": 5,
        "step": "font-family-fallback"
      }
    ]
  ],
  [
    "property",
    "text-decoration и letter-spacing",
    "Оформляют подчёркивание и расстояние между буквами; не используй это для ухудшения читаемости ссылок.",
    [
      "a{text-decoration:underline}"
    ],
    [
      {
        "id": 1,
        "step": "links-paths"
      }
    ]
  ],
  [
    "property",
    "justify-content и align-items",
    "Выравнивают элементы вдоль главной и поперечной осей Flexbox или Grid.",
    [
      ".row{display:flex;justify-content:space-between;align-items:center}"
    ],
    [
      {
        "id": 23,
        "step": "alignment"
      }
    ]
  ],
  [
    "property",
    "flex, flex-wrap и gap",
    "Настраивают гибкий размер элементов, перенос на новую строку и промежутки Flexbox.",
    [
      ".cards{display:flex;flex-wrap:wrap;gap:1rem}"
    ],
    [
      {
        "id": 23,
        "step": "spacing-wrap"
      }
    ]
  ],
  [
    "property",
    "flex-basis, flex-grow, flex-shrink",
    "Задают начальный размер flex-элемента и его поведение при свободном месте или нехватке пространства.",
    [
      ".card{flex:1 1 14rem}"
    ],
    [
      {
        "id": 23,
        "step": "flex-values"
      }
    ]
  ],
  [
    "property",
    "grid-template-columns и fr",
    "Создают колонки CSS Grid. fr распределяет свободное пространство между дорожками.",
    [
      ".grid{display:grid;grid-template-columns:1fr 2fr}"
    ],
    [
      {
        "id": 23,
        "step": "grid-columns-fractions"
      }
    ]
  ],
  [
    "property",
    "place-items и align-self",
    "Выравнивают все ячейки Grid или один отдельный элемент внутри своей области.",
    [
      ".grid{place-items:center}"
    ],
    [
      {
        "id": 23,
        "step": "alignment"
      }
    ]
  ],
  [
    "property",
    "repeat(), minmax(), auto-fit",
    "Упрощают повторяющиеся адаптивные колонки и задают минимум и максимум дорожки Grid.",
    [
      "repeat(auto-fit,minmax(14rem,1fr))"
    ],
    [
      {
        "id": 23,
        "step": "grid-repeat-minmax"
      }
    ]
  ],
  [
    "property",
    "transform",
    "Сдвигает, масштабирует или поворачивает элемент визуально, не занимая новое место в потоке.",
    [
      ".card:hover{transform:translateY(-3px)}"
    ],
    [
      {
        "id": 13,
        "step": "transform-origin-coordinate"
      },
      {
        "id": 7,
        "step": "absolute-inset-position"
      }
    ]
  ],
  [
    "property",
    "transition",
    "Плавно меняет значения свойства между состояниями. Укажи продолжительность и подходящее свойство.",
    [
      "transition:color .2s ease"
    ],
    [
      {
        "id": 13,
        "step": "transition-state-change"
      }
    ]
  ],
  [
    "property",
    "inset",
    "Краткая запись верхней, правой, нижней и левой координат позиционированного элемента.",
    [
      ".badge{position:absolute;inset:1rem 1rem auto auto}"
    ],
    [
      {
        "id": 7,
        "step": "fixed-sticky-position"
      }
    ]
  ],
  [
    "property",
    "scroll-behavior и scroll-margin-top",
    "Настраивают плавный переход к якорю и отступ цели прокрутки под фиксированной шапкой.",
    [
      "html{scroll-behavior:smooth}"
    ],
    [
      {
        "id": 18,
        "step": "app-sections"
      }
    ]
  ],
  [
    "property",
    "list-style",
    "Меняет маркер или нумерацию списка; не убирай маркер, если список потеряет смысловую структуру.",
    [
      "nav ul{list-style:none}"
    ],
    [
      {
        "id": 1,
        "step": "html-lists"
      }
    ]
  ],
  [
    "property",
    "border-collapse",
    "Определяет, сливаются ли границы соседних ячеек таблицы.",
    [
      "table{border-collapse:collapse}"
    ],
    [
      {
        "id": 3,
        "step": "table-rows-cells"
      }
    ]
  ],
  [
    "property",
    "@media и clamp()",
    "Медиазапрос применяет правила при условии, clamp ограничивает плавно меняемое значение.",
    [
      "font-size:clamp(1.5rem,4vw,3rem)"
    ],
    [
      {
        "id": 5,
        "step": "font-family-fallback"
      }
    ]
  ],
  [
    "selector",
    ":is(), :where(), :has()",
    "Упрощают группы селекторов и проверку вложенного состояния. :where() даёт нулевую специфичность.",
    [
      "form:has(input:invalid){border-color:red}"
    ],
    [
      {
        "id": 13,
        "step": "pseudo-elements-content"
      }
    ]
  ],
  [
    "concept",
    "HTML и CSS",
    "HTML задаёт структуру и смысл, CSS — оформление и раскладку страницы.",
    [
      "<h1>Текст</h1> + h1{color:green}"
    ],
    [
      {
        "id": 1,
        "step": "doctype-lang-metadata"
      },
      {
        "id": 5,
        "step": "css-rule-connection"
      }
    ]
  ],
  [
    "concept",
    "DOM и поток документа",
    "Браузер строит дерево элементов и размещает их в потоке, пока CSS не задаст особые правила раскладки.",
    [
      "header → main → article"
    ],
    [
      {
        "id": 3,
        "step": "semantic-landmarks"
      },
      {
        "id": 7,
        "step": "normal-flow-document-order"
      }
    ]
  ],
  [
    "concept",
    "Каскад и специфичность",
    "Способ разрешения конфликтов CSS с учётом важности, специфичности и порядка правил.",
    [
      ".card h2 { color: green; }"
    ],
    [
      {
        "id": 5,
        "step": "cascade-specificity"
      }
    ]
  ],
  [
    "concept",
    "Модель коробки",
    "Каждый элемент занимает коробку: содержимое, внутренние отступы, рамка и внешние отступы.",
    [
      "content → padding → border → margin"
    ],
    [
      {
        "id": 5,
        "step": "box-model-border-box"
      }
    ]
  ],
  [
    "concept",
    "Контекст наложения",
    "Независимый слой отображения, внутри которого браузер сравнивает z-index дочерних элементов.",
    [
      "position:relative;z-index:1"
    ],
    [
      {
        "id": 7,
        "step": "fixed-sticky-position"
      }
    ]
  ],
  [
    "concept",
    "CSS-переменная var()",
    "Именованное значение CSS, которое можно переиспользовать и менять централизованно.",
    [
      ":root{--accent:#38684d}.button{color:var(--accent)}"
    ],
    [
      {
        "id": 5,
        "step": "cascade-specificity"
      },
      {
        "id": 5,
        "step": "border-radius-shape"
      }
    ]
  ],
  [
    "concept",
    "БЭМ",
    "Соглашение об именах: блок, элемент внутри блока и модификатор состояния.",
    [
      ".card__title, .card--featured"
    ],
    [
      {
        "id": 14,
        "step": "bem-semantic-class-names"
      }
    ]
  ],
  [
    "concept",
    "Bootstrap и CDN",
    "Bootstrap — CSS-библиотека готовых компонентов. CDN загружает файлы библиотеки с внешнего адреса.",
    [
      "container → row → col"
    ],
    [
      {
        "id": 17,
        "step": "bootstrap-container-grid"
      }
    ]
  ]
];
  window.COURSE_REFERENCE = records.map(([type, name, description, examples, refs]) => ({ type, name, description, examples, refs }));
  const list = document.querySelector('[data-reference-list]');
  if (!list || !window.COURSE) return;
  const labels = { tag: 'HTML-тег', attribute: 'HTML-атрибут', property: 'CSS-свойство', selector: 'Селектор и состояние', concept: 'Понятие', extra: 'Дополнительная тема' };
  const entries = records.map(([type, name, description, examples, refs]) => ({ type, name, description, example: examples[0], refs, frequency: new Set(refs.map((ref) => ref.id)).size, notCovered: type === 'extra' }));
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const search = document.querySelector('[data-reference-search]');
  const category = document.querySelector('[data-reference-category]');
  const frequency = document.querySelector('[data-reference-frequency]');
  const sort = document.querySelector('[data-reference-sort]');
  const count = document.querySelector('[data-reference-count]');
  const empty = document.querySelector('[data-reference-empty]');
  const requestedSearch = new URLSearchParams(window.location.search).get('search');
  if (requestedSearch && search) search.value = requestedSearch;
  const courseLesson = (id) => window.COURSE.lessons.find((item) => item.id === id);
  const frequencyText = (entry) => entry.notCovered ? 'Вне текущих уроков' : entry.frequency >= 8 ? `Часто · ${entry.frequency} уроков` : entry.frequency >= 3 ? `Несколько · ${entry.frequency} уроков` : `В ${entry.frequency} ${entry.frequency === 1 ? 'уроке' : 'уроках'}`;
  const frequencyClass = (entry) => entry.notCovered ? 'unused' : entry.frequency >= 8 ? 'frequent' : entry.frequency >= 3 ? 'several' : 'occasional';
  const linkFor = (ref) => {
    const item = courseLesson(ref.id);
    if (!item) return '';
    const number = String(item.number).padStart(2, '0');
    const label = esc(item.title);
    const hash = ref.step ? `#${encodeURIComponent(ref.step)}` : '';
    return `<a href="lesson-view.html?lesson=${ref.id}${hash}" title="${label}">Урок ${number}</a>`;
  };
  const render = () => {
    const query = search.value.trim().toLocaleLowerCase('ru');
    const type = category.value;
    const range = frequency.value;
    const order = sort.value;
    const visible = entries.filter((entry) => {
      const matchesType = type === 'all' || (type === 'extra' ? entry.notCovered : entry.type === type);
      const matchesRange = range === 'all' || (range === 'frequent' && entry.frequency >= 8) || (range === 'several' && entry.frequency >= 3 && entry.frequency <= 7) || (range === 'occasional' && entry.frequency > 0 && entry.frequency <= 2) || (range === 'unused' && entry.frequency === 0);
      return matchesType && matchesRange && `${entry.name} ${entry.description} ${entry.example} ${labels[entry.type]}`.toLocaleLowerCase('ru').includes(query);
    }).sort((a, b) => order === 'alpha' ? a.name.localeCompare(b.name, 'ru') : a.notCovered !== b.notCovered ? (a.notCovered ? 1 : -1) : order === 'asc' ? a.frequency - b.frequency || a.name.localeCompare(b.name, 'ru') : b.frequency - a.frequency || a.name.localeCompare(b.name, 'ru'));
    list.innerHTML = visible.map((entry) => `<article class="reference-card ${entry.notCovered ? 'reference-card-extra' : ''}"><header><div><span class="reference-type">${labels[entry.type]}</span><h2>${esc(entry.name)}</h2></div><span class="reference-frequency ${frequencyClass(entry)}">${frequencyText(entry)}</span></header><p>${esc(entry.description)}</p>${entry.example ? `<pre><code>${esc(entry.example)}</code></pre>` : ''}${entry.refs.length ? `<div class="reference-links"><span>Встречается в:</span>${entry.refs.map(linkFor).join('')}</div>` : '<div class="reference-links"><span>Пока не разбирается в курсе</span></div>'}</article>`).join('');
    count.textContent = `Показано ${visible.length} из ${entries.length} справочных заметок`;
    empty.hidden = visible.length > 0;
  };
  [search, category, frequency, sort].forEach((control) => control.addEventListener(control === search ? 'input' : 'change', render));
  render();
})();
