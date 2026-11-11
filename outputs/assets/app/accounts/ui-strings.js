((root, factory) => {
  const strings = factory();
  if (typeof module === 'object' && module.exports) module.exports = strings;
  else root.CourseAccountStrings = strings;
})(typeof window !== 'undefined' ? window : globalThis, () => Object.freeze({
  navigation: Object.freeze({ course: 'Курс', classes: 'Классы', assignments: 'Задания', profile: 'Профиль', logout: 'Выйти' }),
  teacher: Object.freeze({
    title: 'Панель преподавателя', classes: 'Выберите класс', overview: 'Обзор', students: 'Ученики',
    assignments: 'Задания', submissions: 'Проверка', gradebook: 'Журнал', audit: 'История действий',
    reviewGuide: 'После отправки работы открой вкладку «Проверка», оставь комментарий и поставь балл.'
  }),
  student: Object.freeze({ assignments: 'Мои задания', profile: 'Моя история', assignment: 'Практическое задание' }),
  status: Object.freeze({
    submitted: 'На проверке', returned: 'На доработке', accepted: 'Принято', draft: 'Черновик',
    not_submitted: 'Не сдано', not_started: 'Не начато'
  }),
  actions: Object.freeze({ export: 'Экспорт', csv: 'Скачать CSV', json: 'Скачать JSON', retry: 'Повторить загрузку' })
}));
