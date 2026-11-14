(() => {
  const blocks = [
    { id: 1, title: 'HTML и содержание', goal: 'Создавать базовую разметку, смысловые разделы и таблицы.' },
    { id: 2, title: 'CSS и раскладка', goal: 'Оформлять элементы, размещать блоки, собирать сетки и организовывать стили.' },
    { id: 3, title: 'Практические сайты', goal: 'Применять изученные темы в странице отеля, приложению и итоговой странице.' }
  ];
  const lessons = [
    [1, 1, 'HTML с нуля: каркас, текст и ссылки', 'Создай понятную страницу с правильным каркасом, текстом, ссылками, изображениями и списками.', ['<!doctype>', '<head>/<body>', '<h1>–<h6>', '<a href>', '<img alt>', '<ul>/<ol>', '<pre>/<br>']],
    [3, 1, 'Смысловая разметка и таблицы', 'Разделяй страницу на понятные смысловые части и оформляй данные в доступной таблице.', ['<header>/<nav>', '<main>/<section>', '<footer>', '<figure>', '<table>/<tr>', '<th>/<td>', 'scope']],
    [5, 2, 'CSS: селекторы, размеры и оформление', 'Подключай CSS и оформляй элементы с помощью селекторов, размеров, цвета, текста и фона.', ['<link rel="stylesheet">', '.class / tag', 'каскад', 'box-sizing', 'px / rem', 'цвет и рамка', 'font-family', 'background-image']],
    [7, 2, 'Display и position: размещение элементов', 'Пойми обычный поток страницы, виды отображения и то, как позиционировать элементы внутри блока.', ['display: block', 'inline / inline-block', 'normal flow', 'position: relative / absolute', 'fixed / sticky', 'top / left', 'z-index']],
    [29, 2, 'Flexbox: гибкие строки и раскладки', 'Выравнивай элементы по двум осям, переноси их, управляй размером и собирай интерфейсные ряды.', ['display: flex', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap', 'flex-grow / shrink / basis']],
    [23, 2, 'CSS Grid: первые двумерные сетки', 'Создавай строки и колонки, задавай их долями и собирай повторяемые сетки карточек.', ['display: grid', 'grid-template-columns', 'fr', 'repeat()', 'minmax()', 'gap']],
    [13, 2, 'Наведение и CSS-переходы', 'Оформи состояния при наведении и добавь короткие переходы и декоративные псевдоэлементы.', ['вложенные селекторы', ':hover', 'transition', 'transform', '::before / ::after', 'content']],
    [14, 2, 'БЭМ: имена классов и структура CSS', 'Давай блокам и их частям понятные имена и повторно используй стили на нескольких страницах.', ['Блок__Элемент--Модификатор', 'классы по роли', 'компонентные стили', 'общие правила', 'переиспользование']],
    [17, 2, 'Bootstrap: готовая сетка и компоненты', 'Подключай Bootstrap и распознавай его контейнеры, сетку, кнопки и компоненты в HTML.', ['CDN', 'container / row / col', 'breakpoints', 'btn', 'utility-классы', 'собственные стили']],
    [16, 3, 'Практикум: сайт отеля', 'Собери страницу отеля с навигацией, первым экраном, карточками удобств и мобильной проверкой.', ['header / nav', 'якоря', 'Flexbox', 'фон и кнопка', 'карточки']],
    [18, 3, 'Практикум: страница приложения', 'Собери страницу приложения с навигацией по секциям, понятными карточками и футером.', ['навигация', 'hero-секция', 'карточки', 'изображения', 'Bootstrap или собственный CSS']],
    [19, 3, 'Итоговый проект: сайт по макету', 'Повтори выбранный макет из HTML и CSS и объясни, как связаны структура, оформление и сетка.', ['header / nav / footer', 'изображения', 'Flexbox / Grid', 'шрифты и цвета', 'проверка ссылок']]
  ];
  const redirects = {
    2: { lesson: 1, hash: 'link-types-download-anchors' },
    4: { lesson: 3, hash: 'table-rows-cells' },
    6: { lesson: 5, hash: 'color-models-hex-rgb-hsl' },
    8: { lesson: 7, hash: 'absolute-inset-position' },
    9: { lesson: 13, hash: 'transition-state-change' },
    10: { lesson: 7, hash: 'display-inline-block-block' },
    11: { lesson: 16, hash: 'hotel-mobile' },
    12: { lesson: 3, hash: 'semantic-landmarks' },
    15: { lesson: 19, hash: 'portfolio-form' },
    20: { lesson: 1, hash: 'images-alt' },
    21: { lesson: 5, hash: 'font-family-fallback' },
    22: { lesson: 5, hash: 'background-image-cover-position' },
    24: { lesson: 23, hash: 'grid-columns-fractions' },
    25: { lesson: 13, hash: 'pseudo-elements-content' },
    26: { lesson: 13, hash: 'transition-state-change' },
    27: { lesson: 14, hash: 'component-and-page-scope' },
    28: { lesson: 19, hash: 'portfolio-check' }
  };
  const stepRedirects = {
    23: {
      axes: { lesson: 29, hash: 'axes' },
      alignment: { lesson: 29, hash: 'alignment' },
      'spacing-wrap': { lesson: 29, hash: 'spacing-wrap' },
      'flex-values': { lesson: 29, hash: 'flex-values' },
      cards: { lesson: 29, hash: 'cards' },
      interface: { lesson: 29, hash: 'interface' }
    }
  };
  window.COURSE = {
    blocks,
    lessons: lessons.map(([id, block, title, goal, topics], index) => ({ id, number: index + 1, block, type: [16, 18].includes(id) ? 'practicum' : id === 19 ? 'project' : 'lesson', title, goal, topics, minutes: ({ 16: 240, 18: 240, 19: 360, 29: 150, 23: 90 }[id] || 120) })),
    redirects,
    stepRedirects
  };
})();
