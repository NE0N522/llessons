window.LESSONS = window.LESSONS || {};
window.LESSONS[29] = {
  "id": 29,
  "title": "Flexbox: гибкие строки и раскладки",
  "stepNavigation": true,
  "goal": "Расположить элементы по одной оси, распределить свободное место и собрать устойчивые адаптивные компоненты.",
  "learn": [
    "Поймёшь главную и поперечную оси и выберешь правильное свойство выравнивания.",
    "Настроишь перенос, gap и гибкий размер элементов без фиксированной ширины.",
    "Соберёшь реальные шапки, карточки и панели действий и проверишь их на узком экране."
  ],
  "lab": {
    "title": "Лаборатория Flexbox",
    "intro": "Меняй параметры и наблюдай за контейнером. Ниже всегда показаны CSS-правила, которые соответствуют выбранным настройкам.",
    "items": [
      {
        "label": "Пн",
        "text": "4 км"
      },
      {
        "label": "Вт",
        "text": "7 км"
      },
      {
        "label": "Ср",
        "text": "3 км"
      },
      {
        "label": "Чт",
        "text": "9 км"
      }
    ]
  },
  "steps": [
    {
      "id": "axes",
      "title": "Flex-контейнер и его непосредственные дети",
      "text": "<p><strong>Flexbox включается у родителя</strong> правилом <code>display: flex</code>. Этот родитель становится flex-контейнером, а только его непосредственные дети — flex-элементами. Вложенные элементы сами по себе не выстраиваются в ряд: для них можно включить отдельный Flexbox.</p><p>По умолчанию дети располагаются в одну строку. Их высота обычно растягивается до общей высоты строки, а ширина остаётся гибкой. Попробуй включить и выключить <code>display: flex</code> в примере: увидишь разницу между обычным потоком и flex-раскладкой.</p>",
      "examples": [
        {
          "title": "Навигация",
          "note": "Три непосредственных элемента становятся соседями.",
          "html": "<div class=\"demo\"><a href=\"#\">Парк</a><a href=\"#\">Маршруты</a><a href=\"#\">Контакты</a></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Строка поиска",
          "note": "Поле и кнопка стоят рядом как прямые дети.",
          "html": "<div class=\"demo\"><label>Найти тропу</label><button>Искать</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { align-items: stretch; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Автор карточки",
          "note": "Аватар и подпись образуют один flex-ряд.",
          "html": "<div class=\"demo\"><span>АМ</span><b>Алина · 12 мая</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Статус заказа",
          "note": "Соседние прямые элементы можно выровнять по центру.",
          "html": "<div class=\"demo\"><b>Заказ №204</b><span>Собирается</span></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: space-between; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "Свойство `display: flex` задают родителю; flex-элементами становятся только его прямые дети.",
      "mistake": {
        "bad": ".menu a { display: flex; }",
        "good": ".menu { display: flex; }",
        "why": "Правило должно стоять на родителе, если нужно расположить его детей рядом."
      }
    },
    {
      "id": "direction",
      "title": "Главная и поперечная оси",
      "text": "<p><strong>Главная ось</strong> задаёт направление, вдоль которого Flexbox размещает элементы. По умолчанию это горизонталь слева направо. <strong>Поперечная ось</strong> пересекает главную: для строки она вертикальная, для колонки — горизонтальная.</p><p>Это важно для выравнивания: <code>justify-content</code> работает вдоль главной оси, а <code>align-items</code> — поперёк. Сначала определи направление, а потом выбирай свойство. Когда включаешь колонку, роли горизонтали и вертикали для этих свойств меняются.</p>",
      "examples": [
        {
          "title": "Главная ось →",
          "note": "При row элементы идут слева направо.",
          "html": "<div class=\"demo\"><b>Первый</b><b>Второй</b><b>Третий</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-direction: row; align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Колонка ↓",
          "note": "При column главная ось становится вертикальной.",
          "html": "<div class=\"demo\"><b>Первый</b><b>Второй</b><b>Третий</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-direction: column; align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Разворот строки",
          "note": "row-reverse меняет визуальный порядок, но не порядок чтения.",
          "html": "<div class=\"demo\"><b>Первый</b><b>Второй</b><b>Третий</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-direction: row-reverse; align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Разворот колонки",
          "note": "column-reverse часто путает чтение и управление.",
          "html": "<div class=\"demo\"><b>Первый</b><b>Второй</b><b>Третий</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-direction: column-reverse; align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "При `row` главная ось горизонтальная, при `column` — вертикальная; вместе с ней меняется смысл выравнивания.",
      "mistake": {
        "bad": "flex-direction: column-reverse;",
        "good": "Сначала измени порядок элементов в HTML, затем используй flex-direction: column;",
        "why": "Визуальная перестановка может разойтись с клавиатурным и экранным порядком."
      }
    },
    {
      "id": "alignment",
      "title": "Распределяем свободное место по главной оси",
      "text": "<p><strong><code>justify-content</code> распределяет свободное место вдоль главной оси.</strong> При строке это обычно горизонталь, а при колонке — вертикаль. Если места не осталось, свойство не может создать его: элементы могут сжаться или выйти за границы.</p><p>Начинай с простых значений: прижать к началу, поставить в центр или разнести по краям. Значения с <code>space-</code> распределяют свободное пространство между элементами и вокруг них. Для постоянных промежутков между карточками используй <code>gap</code>, а не случайные пробелы через распределение.</p>",
      "examples": [
        {
          "title": "flex-start",
          "note": "Группа прижата к началу главной оси.",
          "html": "<div class=\"demo\"><b>Список</b><b>Карта</b><b>Профиль</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: flex-start; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "center",
          "note": "Группа собрана в центре, если свободное место есть.",
          "html": "<div class=\"demo\"><b>Список</b><b>Карта</b><b>Профиль</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "flex-end",
          "note": "Группа прижата к концу оси.",
          "html": "<div class=\"demo\"><b>Список</b><b>Карта</b><b>Профиль</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: flex-end; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "space-between",
          "note": "Крайние элементы стоят у краёв, промежуток между ними растёт.",
          "html": "<div class=\"demo\"><b>Список</b><b>Карта</b><b>Профиль</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: space-between; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "space-around",
          "note": "Вокруг каждого элемента распределено свободное место.",
          "html": "<div class=\"demo\"><b>Список</b><b>Карта</b><b>Профиль</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: space-around; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "space-evenly",
          "note": "Промежутки между элементами и краями равны.",
          "html": "<div class=\"demo\"><b>Список</b><b>Карта</b><b>Профиль</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { justify-content: space-evenly; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`justify-content` управляет свободным местом вдоль главной оси; для фиксированного промежутка чаще подходит `gap`.",
      "mistake": {
        "bad": "justify-content: space-between; /* создаст одинаковый gap */",
        "good": "gap: 1rem;",
        "why": "space-between распределяет всё свободное место, поэтому расстояние меняется вместе с шириной контейнера."
      }
    },
    {
      "id": "align-items",
      "title": "Выравниваем всю строку по поперечной оси",
      "text": "<p><strong><code>align-items</code> выравнивает элементы поперёк главной оси.</strong> Для строки это обычно вертикальное выравнивание. Если высоты текста или кнопок разные, можно прижать их к началу, поставить по центру или совместить по базовой линии текста.</p><p>Значение <code>stretch</code> растягивает элементы по поперечной оси, когда их размер не задан явно. Оно полезно для карточек в одной строке. Если задать дочернему элементу фиксированную высоту, растягивание уже не будет заметно.</p>",
      "examples": [
        {
          "title": "flex-start",
          "note": "Элементы выровнены по верхнему краю строки.",
          "html": "<div class=\"demo\"><b style=\"font-size:20px\">Маршрут</b><span>4 км · легко</span><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { min-height: 7rem; align-items: flex-start; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "center",
          "note": "Короткая кнопка оказывается по центру высокой подписи.",
          "html": "<div class=\"demo\"><b style=\"font-size:20px\">Маршрут</b><span>4 км · легко</span><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { min-height: 7rem; align-items: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "flex-end",
          "note": "Элементы прижаты к нижнему краю.",
          "html": "<div class=\"demo\"><b style=\"font-size:20px\">Маршрут</b><span>4 км · легко</span><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { min-height: 7rem; align-items: flex-end; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "stretch",
          "note": "Карточки заполняют высоту строки, если высота не задана.",
          "html": "<div class=\"demo\"><b style=\"font-size:20px\">Маршрут</b><span>4 км · легко</span><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { min-height: 7rem; align-items: stretch; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "baseline",
          "note": "Базовые линии текста совпадают, даже при разном размере шрифта.",
          "html": "<div class=\"demo\"><b style=\"font-size:20px\">Маршрут</b><span>4 км · легко</span><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { min-height: 7rem; align-items: baseline; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`align-items` действует на все flex-элементы строки и выравнивает их поперёк главной оси.",
      "mistake": {
        "bad": "align-items: center; /* распределит детей слева направо */",
        "good": "justify-content: center;",
        "why": "align-items работает по поперечной оси; для строки это обычно вертикаль."
      }
    },
    {
      "id": "align-content",
      "title": "Располагаем несколько flex-строк",
      "text": "<p><strong><code>align-content</code> распределяет строки Flexbox по поперечной оси.</strong> Оно проявляется, только когда контейнер имеет несколько строк и заметное свободное место по высоте. Для этого обычно нужны <code>flex-wrap: wrap</code> и заданная или ограниченная высота.</p><p>Не путай это свойство с <code>align-items</code>: последнее выравнивает элементы внутри каждой строки. Если строка одна, <code>align-content</code> почти ничего не изменит. В примерах размер контейнера сделан высоким, чтобы было видно положение групп строк.</p>",
      "examples": [
        {
          "title": "stretch",
          "note": "Свободная высота распределяется между строками.",
          "html": "<div class=\"demo\"><b>Маршрут 1</b><b>Маршрут 2</b><b>Маршрут 3</b><b>Маршрут 4</b><b>Маршрут 5</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 12rem; align-items: center; flex-wrap: wrap; align-content: stretch; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "flex-start",
          "note": "Несколько строк собраны у начала поперечной оси.",
          "html": "<div class=\"demo\"><b>Маршрут 1</b><b>Маршрут 2</b><b>Маршрут 3</b><b>Маршрут 4</b><b>Маршрут 5</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 12rem; align-items: center; flex-wrap: wrap; align-content: flex-start; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "center",
          "note": "Группа строк стоит в центре контейнера.",
          "html": "<div class=\"demo\"><b>Маршрут 1</b><b>Маршрут 2</b><b>Маршрут 3</b><b>Маршрут 4</b><b>Маршрут 5</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 12rem; align-items: center; flex-wrap: wrap; align-content: center; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "space-between",
          "note": "Первая и последняя строки у краёв.",
          "html": "<div class=\"demo\"><b>Маршрут 1</b><b>Маршрут 2</b><b>Маршрут 3</b><b>Маршрут 4</b><b>Маршрут 5</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 12rem; align-items: center; flex-wrap: wrap; align-content: space-between; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "space-around",
          "note": "Свободное место распределяется вокруг каждой строки.",
          "html": "<div class=\"demo\"><b>Маршрут 1</b><b>Маршрут 2</b><b>Маршрут 3</b><b>Маршрут 4</b><b>Маршрут 5</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 12rem; align-items: center; flex-wrap: wrap; align-content: space-around; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "space-evenly",
          "note": "Промежутки между строками и краями одинаковые.",
          "html": "<div class=\"demo\"><b>Маршрут 1</b><b>Маршрут 2</b><b>Маршрут 3</b><b>Маршрут 4</b><b>Маршрут 5</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 12rem; align-items: center; flex-wrap: wrap; align-content: space-evenly; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`align-content` размещает несколько строк; для выравнивания детей внутри одной строки используй `align-items`.",
      "mistake": {
        "bad": ".cards { align-content: center; } /* карточки одной строкой */",
        "good": ".cards { align-items: center; }",
        "why": "align-content не действует на одну flex-строку."
      }
    },
    {
      "id": "align-self",
      "title": "Выравниваем один элемент отдельно",
      "text": "<p><strong><code>align-self</code> переопределяет выравнивание для одного flex-элемента.</strong> Остальные дети продолжают следовать общему <code>align-items</code>. Это удобно, если одну кнопку нужно прижать к низу строки, не меняя выравнивание всех подписей вокруг неё.</p><p>Значение <code>auto</code> наследует поведение контейнера. Другие значения похожи на значения <code>align-items</code>. Свойство работает по поперечной оси и не заменяет <code>margin</code> или <code>justify-content</code>. Проверь примеры, меняя только выделенную карточку.</p>",
      "examples": [
        {
          "title": "auto",
          "note": "Берёт общее выравнивание родителя.",
          "html": "<div class=\"demo\"><b>Название</b><span>Подпись</span><button>Действие</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 7rem; align-items: center; } .demo > :last-child { align-self: auto; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "flex-start",
          "note": "Только эта подпись поднимается к началу строки.",
          "html": "<div class=\"demo\"><b>Название</b><span>Подпись</span><button>Действие</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 7rem; align-items: center; } .demo > :last-child { align-self: flex-start; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "center",
          "note": "Один элемент ставится в центр поперечной оси.",
          "html": "<div class=\"demo\"><b>Название</b><span>Подпись</span><button>Действие</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 7rem; align-items: center; } .demo > :last-child { align-self: center; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "flex-end",
          "note": "Отдельная кнопка прижимается к нижнему краю.",
          "html": "<div class=\"demo\"><b>Название</b><span>Подпись</span><button>Действие</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 7rem; align-items: center; } .demo > :last-child { align-self: flex-end; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "stretch",
          "note": "Выбранный элемент растягивается по поперечной оси.",
          "html": "<div class=\"demo\"><b>Название</b><span>Подпись</span><button>Действие</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { height: 7rem; align-items: center; } .demo > :last-child { align-self: stretch; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`align-self` меняет поперечное выравнивание одного flex-элемента и переопределяет `align-items` только для него.",
      "mistake": {
        "bad": ".card { align-self: center; }",
        "good": ".card { align-self: center; } /* если .card — прямой ребёнок flex-контейнера */",
        "why": "align-self работает только у flex- или grid-элемента, а не у произвольного вложенного потомка."
      }
    },
    {
      "id": "spacing-wrap",
      "title": "Переносим элементы на новую строку",
      "text": "<p><strong>По умолчанию Flexbox старается удержать элементы в одной строке.</strong> Если им не хватает места, они могут сжиматься. Добавь <code>flex-wrap: wrap</code>, когда карточкам нужно переноситься на следующую строку. Контейнер при этом должен иметь ограниченную ширину, иначе перенос не понадобится.</p><p><code>wrap-reverse</code> меняет направление строк по поперечной оси, но редко нужен в обычном интерфейсе. Для адаптивного ряда чаще всего достаточно <code>wrap</code>. На телефоне попробуй уменьшить ширину предпросмотра и проследи, как блоки переходят вниз.</p>",
      "examples": [
        {
          "title": "nowrap",
          "note": "Сохраняет один ряд; элементы могут сжиматься.",
          "html": "<div class=\"demo\"><b>Пн · 4 км</b><b>Вт · 7 км</b><b>Ср · 3 км</b><b>Чт · 9 км</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { max-width: 24rem; flex-wrap: nowrap; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "wrap",
          "note": "Переносит карточки, когда ряд перестаёт помещаться.",
          "html": "<div class=\"demo\"><b>Пн · 4 км</b><b>Вт · 7 км</b><b>Ср · 3 км</b><b>Чт · 9 км</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { max-width: 24rem; flex-wrap: wrap; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "wrap + basis",
          "note": "Основа задаёт желаемую ширину до переноса.",
          "html": "<div class=\"demo\"><b>Пн · 4 км</b><b>Вт · 7 км</b><b>Ср · 3 км</b><b>Чт · 9 км</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { max-width: 24rem; flex-wrap: wrap;} .demo > * { flex: 1 1 8rem; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "wrap-reverse",
          "note": "Строки идут в обратном направлении по поперечной оси.",
          "html": "<div class=\"demo\"><b>Пн · 4 км</b><b>Вт · 7 км</b><b>Ср · 3 км</b><b>Чт · 9 км</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { max-width: 24rem; flex-wrap: wrap-reverse; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        }
      ],
      "remember": "Для ряда адаптивных карточек обычно нужны `display: flex`, `flex-wrap: wrap` и подходящая основа элементов.",
      "mistake": {
        "bad": ".chips { gap: 12px; }",
        "good": ".chips { display: flex; flex-wrap: wrap; gap: 12px; }",
        "why": "gap задаёт расстояние между элементами, но не включает Flexbox и не разрешает перенос."
      }
    },
    {
      "id": "gap",
      "title": "Задаём промежутки между элементами",
      "text": "<p><strong><code>gap</code> задаёт расстояние между соседними элементами или строками.</strong> Это внутренний промежуток группы: по краям контейнера он не добавляется. Поэтому обычно не нужно рассчитывать лишний внешний отступ последнего элемента.</p><p>Можно задать один размер для обоих направлений или два: сначала расстояние между строками, затем между колонками. Свойства <code>row-gap</code> и <code>column-gap</code> позволяют менять только одно направление. <code>gap</code> не создаёт перенос; для него всё ещё нужен <code>flex-wrap</code>.</p>",
      "examples": [
        {
          "title": "Одинаковый gap",
          "note": "Один размер применяется между элементами и строками.",
          "html": "<div class=\"demo\"><b>Сегодня</b><b>Завтра</b><b>На неделе</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; gap: 12px; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Разные направления",
          "note": "Первое значение — между строками, второе — в строке.",
          "html": "<div class=\"demo\"><b>Сегодня</b><b>Завтра</b><b>На неделе</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; gap: 8px 20px; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Только строка",
          "note": "row-gap полезен, если строки должны быть дальше друг от друга.",
          "html": "<div class=\"demo\"><b>Сегодня</b><b>Завтра</b><b>На неделе</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; row-gap: 18px; column-gap: 8px; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Только колонка",
          "note": "column-gap меняет горизонтальные промежутки.",
          "html": "<div class=\"demo\"><b>Сегодня</b><b>Завтра</b><b>На неделе</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; row-gap: 6px; column-gap: 24px; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`gap` — промежуток внутри группы; `padding` находится внутри блока, а `margin` — снаружи.",
      "mistake": {
        "bad": ".menu { margin-right: 12px; } /* на каждом пункте */",
        "good": ".menu { display: flex; gap: 12px; }",
        "why": "gap задаёт единый промежуток между соседями и не добавляет лишний отступ после последнего."
      }
    },
    {
      "id": "flex-values",
      "title": "Управляем основой, ростом и сжатием",
      "text": "<p><strong><code>flex-basis</code> задаёт желаемый начальный размер элемента.</strong> <code>flex-grow</code> определяет, делить ли оставшееся место; <code>flex-shrink</code> — разрешено ли сжиматься, если места не хватает. Эти параметры применяются к прямым flex-элементам.</p><p>Например, поисковая строка может расти, а две кнопки — оставаться по размеру содержимого. Базовый размер не является жёсткой гарантией: свободное место, ограничения ширины и содержимое влияют на итог. В примерах видно, как меняется доля и поведение элементов.</p>",
      "examples": [
        {
          "title": "Основа 8rem",
          "note": "flex-basis задаёт стартовый размер карточки.",
          "html": "<div class=\"demo\"><b>Район</b><b>Длина</b><b>Сложность</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; } .demo > * { flex: 0 1 8rem; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Расти поровну",
          "note": "Одинаковый grow делит свободное место между элементами.",
          "html": "<div class=\"demo\"><b>Район</b><b>Длина</b><b>Сложность</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; } .demo > * { flex: 1 1 8rem; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Поле шире кнопок",
          "note": "Поле растёт, кнопки сохраняют ширину содержимого.",
          "html": "<div class=\"demo\"><b>Район</b><b>Длина</b><b>Сложность</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; } .demo > * { flex: 1 1 12rem;} .demo > :not(:first-child) { flex: 0 0 auto; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Не сжимать",
          "note": "shrink: 0 сохраняет желаемый минимум, поэтому нужен перенос.",
          "html": "<div class=\"demo\"><b>Район</b><b>Длина</b><b>Сложность</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; } .demo > * { flex: 0 0 10rem; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": true
        }
      ],
      "remember": "`flex-basis` — желаемая основа, `grow` делит лишнее место, `shrink` разрешает сжатие.",
      "mistake": {
        "bad": "flex: 1;",
        "good": "flex: 1 1 14rem;",
        "why": "Короткое flex: 1 задаёт нулевую основу; если важно, чтобы карточка начиналась с ширины 14rem, укажи basis явно."
      }
    },
    {
      "id": "flex-shorthand",
      "title": "Читаем сокращение flex",
      "text": "<p><strong>Свойство <code>flex</code> объединяет рост, сжатие и основу.</strong> Запись <code>flex: 0 1 auto</code> означает: не расти, сжиматься при нехватке места, учитывать исходный размер. <code>flex: 1</code> — распространённая запись для равных колонок, которые занимают свободное место.</p><p><code>flex: none</code> запрещает и рост, и сжатие, сохраняя размер содержимого или basis. <code>flex: auto</code> разрешает рост и сжатие с основой по содержимому. Выбирай короткий вариант только когда его смысл подходит, иначе укажи три значения явно.</p>",
      "examples": [
        {
          "title": "initial",
          "note": "Стандартное поведение: не расти, но при необходимости сжиматься.",
          "html": "<div class=\"demo\"><b>Короткий пункт</b><b>Название маршрута подлиннее</b><b>Ещё один</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: nowrap; } .demo > * { flex: initial; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "auto",
          "note": "Элемент может расти и сжиматься, исходный размер — по содержимому.",
          "html": "<div class=\"demo\"><b>Короткий пункт</b><b>Название маршрута подлиннее</b><b>Ещё один</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: nowrap; } .demo > * { flex: auto; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "none",
          "note": "Размер не растёт и не сжимается.",
          "html": "<div class=\"demo\"><b>Короткий пункт</b><b>Название маршрута подлиннее</b><b>Ещё один</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: nowrap; } .demo > * { flex: none; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "равные доли",
          "note": "Дети делят доступное пространство поровну.",
          "html": "<div class=\"demo\"><b>Короткий пункт</b><b>Название маршрута подлиннее</b><b>Ещё один</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: nowrap; } .demo > * { flex: 1; }",
          "height": 280,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`flex` — сокращение для `flex-grow`, `flex-shrink` и `flex-basis`; проверь, какую основу задаёт выбранная запись.",
      "mistake": {
        "bad": ".card { flex-grow: 1; } /* ширина станет ровно 200px */",
        "good": ".card { flex: 0 1 200px; }",
        "why": "grow только делит свободное место и не задаёт точный итоговый размер."
      }
    },
    {
      "id": "interface",
      "title": "Порядок в коде важнее визуальной перестановки",
      "text": "<p><strong>Оставляй элементы в HTML в том порядке, в котором их должны читать и проходить.</strong> Flexbox позволяет изменить визуальное направление через <code>row-reverse</code>, <code>column-reverse</code> и <code>order</code>, но клавиатура и программы чтения экрана могут идти по исходному порядку.</p><p>Используй визуальную перестановку только как декоративный приём, когда она не меняет смысл. Не ставь кнопки или пункты меню в один порядок для мыши и другой для клавиатуры. В примерах сравни визуальное расположение с последовательностью текста в HTML.</p>",
      "examples": [
        {
          "title": "Естественный порядок",
          "note": "Визуальный и HTML-порядок совпадают.",
          "html": "<div class=\"demo\"><a href=\"#\">Основной раздел</a><a href=\"#\">Помощь</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > * { order: 0; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Плохая перестановка",
          "note": "Визуально кнопка первая, но в HTML она последняя.",
          "html": "<div class=\"demo\"><a href=\"#\">Основной раздел</a><a href=\"#\">Помощь</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :last-child { order: -1; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Безопасная группа",
          "note": "Кнопки сохраняют последовательность, заданную в разметке.",
          "html": "<div class=\"demo\"><a href=\"#\">Основной раздел</a><a href=\"#\">Помощь</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-direction: row; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Семантический приоритет",
          "note": "Главное действие первым в HTML; второстепенное следующим.",
          "html": "<div class=\"demo\"><a href=\"#\">Основной раздел</a><a href=\"#\">Помощь</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :first-child { order: 0; } .demo > :last-child { order: 0; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "Визуальный порядок должен поддерживать исходный HTML-порядок, фокус клавиатуры и чтение страницы.",
      "mistake": {
        "bad": ".button--primary { order: -1; }",
        "good": "Поставь основную кнопку первой в HTML и оставь естественный порядок.",
        "why": "CSS не меняет порядок чтения и перехода клавишей Tab."
      }
    },
    {
      "id": "auto-margin",
      "title": "Сдвигаем элемент автоматическим отступом",
      "text": "<p><strong>Автоматический margin забирает свободное место на своей стороне.</strong> Например, <code>margin-left: auto</code> в строке прижимает элемент вправо, а <code>margin-top: auto</code> в колонке сдвигает действие вниз. Этот приём полезен для меню, карточек и панели действий.</p><p>В отличие от <code>justify-content: space-between</code>, автоматический отступ можно назначить только одному элементу и разделить им две группы. Чтобы вертикальный отступ в колонке сработал, контейнеру нужна доступная высота. Избегай фиксированной высоты, если содержимое может быть разным.</p>",
      "examples": [
        {
          "title": "Профиль справа",
          "note": "margin-left: auto забирает свободное место слева.",
          "html": "<div class=\"demo\"><b>Логотип</b><a href=\"#\">Справочник</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :last-child { margin-left: auto; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Действие внизу карточки",
          "note": "Колонка с высотой позволяет margin-top: auto прижать ссылку вниз.",
          "html": "<div class=\"demo\"><b>Логотип</b><a href=\"#\">Справочник</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-direction: column; align-items: stretch; height: 12rem; } .demo > :last-child { margin-top: auto; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Две группы меню",
          "note": "Автоматический отступ делит логотип и ссылки.",
          "html": "<div class=\"demo\"><b>Логотип</b><a href=\"#\">Справочник</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :nth-child(2) { margin-left: auto; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        },
        {
          "title": "Центрирование",
          "note": "Два автоотступа собирают элемент в центре главной оси.",
          "html": "<div class=\"demo\"><b>Логотип</b><a href=\"#\">Справочник</a><button>Войти</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :nth-child(2) { margin-inline: auto; }",
          "height": 260,
          "previewMode": "clean",
          "devicePreview": false
        }
      ],
      "remember": "`margin-inline-start: auto` поглощает свободное место перед элементом; для колонки часто нужен `margin-top: auto`.",
      "mistake": {
        "bad": ".action { margin-top: auto; }",
        "good": ".card { display: flex; flex-direction: column; min-height: 18rem; } .action { margin-top: auto; }",
        "why": "Автоотступу нужна свободная высота контейнера, иначе он не сможет сдвинуть действие."
      }
    },
    {
      "id": "cards",
      "title": "Собираем карточки без жёсткой высоты",
      "text": "<p><strong>Flexbox удобно применять внутри карточки, чтобы управлять её содержимым.</strong> Сам ряд карточек может переноситься и задавать основу через <code>flex</code>, а сама карточка — стать колонкой. Тогда описания остаются естественной высоты, а ссылка с автоматическим верхним отступом располагается ближе к низу.</p><p>Не задавай фиксированную высоту только ради ровного ряда: длинный текст может обрезаться. Сначала используй <code>align-items: stretch</code> у ряда, затем разложи содержимое каждой карточки. Для очень разных данных можно ограничить текст или продумать одинаковую структуру.</p>",
      "examples": [
        {
          "title": "Две карточки",
          "note": "Ряд растягивает элементы до высоты самой высокой карточки.",
          "html": "<div class=\"demo\"><article><b>Сосновая тропа</b><span>4 км · легко</span><a href=\"#\">Открыть</a></article><article><b>К озеру</b><span>8 км · средне</span><a href=\"#\">Открыть</a></article></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; align-items: stretch; } .demo > article { display: flex; flex: 1 1 12rem; flex-direction: column; }",
          "height": 320,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Действие внизу",
          "note": "margin-top: auto удерживает ссылку у основания карточки.",
          "html": "<div class=\"demo\"><article><b>Сосновая тропа</b><span>4 км · легко</span><a href=\"#\">Открыть</a></article><article><b>К озеру</b><span>8 км · средне</span><a href=\"#\">Открыть</a></article></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; align-items: stretch; } .demo > article { display: flex; flex: 1 1 12rem; flex-direction: column; } .demo a { margin-top: auto; }",
          "height": 320,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Мобильный перенос",
          "note": "basis задаёт ширину карточки, а wrap переносит ряд.",
          "html": "<div class=\"demo\"><article><b>Сосновая тропа</b><span>4 км · легко</span><a href=\"#\">Открыть</a></article><article><b>К озеру</b><span>8 км · средне</span><a href=\"#\">Открыть</a></article></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; align-items: stretch; } .demo > article { display: flex; flex: 1 1 10rem; flex-direction: column; }",
          "height": 320,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Длинный текст",
          "note": "min-width: 0 разрешает содержимому сжиматься внутри карточки.",
          "html": "<div class=\"demo\"><article><b>Маршрут вдоль реки и старого леса</b><span>Подробное описание для выходного дня</span><a href=\"#\">Открыть</a></article><article><b>Городской круг</b><span>2 км</span><a href=\"#\">Открыть</a></article></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo { flex-wrap: wrap; align-items: stretch; } .demo > article { min-width: 0; display: flex; flex: 1 1 10rem; flex-direction: column; } .demo article a { margin-top: auto; }",
          "height": 320,
          "previewMode": "clean",
          "devicePreview": true
        }
      ],
      "remember": "Используй переносимый ряд и flex-колонку внутри карточки; для действия часто подходит `margin-top: auto`.",
      "mistake": {
        "bad": ".card { height: 300px; }",
        "good": ".card { display: flex; flex-direction: column; } .card__action { margin-top: auto; }",
        "why": "Фиксированная высота не учитывает более длинный текст и другой размер шрифта."
      }
    },
    {
      "id": "min-width-overflow",
      "title": "Предотвращаем переполнение и сжатие изображений",
      "text": "<p><strong>По умолчанию flex-элемент часто не сжимается меньше минимальной ширины содержимого.</strong> Длинная ссылка или слово может вытолкнуть соседей за экран. У элемента, которому разрешено ужаться, укажи <code>min-width: 0</code>, а тексту при необходимости — перенос.</p><p>Для изображения задай ограничение <code>max-width: 100%</code> и <code>height: auto</code>, чтобы оно не растягивало строку. Не скрывай проблему через горизонтальную прокрутку всей страницы: найди конкретный элемент, который создаёт лишнюю ширину. В примерах смотри на длинные заголовки и карточки.</p>",
      "examples": [
        {
          "title": "Длинный заголовок",
          "note": "min-width: 0 позволяет текстовому блоку занять доступное место.",
          "html": "<div class=\"demo\"><b>Путешествие по маршруту вдоль северного берега озера</b><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :first-child { flex: 1 1 auto; } .demo > :first-child { min-width: 0; overflow-wrap: anywhere; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Фиксированная кнопка",
          "note": "Кнопка не сжимается, текстовый блок может ужаться.",
          "html": "<div class=\"demo\"><b>Маршрут через старый лес и берег озера</b><button>Открыть</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :first-child { flex: 1 1 auto; } .demo > :first-child { min-width: 0; } .demo button { flex: 0 0 auto; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Изображение в строке",
          "note": "Картинка не становится шире своей flex-ячейки.",
          "html": "<div class=\"demo\"><img alt=\"Пейзаж маршрута\" src=\"data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22180%22 viewBox=%220 0 600 180%22%3E%3Crect width=%22600%22 height=%22180%22 fill=%22%23c8d8e8%22/%3E%3Cpath d=%22M0 140 160 50l110 80 120-70 210 90v30H0%22 fill=%22%23719a7b%22/%3E%3C/svg%3E\"><b>Панорама</b></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :first-child { flex: 1 1 auto; } .demo img { flex: 1 1 12rem; min-width: 0; max-width: 100%; height: auto; } .demo > :last-child { flex: 0 0 auto; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": true
        },
        {
          "title": "Карточка без вылета",
          "note": "minmax(0, 1fr) пригодится во внешней Grid-сетке; внутри Flexbox min-width решает похожую задачу.",
          "html": "<div class=\"demo\"><article><b>verylongnamewithoutspaces.example</b><span>Описание</span></article><button>Подробнее</button></div>",
          "css": ".demo { display: flex; align-items: center; gap: .6rem; min-height: 5rem; padding: 1rem; border: 1px solid #dbe3ee; border-radius: 1rem; background: #eef3fa; }\n.demo > * { min-width: 0; padding: .65rem .8rem; border: 1px solid #d7dfeb; border-radius: .65rem; color: #223348; background: #fff; font: 600 14px/1.35 system-ui, sans-serif; }\n.demo > :first-child { flex: 1 1 auto; } .demo > article { min-width: 0; flex: 1 1 auto; } .demo article b { overflow-wrap: anywhere; }",
          "height": 300,
          "previewMode": "clean",
          "devicePreview": true
        }
      ],
      "remember": "`min-width: 0` помогает flex-элементу сжаться, а `max-width: 100%` не даёт изображению раздвинуть строку.",
      "mistake": {
        "bad": ".content { flex: 1; } /* и надеяться, что длинный текст сам сожмётся */",
        "good": ".content { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }",
        "why": "Минимальная ширина по содержимому может быть больше доступного пространства."
      }
    }
  ],
  "quiz": [
    {
      "question": "На какой оси работает justify-content?",
      "answer": "На главной оси. При flex-direction: row это обычно горизонталь, при column — вертикаль."
    },
    {
      "question": "Почему карточки не переносятся, хотя задан gap?",
      "answer": "gap создаёт расстояние, но не разрешает перенос. Добавь flex-wrap: wrap к flex-контейнеру."
    },
    {
      "question": "Когда align-content начинает заметно работать?",
      "answer": "Когда есть несколько flex-строк, например при flex-wrap: wrap, и свободная высота внутри контейнера."
    },
    {
      "question": "Что исправляет min-width: 0 у flex-элемента?",
      "answer": "Разрешает ему сжаться меньше ширины длинного содержимого, чтобы блок не выталкивал страницу за экран."
    }
  ],
  "cheatsheet": {
    "columns": [
      "Свойство",
      "Что управляет",
      "Частый пример"
    ],
    "rows": [
      [
        "display: flex",
        "Детьми контейнера в одну гибкую ось",
        "Навигация или строка действий"
      ],
      [
        "flex-direction",
        "Направлением главной оси",
        "row — строка, column — колонка"
      ],
      [
        "justify-content",
        "Свободным местом по главной оси",
        "space-between — по краям"
      ],
      [
        "align-items",
        "Поперечным выравниванием в каждой строке",
        "center — совместить по центру"
      ],
      [
        "align-content",
        "Положением нескольких строк",
        "center — собрать строки в середине"
      ],
      [
        "align-self",
        "Поперечным положением одного ребёнка",
        "flex-end — прижать к краю"
      ],
      [
        "flex-wrap",
        "Разрешением переноса на следующую строку",
        "wrap — переносить карточки"
      ],
      [
        "gap",
        "Расстоянием между детьми и строками",
        "gap: 12px 20px"
      ],
      [
        "flex",
        "Ростом, сжатием и основой элемента",
        "1 1 14rem — расти и переноситься"
      ],
      [
        "margin-inline-start: auto",
        "Свободным местом перед одним элементом",
        "Отправить профиль в конец меню"
      ]
    ]
  },
  "practice": {
    "intro": "Выбери одну задачу, начни со стартового кода и сверяй каждый пункт чек-листа. Полный вариант открывай после собственной попытки.",
    "tasks": [
      {
        "title": "Шапка туристического сайта",
        "task": "Разложи логотип, навигацию и кнопку. На узком экране меню должно переноситься ниже целыми элементами. Не используй absolute и не меняй порядок HTML.",
        "starter": {
          "html": "<header class=\"site-head\"><a href=\"#\">Тропа</a><nav><a href=\"#routes\">Маршруты</a><a href=\"#about\">О проекте</a><a href=\"#help\">Помощь</a></nav><button>Войти</button></header>",
          "css": ".site-head { /* добавь flex, gap, wrap и выравнивание */ }\n.site-head nav { /* расположи ссылки рядом и разреши им перенос */ }"
        },
        "checklist": [
          "Логотип, ссылки и кнопка стоят рядом на широком экране.",
          "На узкой ширине элементы переносятся без горизонтальной прокрутки.",
          "Порядок клавиши Tab соответствует порядку в HTML."
        ],
        "solution": {
          "html": "<header class=\"site-head\"><a href=\"#\">Тропа</a><nav><a href=\"#routes\">Маршруты</a><a href=\"#about\">О проекте</a><a href=\"#help\">Помощь</a></nav><button>Войти</button></header>",
          "css": ".site-head { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 20px; padding: 16px; }\n.site-head nav { display: flex; flex: 1 1 18rem; flex-wrap: wrap; gap: 8px 16px; }\n.site-head button { margin-inline-start: auto; }"
        }
      },
      {
        "title": "Фильтры, которые не обрезаются",
        "task": "Собери строку фильтров. Когда места мало, каждая кнопка целиком переходит на новую строку. Между кнопками должен быть одинаковый промежуток.",
        "starter": {
          "html": "<div class=\"filters\"><button>Лёгкий маршрут</button><button>У озера</button><button>До пяти километров</button><button>Можно с детьми</button></div>",
          "css": ".filters { /* включи flex и перенос */ }\n.filters button { /* проверь ширину и сжатие */ }"
        },
        "checklist": [
          "У контейнера есть display: flex и flex-wrap: wrap.",
          "Для промежутков используется gap, а не внешние отступы у каждой кнопки.",
          "Длинная подпись не уезжает за край."
        ],
        "solution": {
          "html": "<div class=\"filters\"><button>Лёгкий маршрут</button><button>У озера</button><button>До пяти километров</button><button>Можно с детьми</button></div>",
          "css": ".filters { display: flex; flex-wrap: wrap; gap: 8px; }\n.filters button { min-height: 44px; max-width: 100%; padding: 8px 12px; }"
        }
      },
      {
        "title": "Карточки одинаковой высоты",
        "task": "Сделай ряд из трёх карточек с разными по длине описаниями. Ссылка «Подробнее» должна быть у нижнего края, но карточки не должны иметь фиксированную высоту.",
        "starter": {
          "html": "<section class=\"route-cards\"><article><h2>Сосновая тропа</h2><p>Короткий маршрут.</p><a href=\"#pine\">Подробнее</a></article><article><h2>К озеру</h2><p>Маршрут проходит через лес, смотровую площадку и длинный участок у берега.</p><a href=\"#lake\">Подробнее</a></article><article><h2>Старый город</h2><p>3 км.</p><a href=\"#city\">Подробнее</a></article></section>",
          "css": ".route-cards { /* переносимый ряд карточек */ }\n.route-cards article { /* внутреннее расположение карточки */ }"
        },
        "checklist": [
          "Ряд карточек переносится и растягивает их по высоте строки.",
          "Внутри каждой карточки элементы идут колонкой.",
          "Ссылка использует автоматический верхний отступ, а не фиксированную высоту."
        ],
        "solution": {
          "html": "<section class=\"route-cards\"><article><h2>Сосновая тропа</h2><p>Короткий маршрут.</p><a href=\"#pine\">Подробнее</a></article><article><h2>К озеру</h2><p>Маршрут проходит через лес, смотровую площадку и длинный участок у берега.</p><a href=\"#lake\">Подробнее</a></article><article><h2>Старый город</h2><p>3 км.</p><a href=\"#city\">Подробнее</a></article></section>",
          "css": ".route-cards { display: flex; flex-wrap: wrap; align-items: stretch; gap: 16px; }\n.route-cards article { min-width: 0; flex: 1 1 220px; display: flex; flex-direction: column; padding: 16px; border: 1px solid #d9e1e9; border-radius: 12px; }\n.route-cards p { margin-block: 8px 18px; }\n.route-cards a { margin-top: auto; }"
        }
      },
      {
        "title": "Строка поиска с растущим полем",
        "task": "Оставь кнопку поиска и иконку по размеру содержимого, а полю ввода разреши занимать свободное место и сжиматься на мобильном экране.",
        "starter": {
          "html": "<form class=\"search-row\"><span aria-hidden=\"true\">⌕</span><input aria-label=\"Найти маршрут\" placeholder=\"Название или район\"><button>Искать</button></form>",
          "css": ".search-row { /* разложи поле и кнопку в строку */ }\n.search-row input { /* поле должно расти и сжиматься */ }"
        },
        "checklist": [
          "Поле растёт и заполняет свободное место.",
          "Кнопка и значок не сжимаются.",
          "В контейнере и поле предусмотрено min-width: 0."
        ],
        "solution": {
          "html": "<form class=\"search-row\"><span aria-hidden=\"true\">⌕</span><input aria-label=\"Найти маршрут\" placeholder=\"Название или район\"><button>Искать</button></form>",
          "css": ".search-row { display: flex; align-items: center; gap: 10px; max-width: 34rem; padding: 8px 10px; border: 1px solid #cbd6e3; border-radius: 12px; }\n.search-row input { min-width: 0; flex: 1 1 auto; border: 0; font: inherit; }\n.search-row button, .search-row span { flex: 0 0 auto; }"
        }
      }
    ],
    "hints": [
      "Поставь display:flex на контейнер, который должен располагать детей.",
      "Сначала определи главную ось и только потом выбирай justify-content или align-items.",
      "Проверь min-width у текстовых блоков, flex-wrap у ряда и порядок Tab."
    ]
  },
  "can": [
    "Задать Flexbox родителю и назвать прямых детей flex-элементами.",
    "Выбрать оси и выравнивание для строки или колонки.",
    "Разрешить элементам переноситься и задать промежутки через gap.",
    "Настроить flex-основу, рост и сжатие карточек.",
    "Исправить переполнение длинного текста внутри flex-строки."
  ],
  "projects": [
    {
      "title": "Каталог маршрутов выходного дня",
      "about": "Сделай компактный каталог: шапка, фильтры и карточки, которые перестраиваются без горизонтальной прокрутки.",
      "steps": [
        "Поставь логотип, навигацию и кнопку в одной строке.",
        "Разреши фильтрам переноситься и задай понятный gap.",
        "Собери карточки через flex-basis и переноси их на узком экране.",
        "Проверь порядок клавишей Tab и длинное описание."
      ],
      "done": [
        "Навигация не вытесняет логотип и кнопку.",
        "Фильтры переносятся целыми элементами.",
        "Длинный текст не выталкивает карточку за экран.",
        "Основное действие остаётся последним в исходном порядке чтения."
      ],
      "stretch": "Добавь отдельный календарь маршрутов и сравни Flexbox с Grid.",
      "example": {
        "title": "Каталог маршрутов",
        "description": "Ряд фильтров и адаптивные карточки с устойчивым порядком действий.",
        "html": "<main class=\"catalog\"><header class=\"catalog__head\"><a href=\"#\">Тропа</a><nav><a href=\"#routes\">Маршруты</a><a href=\"#about\">О проекте</a></nav><button>Войти</button></header><section class=\"filters\" aria-label=\"Фильтры\"><button>Лёгкие</button><button>У озера</button><button>До 5 км</button></section><section class=\"routes\" id=\"routes\"><article><h2>Сосновая тропа</h2><p>Тихая прогулка по лесной дороге.</p><a href=\"#pine\">Открыть маршрут</a></article><article><h2>К озеру</h2><p>Смотровая площадка и пикник у воды.</p><a href=\"#lake\">Открыть маршрут</a></article><article><h2>Старый город</h2><p>Короткий маршрут с остановками.</p><a href=\"#city\">Открыть маршрут</a></article></section></main>",
        "css": "body{margin:0;padding:20px;background:#f1f4f8;color:#243348;font:16px/1.5 system-ui,sans-serif}.catalog{max-width:900px;margin:auto}.catalog__head,.catalog__head nav,.filters{display:flex;align-items:center;gap:12px}.catalog__head{justify-content:space-between;flex-wrap:wrap}.catalog__head nav{margin-left:auto}.catalog a{color:#304f86;font-weight:700}.catalog button{min-height:42px;padding:8px 12px;border:1px solid #cbd6e3;border-radius:9px;background:white;color:#243348}.filters{flex-wrap:wrap;margin:22px 0}.routes{display:flex;flex-wrap:wrap;align-items:stretch;gap:14px}.routes article{min-width:0;flex:1 1 220px;display:flex;flex-direction:column;padding:18px;border:1px solid #d8e1ea;border-radius:14px;background:white}.routes h2{margin:0 0 8px;font-size:19px}.routes p{margin:0 0 18px;color:#586a7e}.routes a{margin-top:auto}@media(max-width:560px){body{padding:14px}.catalog__head nav{margin-left:0}.catalog__head{align-items:flex-start}}"
      }
    },
    {
      "title": "Панель задач команды",
      "about": "Собери рабочую панель с показателями, поиском и задачами. Кнопки и данные должны оставаться читаемыми на небольшом экране.",
      "steps": [
        "Разложи заголовок, фильтр и основное действие.",
        "Разреши блокам показателей переноситься.",
        "Поставь задачу и статус в одну flex-строку.",
        "Проверь очень длинное название задачи и мобильную ширину."
      ],
      "done": [
        "Основная кнопка не перекрывает заголовок.",
        "Показатели переносятся целиком.",
        "Статус не выталкивается длинным названием.",
        "HTML- и клавиатурный порядок совпадают."
      ],
      "stretch": "Сделай календарную таблицу задач через Grid, а внутренние строки оставь на Flexbox.",
      "example": {
        "title": "Рабочая панель команды",
        "description": "Сводка и строки задач с переносом содержимого и отдельным статусом.",
        "html": "<main class=\"workspace\"><header class=\"workspace__head\"><div><p>КОМАНДА · НЕДЕЛЯ 18</p><h1>Рабочая панель</h1></div><button>Новая задача</button></header><section class=\"stats\"><article><span>В работе</span><b>8 задач</b></article><article><span>Готово</span><b>14 задач</b></article><article><span>До показа</span><b>3 дня</b></article></section><section class=\"tasks\"><article><div><h2>Проверить страницы каталога на телефоне</h2><p>Дизайн · сегодня</p></div><span>В работе</span></article><article><div><h2>Согласовать тексты</h2><p>Редактура · завтра</p></div><span>Готово</span></article></section></main>",
        "css": "body{margin:0;padding:22px;background:#f1f4f8;color:#243348;font:16px/1.5 system-ui,sans-serif}.workspace{max-width:860px;margin:auto}.workspace__head,.tasks article{display:flex;align-items:center;justify-content:space-between;gap:16px}.workspace__head{flex-wrap:wrap}.workspace__head p{margin:0;color:#65768a;font-size:12px;font-weight:700}.workspace h1{margin:4px 0 18px;font-size:clamp(26px,5vw,38px)}button{min-height:44px;padding:9px 14px;border:0;border-radius:9px;background:#405e9e;color:white;font:inherit;font-weight:700}.stats,.tasks{display:flex;flex-wrap:wrap;align-items:stretch;gap:12px;margin-top:14px}.stats article,.tasks article{min-width:0;flex:1 1 220px;padding:16px;border:1px solid #d9e1e9;border-radius:13px;background:white}.stats article{display:flex;flex-direction:column;gap:5px}.stats span,.tasks p{color:#5d6e80}.tasks article>div{min-width:0}.tasks h2{margin:0;font-size:17px;overflow-wrap:anywhere}.tasks p{margin:5px 0 0}.tasks article>span{flex:0 0 auto;padding:5px 9px;border-radius:99px;background:#edf2ff;color:#344e83;font-size:13px}@media(max-width:540px){body{padding:15px}.workspace__head{align-items:flex-start}.tasks article{align-items:flex-start;flex-direction:column}}"
      }
    }
  ]
};
