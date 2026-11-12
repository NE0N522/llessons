const express = require('express');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const {
  requireRole,
  hashPassword,
  recordAudit
} = require('../auth');
const {
  now
} = require('../db');
const {
  assert,
  asId
} = require('../lib/errors');
const {
  text,
  optionalText,
  code,
  login: validateLogin,
  isoDate
} = require('../lib/validation');
const { createBackup, signature } = require('../backup');
const { buildClassWorkbook, createStudentReport } = require('../reports');
const { dateOnly, streakMetrics } = require('../lib/student-metrics');
const ACTIVE_LESSONS = new Set([1, 3, 5, 7, 13, 14, 16, 17, 18, 19, 23]);
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
const CYRILLIC = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya'
};
function generatePassword(length = 14) {
  const bytes = crypto.randomBytes(length);
  return [...bytes].map(byte => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join('');
}
function transliterate(value) {
  return String(value).toLocaleLowerCase('ru').split('').map(character => CYRILLIC[character] ?? character).join('').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').replace(/\.+/g, '.');
}
async function uniqueLogin(db, fullName, reserved = new Set()) {
  const parts = fullName.trim().split(/\s+/);
  const base = transliterate(parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0]).slice(0, 34) || 'student';
  let candidate = base;
  let suffix = 2;
  while (reserved.has(candidate) || (await db.prepare("SELECT 1 FROM users WHERE login=$1 COLLATE NOCASE").get(candidate))) {
    const ending = `.${suffix++}`;
    candidate = `${base.slice(0, 40 - ending.length)}${ending}`;
  }
  reserved.add(candidate);
  return candidate;
}
async function ownedClass(db, teacherId, classId) {
  const row = await db.prepare("SELECT * FROM classes WHERE id=$1 AND teacher_id=$2").get(classId, teacherId);
  assert(row, 404, 'Класс не найден.');
  return row;
}
async function ownedStudent(db, teacherId, studentId) {
  const row = await db.prepare(`SELECT u.*,c.teacher_id,c.name AS class_name,c.school_year FROM users u
    JOIN classes c ON c.id=u.class_id WHERE u.id=$1 AND u.role='student'`).get(studentId);
  assert(row && row.teacher_id === teacherId, 404, 'Ученик не найден.');
  return row;
}
async function ownedAssignment(db, teacherId, assignmentId) {
  const row = await db.prepare(`SELECT a.*,c.teacher_id,c.name AS class_name FROM assignments a
    JOIN classes c ON c.id=a.class_id WHERE a.id=$1 AND c.teacher_id=$2`).get(assignmentId, teacherId);
  assert(row, 404, 'Задание не найдено.');
  return row;
}
function validateChecks(value) {
  const items = Array.isArray(value) ? value.slice(0, 12) : [];
  return items.map(item => {
    assert(item && typeof item === 'object', 400, 'Проверь условия автопроверки.');
    const type = String(item.type || '');
    assert(['exists', 'alt', 'text', 'count', 'style', 'link', 'semantic', 'no_inline', 'class_id'].includes(type), 400, 'Есть неподдерживаемое условие автопроверки.');
    const optionalSelector = ['semantic', 'no_inline', 'class_id'].includes(type);
    const selector = type === 'link' && !item.selector ? 'a[href]' : optionalSelector && !item.selector ? '' : text(String(item.selector || ''), 'CSS-селектор', 160);
    const check = {
      type,
      selector,
      label: optionalText(String(item.label || ''), 'название проверки', 100)
    };
    if (type === 'text') check.text = text(String(item.text || ''), 'искомый текст', 200);
    if (type === 'count') {
      check.min = Math.max(0, Math.min(100, Number(item.min) || 0));
      check.max = item.max == null || item.max === '' ? null : Math.max(check.min, Math.min(100, Number(item.max) || 0));
    }
    if (type === 'style') {
      check.property = text(String(item.property || ''), 'CSS-свойство', 50).toLowerCase();
      assert(/^[a-z][a-z-]*$/.test(check.property), 400, 'Проверь название CSS-свойства.');
      check.value = text(String(item.value || ''), 'значение CSS', 120);
    }
    if (type === 'link') check.href = optionalText(String(item.href || ''), 'адрес ссылки', 300);
    if (type === 'semantic') {
      check.tag = String(item.tag || 'main').toLowerCase();
      assert(['main','header','nav','section','article','aside','footer','figure','address','time'].includes(check.tag), 400, 'Выбери семантический тег из списка.');
    }
    if (type === 'class_id') {
      check.attribute = String(item.attribute || 'class');
      assert(['class','id'].includes(check.attribute), 400, 'Для этой проверки выбери class или id.');
      check.value = text(String(item.value || ''), 'название класса или id', 80);
    }
    return check;
  });
}
function validateHints(value) {
  assert(value == null || Array.isArray(value), 400, 'Подсказки должны быть списком.');
  return (value || []).slice(0, 3).map((hint, index) => text(String(hint || ''), `подсказка ${index + 1}`, 1200));
}
function validateQuiz(value) {
  assert(value == null || Array.isArray(value), 400, 'Вопросы теста должны быть списком.');
  return (value || []).slice(0, 20).map((item, index) => {
    assert(item && typeof item === 'object', 400, `Проверь вопрос ${index + 1}.`);
    const prompt = text(String(item.prompt || ''), `вопрос ${index + 1}`, 500);
    const options = Array.isArray(item.options) ? item.options.slice(0, 6).map((option, n) => text(String(option || ''), `вариант ${n + 1}`, 200)) : [];
    assert(options.length >= 2, 400, `В вопросе ${index + 1} нужно не меньше двух вариантов.`);
    const correct = [...new Set((Array.isArray(item.correct) ? item.correct : []).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < options.length))];
    assert(correct.length > 0, 400, `Отметь верный ответ в вопросе ${index + 1}.`);
    return { prompt, options, correct, explanation: optionalText(String(item.explanation || ''), 'объяснение ответа', 1000), multiple: correct.length > 1 };
  });
}
function normalizeCodeForSimilarity(html, css, starterHtml = '', starterCss = '') {
  const strip = value => String(value || '').replace(/<!--[\s\S]*?-->/g,' ').replace(/\/\*[\s\S]*?\*\//g,' ').toLowerCase().replace(/\s+/g,' ').trim();
  let value = `${strip(html)} ${strip(css)}`;
  const starter = `${strip(starterHtml)} ${strip(starterCss)}`;
  if (starter.trim()) value = value.replace(starter, ' ');
  return value.match(/[a-z0-9_-]+|[^\s]/g) || [];
}
function shingleSimilarity(left, right) {
  const shingles = tokens => {const set=new Set();for(let i=0;i<tokens.length;i+=1)set.add(tokens.slice(i,i+5).join(' '));return set;};
  const a=shingles(left),b=shingles(right);if(!a.size||!b.size)return 0;let common=0;for(const item of a)if(b.has(item))common+=1;return Math.round(common/(a.size+b.size-common)*100);
}
async function createAssignment(db, teacher, classId, body, status = 'draft') {
  const klass = await ownedClass(db, teacher.id, classId);
  assert(!klass.archived, 400, 'В архивный класс нельзя добавлять задания.');
  const title = text(body.title, 'название задания', 120);
  const description = optionalText(body.description, 'описание', 12000);
  const lessonId = body.lesson_id == null || body.lesson_id === '' ? null : Number(body.lesson_id);
  assert(lessonId == null || Number.isInteger(lessonId) && ACTIVE_LESSONS.has(lessonId), 400, 'Выбери урок из программы курса.');
  const starterHtml = code(body.starter_html, 'HTML');
  const starterCss = code(body.starter_css, 'CSS');
  const dueAt = isoDate(body.due_at, true);
  const maxScore = Number(body.max_score ?? 10);
  assert(Number.isInteger(maxScore) && maxScore >= 1 && maxScore <= 100, 400, 'Максимальный балл должен быть от 1 до 100.');
  const targets = Array.isArray(body.student_ids) ? [...new Set(body.student_ids.map(asId))] : [];
  if (targets.length) {
    const placeholders = targets.map((_, index) => `$${2 + index}`).join(',');
    const rows = await db.prepare(`SELECT id FROM users WHERE role='student' AND active=1 AND class_id=$1 AND id IN (${placeholders})`).all(classId, ...targets);
    assert(rows.length === targets.length, 400, 'В списке получателей есть ученик не из этого класса.');
  }
  const checks = validateChecks(body.checks);
  const taskType = String(body.task_type || 'build');
  assert(['build','fix','complete','model','quiz'].includes(taskType), 400, 'Выбери тип задания.');
  const hints = validateHints(body.hints);
  const quiz = validateQuiz(body.quiz);
  assert(taskType !== 'quiz' || quiz.length > 0, 400, 'Для небольшого теста добавь хотя бы один вопрос.');
  const modelHtml = code(body.model_html, 'эталон HTML');
  const modelCss = code(body.model_css, 'эталон CSS');
  const modelPreview = String(body.model_preview || '');
  assert(modelPreview.length <= 280000 && (!modelPreview || /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(modelPreview)), 400, 'Эталон должен быть изображением PNG, JPG или WebP не больше 200 КБ.');
  assert(status !== 'published' || taskType !== 'model' || modelPreview, 400, 'Для публикации задания «Повтори по образцу» добавь изображение образца.');
  const penaltyPerDay = Math.max(0, Math.min(100, Number(body.late_penalty_percent_per_day) || 0));
  const penaltyMax = Math.max(0, Math.min(100, Number(body.late_penalty_max_percent) || 0));
  const timestamp = now();
  const noHints = body.no_hints === true || body.no_hints === 1 || body.no_hints === '1' ? 1 : 0;
  const insert = db.prepare(`INSERT INTO assignments(class_id,title,description,lesson_id,starter_html,starter_css,due_at,max_score,allow_resubmit,no_hints,target_all,status,checks_json,task_type,model_html,model_css,model_preview,quiz_json,hints_json,checklist_autograde,late_penalty_percent_per_day,late_penalty_max_percent,created_at,updated_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`);
  const assignmentId = (await insert.run(classId, title, description, lessonId, starterHtml, starterCss, dueAt, maxScore, body.allow_resubmit === false ? 0 : 1, noHints, targets.length ? 0 : 1, status, JSON.stringify(checks), taskType, modelHtml, modelCss, modelPreview, JSON.stringify(quiz), JSON.stringify(hints), body.checklist_autograde === true || body.checklist_autograde === 1 ? 1 : 0, penaltyPerDay, penaltyMax, timestamp, timestamp)).lastInsertRowid;
  if (targets.length) {
    const addTarget = db.prepare("INSERT INTO assignment_targets(assignment_id,student_id) VALUES($1,$2)");
    for (const studentId of targets) await addTarget.run(assignmentId, studentId);
  }
  if (status === 'published') {
    const recipients = targets.length ? targets : (await db.prepare("SELECT id FROM users WHERE role='student' AND active=1 AND class_id=$1").all(classId)).map(r => r.id);
    const addEvent = db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,created_at) VALUES($1,$2,$3,$4,$5,$6)");
    for (const studentId of recipients) await addEvent.run(studentId, 'assignment', 'Новое задание', title, assignmentId, timestamp);
  }
  return Number(assignmentId);
}
function createTeacherRouter(db) {
  const router = express.Router();
  router.use(requireRole('teacher'));
  router.get('/classes', async (req, res) => {
    const rows = await db.prepare(`SELECT c.id,c.name,c.school_year,c.archived,c.created_at,
      (SELECT COUNT(*) FROM users u WHERE u.class_id=c.id AND u.role='student' AND u.active=1) AS student_count,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=c.id AND s.status='submitted') AS pending_count,
      (SELECT MIN(a.due_at) FROM assignments a WHERE a.class_id=c.id AND a.status='published' AND a.due_at>$1) AS next_due
      FROM classes c WHERE c.teacher_id=$2 ORDER BY c.archived,c.created_at DESC`).all(now(), req.user.id);
    res.json({
      classes: rows
    });
  });
  router.post('/classes', async (req, res) => {
    const name = text(req.body?.name, 'название класса', 60);
    const schoolYear = optionalText(req.body?.school_year, 'учебный год', 20);
    const timestamp = now();
    const result = await db.prepare("INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4)").run(req.user.id, name, schoolYear, timestamp);
    await recordAudit(db, {
      userId: req.user.id,
      classId: Number(result.lastInsertRowid),
      action: 'class.create',
      target: name
    });
    res.status(201).json({
      class: {
        id: Number(result.lastInsertRowid),
        name,
        school_year: schoolYear
      }
    });
  });
  router.patch('/classes/:classId', async (req, res) => {
    const classId = asId(req.params.classId),
      klass = await ownedClass(db, req.user.id, classId);
    if (req.body?.name != null) klass.name = text(req.body.name, 'название класса', 60);
    if (req.body?.school_year != null) klass.school_year = optionalText(req.body.school_year, 'учебный год', 20);
    const wasArchived = Boolean(Number(klass.archived));
    if (req.body?.archived != null) klass.archived = req.body.archived ? 1 : 0;
    await db.prepare("UPDATE classes SET name=$1,school_year=$2,archived=$3 WHERE id=$4").run(klass.name, klass.school_year, klass.archived, classId);
    if (!wasArchived && klass.archived) await db.prepare("UPDATE classes SET closed_at=$1,close_action='archive' WHERE id=$2").run(now(), classId);
    if (wasArchived && !klass.archived) await db.prepare('UPDATE classes SET closed_at=NULL,close_action=NULL,rollover_class_id=NULL WHERE id=$1').run(classId);
    await recordAudit(db, {
      userId: req.user.id,
      classId,
      action: klass.archived ? 'class.archive' : 'class.update',
      target: klass.name
    });
    res.json({
      ok: true
    });
  });
  router.get('/classes/:classId/overview', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const timestamp = new Date();
    timestamp.setHours(0, 0, 0, 0);
    const startOfToday = timestamp.toISOString(), nowAt = now(), soonLimit = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const next = await db.prepare(`SELECT a.id,a.title,a.due_at FROM assignments a WHERE a.class_id=$1 AND a.status='published' AND a.due_at>=$2 ORDER BY a.due_at LIMIT 1`).get(classId, nowAt);
    const counts = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 AND s.status='submitted') AS pending,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$2 AND s.status IN ('accepted','returned') AND s.graded_at>=$3) AS reviewed_today,
      (SELECT COUNT(*) FROM assignments a WHERE a.class_id=$4 AND a.status='published' AND a.due_at>=$5 AND a.due_at<=$6) AS due_soon,
      (SELECT COUNT(*) FROM assignments a JOIN users u ON u.class_id=a.class_id AND u.role='student' AND u.active=1
        WHERE a.class_id=$7 AND a.status='published' AND a.due_at<$8
        AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))
        AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=u.id AND s.status IN ('submitted','returned','accepted'))) AS late`).get(classId, classId, startOfToday, classId, nowAt, soonLimit, classId, nowAt);
    res.json({
      counts,
      next_due: next || null
    });
  });
  router.get('/classes/:classId/students', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const rows = await db.prepare(`SELECT u.id,u.full_name,u.login,u.active,u.created_at,u.last_login_at,u.avatar_url,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 AND s.student_id=u.id AND s.status IN ('submitted','returned','accepted')) AS completed,
      (SELECT COUNT(*) FROM assignments a WHERE a.class_id=$2 AND a.status='published' AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))) AS total,
      (SELECT ROUND(AVG(s.score),1) FROM submissions s WHERE s.student_id=u.id AND s.status='accepted' AND s.score IS NOT NULL) AS average_score,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 AND s.student_id=u.id AND s.status='submitted') AS pending_count,
      (SELECT COUNT(*) FROM assignments a WHERE a.class_id=$2 AND a.status='published' AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))
        AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=u.id AND s.status IN ('submitted','returned','accepted'))) AS missing_count,
      (SELECT COUNT(*) FROM assignments a WHERE a.class_id=$2 AND a.status='published' AND a.due_at<$4 AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))
        AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=u.id AND s.status IN ('submitted','returned','accepted'))) AS overdue_count,
      (SELECT MAX(d.active_on) FROM student_activity_days d WHERE d.user_id=u.id) AS last_active_on
      FROM users u WHERE u.class_id=$3 AND u.role='student' ORDER BY u.active DESC,u.full_name COLLATE NOCASE`).all(classId, classId, classId, now());
    res.json({
      students: rows
    });
  });
  router.post('/classes/:classId/students', async (req, res) => {
    const classId = asId(req.params.classId),
      klass = await ownedClass(db, req.user.id, classId);
    assert(!klass.archived, 400, 'В архивный класс нельзя добавлять учеников.');
    const fullName = text(req.body?.full_name, 'ФИО', 100);
    const login = req.body?.login ? validateLogin(req.body.login) : await uniqueLogin(db, fullName);
    const password = req.body?.password ? text(req.body.password, 'пароль', 200) : generatePassword();
    if (req.body?.password) assert(password.length >= 10, 400, 'Пароль должен содержать не менее 10 символов.');
    const passwordHash = await hashPassword(password),
      timestamp = now();
    const result = await db.prepare(`INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at)
      VALUES('student',$1,$2,$3,$4,1,$5)`).run(login, passwordHash, fullName, classId, timestamp);
    await recordAudit(db, {
      userId: req.user.id,
      classId,
      action: 'student.create',
      target: String(result.lastInsertRowid),
      details: {
        full_name: fullName,
        login
      }
    });
    res.status(201).json({
      credential: {
        id: Number(result.lastInsertRowid),
        full_name: fullName,
        login,
        password
      }
    });
  });
  router.post('/classes/:classId/students/bulk', async (req, res) => {
    const classId = asId(req.params.classId),
      klass = await ownedClass(db, req.user.id, classId);
    assert(!klass.archived, 400, 'В архивный класс нельзя добавлять учеников.');
    const names = Array.isArray(req.body?.names) ? req.body.names.map(name => text(name, 'ФИО', 100)).filter(Boolean) : [];
    assert(names.length >= 1 && names.length <= 50, 400, 'Добавь от 1 до 50 учеников за раз.');
    const reserved = new Set(),
      credentials = [];
    for (const fullName of names) credentials.push({
      full_name: fullName,
      login: await uniqueLogin(db, fullName, reserved),
      password: generatePassword()
    });
    const timestamp = now();
    const prepared = [];
    for (const credential of credentials) prepared.push({
      ...credential,
      password_hash: await hashPassword(credential.password)
    });
    const insert = db.prepare(`INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at)
      VALUES('student',$1,$2,$3,$4,1,$5)`);
    const createMany = db.transaction(async items => Promise.all(items.map(async item => ({
      ...item,
      id: Number((await insert.run(item.login, item.password_hash, item.full_name, classId, timestamp)).lastInsertRowid)
    }))));
    const created = await createMany(prepared);
    await recordAudit(db, {
      userId: req.user.id,
      classId,
      action: 'student.bulk_create',
      target: String(created.length),
      details: {
        logins: created.map(student => student.login)
      }
    });
    res.status(201).json({
      credentials: created.map(({
        id,
        full_name,
        login,
        password
      }) => ({
        id,
        full_name,
        login,
        password
      }))
    });
  });
  router.post('/classes/:classId/students/import', async (req, res) => {
    const classId = asId(req.params.classId), klass = await ownedClass(db, req.user.id, classId);
    assert(!klass.archived, 400, 'В архивный класс нельзя добавлять учеников.');
    const rows = Array.isArray(req.body?.students) ? req.body.students : [];
    assert(rows.length >= 1 && rows.length <= 200, 400, 'Импортируй от 1 до 200 учеников за раз.');
    const names = rows.map(row => text(row?.full_name, 'ФИО', 100));
    const normalizeName = value => value.toLocaleLowerCase('ru').normalize('NFKC').replace(/\s+/g, ' ').trim();
    const nameSet = new Set();
    for (const name of names) {
      const key = normalizeName(name);
      assert(!nameSet.has(key), 400, `В списке повторяется ФИО «${name}».`);
      nameSet.add(key);
    }
    const explicit = rows.map(row => row?.login ? validateLogin(row.login) : '');
    const reserved = new Set();
    for (const login of explicit.filter(Boolean)) {
      const normalized = login.toLocaleLowerCase('en');
      assert(!reserved.has(normalized), 400, `В списке повторяется логин «${login}».`);
      reserved.add(normalized);
      assert(!(await db.prepare('SELECT 1 FROM users WHERE LOWER(login)=LOWER($1)').get(login)), 409, `Логин «${login}» уже используется.`);
    }
    const credentials = [];
    for (let index = 0; index < rows.length; index += 1) credentials.push({
      full_name: names[index],
      login: explicit[index] || await uniqueLogin(db, names[index], reserved),
      password: generatePassword()
    });
    const prepared = [];
    for (const credential of credentials) prepared.push({ ...credential, password_hash: await hashPassword(credential.password) });
    const timestamp = now();
    const createMany = db.transaction(async items => {
      const insert = db.prepare(`INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at)
        VALUES('student',$1,$2,$3,$4,1,$5)`);
      const created = [];
      for (const item of items) created.push({ ...item, id: Number((await insert.run(item.login, item.password_hash, item.full_name, classId, timestamp)).lastInsertRowid) });
      return created;
    });
    const created = await createMany(prepared);
    await recordAudit(db, { userId: req.user.id, classId, action: 'student.import', target: String(created.length), details: { count: created.length } });
    res.status(201).json({ credentials: created.map(({ id, full_name, login, password }) => ({ id, full_name, login, password })) });
  });

  router.post('/students/bulk-actions', async (req, res) => {
    const ids = Array.isArray(req.body?.student_ids) ? [...new Set(req.body.student_ids.map(asId))] : [];
    assert(ids.length >= 1 && ids.length <= 50, 400, 'Выбери от 1 до 50 учеников.');
    const action = String(req.body?.action || '');
    assert(['reset_password', 'move', 'archive'].includes(action), 400, 'Выбери действие для учеников.');
    const placeholders = ids.map((_, index) => `$${index + 2}`).join(',');
    const students = await db.prepare(`SELECT u.id,u.full_name,u.login,u.class_id,c.teacher_id FROM users u JOIN classes c ON c.id=u.class_id
      WHERE u.role='student' AND c.teacher_id=$1 AND u.id IN (${placeholders})`).all(req.user.id, ...ids);
    assert(students.length === ids.length && students.every(student => student.teacher_id === req.user.id), 404, 'Один или несколько учеников не найдены.');
    let credentials = [];
    if (action === 'move') {
      const destinationId = asId(req.body?.class_id), destination = await ownedClass(db, req.user.id, destinationId);
      assert(!destination.archived, 400, 'Нельзя перенести учеников в архивный класс.');
      const move = db.prepare('UPDATE users SET class_id=$1 WHERE id=$2');
      const clear = db.prepare('DELETE FROM sessions WHERE user_id=$1');
      await db.transaction(async () => { for (const student of students) { await move.run(destinationId, student.id); await clear.run(student.id); } })();
    } else if (action === 'archive') {
      const archive = db.prepare('UPDATE users SET active=0 WHERE id=$1');
      const clear = db.prepare('DELETE FROM sessions WHERE user_id=$1');
      await db.transaction(async () => { for (const student of students) { await archive.run(student.id); await clear.run(student.id); } })();
    } else {
      credentials = [];
      for (const student of students) credentials.push({ id: student.id, full_name: student.full_name, login: student.login, password: generatePassword(), password_hash: '' });
      for (const credential of credentials) credential.password_hash = await hashPassword(credential.password);
      const update = db.prepare('UPDATE users SET password_hash=$1,must_change_password=1 WHERE id=$2');
      const clear = db.prepare('DELETE FROM sessions WHERE user_id=$1');
      await db.transaction(async () => { for (const credential of credentials) { await update.run(credential.password_hash, credential.id); await clear.run(credential.id); } })();
    }
    const classIds = [...new Set(students.map(student => student.class_id))];
    for (const classId of classIds) await recordAudit(db, { userId: req.user.id, classId, action: action === 'move' ? 'student.bulk_move' : action === 'archive' ? 'student.bulk_archive' : 'student.bulk_password_reset', target: String(students.length), details: { count: students.length, destination: req.body?.class_id || null } });
    res.json({ ok: true, count: students.length, credentials: credentials.map(({ id, full_name, login, password }) => ({ id, full_name, login, password })) });
  });

  router.get('/students/:studentId/profile', async (req, res) => {
    const studentId = asId(req.params.studentId), student = await ownedStudent(db, req.user.id, studentId);
    const monday = new Date(); monday.setUTCHours(0, 0, 0, 0); monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const [days, grades, progress, history, totals, settings, weeklyDone] = await Promise.all([
      db.prepare('SELECT active_on FROM student_activity_days WHERE user_id=$1 ORDER BY active_on DESC LIMIT 180').all(studentId),
      db.prepare(`SELECT a.id AS assignment_id,a.title,s.score,a.max_score,s.graded_at,s.teacher_comment,s.status,c.name AS class_name,c.school_year FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN classes c ON c.id=a.class_id WHERE s.student_id=$1 AND s.status IN ('accepted','returned') ORDER BY s.graded_at DESC`).all(studentId),
      db.prepare('SELECT lesson_id,step_id,done_at FROM lesson_progress WHERE student_id=$1 ORDER BY lesson_id,done_at').all(studentId),
      db.prepare('SELECT kind,title,details,assignment_id,created_at FROM activity_events WHERE user_id=$1 ORDER BY created_at DESC,id DESC LIMIT 40').all(studentId),
      db.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN s.status IN ('submitted','returned','accepted') THEN 1 ELSE 0 END) AS completed,
        ROUND(AVG(CASE WHEN s.status='accepted' THEN s.score END),1) AS average,
        SUM(CASE WHEN s.status='accepted' THEN 1 ELSE 0 END) AS accepted_count,
        SUM(CASE WHEN s.submitted_at IS NOT NULL AND (a.due_at IS NULL OR s.submitted_at<=a.due_at) THEN 1 ELSE 0 END) AS on_time
        FROM assignments a LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=$1
        WHERE a.class_id=$2 AND a.status='published' AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=$3))`).get(studentId, student.class_id, studentId),
      db.prepare('SELECT weekly_goal,last_course_location FROM user_settings WHERE user_id=$1').get(studentId),
      db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE student_id=$1 AND submitted_at >= $2 AND status IN ('submitted','returned','accepted')").get(studentId, monday.toISOString())
    ]);
    const metrics = streakMetrics(days.map(day => day.active_on));
    const lessonsDone=new Set(progress.filter(item=>item.step_id==='lesson-complete').map(item=>Number(item.lesson_id))).size;
    const achievements=[
      {id:'first-work',title:'Первая работа',description:'Отправь первую работу учителю.',progress:Math.min(1,Number(totals.completed)||0),target:1},
      {id:'five-lessons',title:'Пять уроков',description:'Заверши пять уроков курса.',progress:lessonsDone,target:5},
      {id:'ten-lessons',title:'Десять уроков',description:'Заверши десять уроков курса.',progress:lessonsDone,target:10},
      {id:'first-accepted',title:'Принято учителем',description:'Получи первую принятую работу.',progress:Math.min(1,Number(totals.accepted_count)||0),target:1},
      {id:'five-accepted',title:'Пять готовых работ',description:'Получи пять принятых работ.',progress:Number(totals.accepted_count)||0,target:5},
      {id:'five-day-streak',title:'Пять активных дней',description:'Учись пять дней подряд.',progress:metrics.best_streak,target:5},
      {id:'ten-day-streak',title:'Десять активных дней',description:'Удерживай учебную серию десять дней.',progress:metrics.best_streak,target:10},
      {id:'on-time-three',title:'Всё вовремя',description:'Сдай три работы до срока.',progress:Number(totals.on_time)||0,target:3}
    ].map(item=>({...item,unlocked:item.progress>=item.target,progress:Math.min(item.progress,item.target),progress_label:`${Math.min(item.progress,item.target)} из ${item.target}`}));
    const badges=achievements.filter(item=>item.unlocked);
    const klass = await ownedClass(db, req.user.id, student.class_id);
    res.json({ student: { id: student.id, full_name: student.full_name, login: student.login, avatar_url: student.avatar_url || '', active: Boolean(student.active), class_name: student.class_name, school_year: klass.school_year }, stats: { ...totals, total: Number(totals.total) || 0, completed: Number(totals.completed) || 0, weekly_goal: Number(settings?.weekly_goal) || 3, weekly_done: Number(weeklyDone.count) || 0, ...metrics }, badges, achievements, active_days: days.map(day => dateOnly(day.active_on)), grades, progress, history, last_course_location: settings?.last_course_location || '' });
  });
  router.patch('/students/:studentId', async (req, res) => {
    const studentId = asId(req.params.studentId),
      student = await ownedStudent(db, req.user.id, studentId);
    const fullName = req.body?.full_name == null ? student.full_name : text(req.body.full_name, 'ФИО', 100);
    let classId = student.class_id;
    if (req.body?.class_id != null) {
      classId = asId(req.body.class_id);
      const nextClass = await ownedClass(db, req.user.id, classId);
      assert(!nextClass.archived, 400, 'Нельзя перенести ученика в архивный класс.');
    }
    const active = req.body?.active == null ? student.active : req.body.active ? 1 : 0;
    await db.prepare("UPDATE users SET full_name=$1,class_id=$2,active=$3 WHERE id=$4").run(fullName, classId, active, studentId);
    if (classId !== student.class_id) await db.prepare("DELETE FROM sessions WHERE user_id=$1").run(studentId);
    await recordAudit(db, {
      userId: req.user.id,
      classId: student.class_id,
      action: active ? classId !== student.class_id ? 'student.move' : 'student.update' : 'student.archive',
      target: String(studentId),
      details: {
        from_class: student.class_id,
        to_class: classId,
        full_name: fullName
      }
    });
    res.json({
      ok: true
    });
  });
  router.post('/students/:studentId/reset-password', async (req, res) => {
    const studentId = asId(req.params.studentId),
      student = await ownedStudent(db, req.user.id, studentId);
    const password = generatePassword(),
      passwordHash = await hashPassword(password);
    await db.prepare("UPDATE users SET password_hash=$1,must_change_password=1 WHERE id=$2").run(passwordHash, studentId);
    await db.prepare("DELETE FROM sessions WHERE user_id=$1").run(studentId);
    await recordAudit(db, {
      userId: req.user.id,
      classId: student.class_id,
      action: 'student.password_reset',
      target: String(studentId),
      details: {
        login: student.login
      }
    });
    res.json({
      credential: {
        full_name: student.full_name,
        login: student.login,
        password
      }
    });
  });

  router.post('/students/:studentId/logout-all', async (req, res) => {
    const studentId = asId(req.params.studentId), student = await ownedStudent(db, req.user.id, studentId);
    await db.prepare('DELETE FROM sessions WHERE user_id=$1').run(studentId);
    await recordAudit(db, { userId: req.user.id, classId: student.class_id, action: 'student.logout_all', target: String(studentId) });
    res.json({ ok: true });
  });

  router.get('/students/:studentId/login-events', async (req, res) => {
    const studentId = asId(req.params.studentId);
    await ownedStudent(db, req.user.id, studentId);
    const events = await db.prepare('SELECT occurred_at,success,ip_address,user_agent FROM login_events WHERE user_id=$1 ORDER BY occurred_at DESC LIMIT 25').all(studentId);
    res.json({ events });
  });
  router.delete('/students/:studentId', async (req, res) => {
    const studentId = asId(req.params.studentId),
      student = await ownedStudent(db, req.user.id, studentId);
    assert(req.body?.confirm_name === 'удалить', 400, 'Введи слово «удалить», чтобы подтвердить удаление.');
    await db.transaction(async () => {
      await db.prepare("DELETE FROM login_events WHERE user_id=$1").run(studentId);
      await db.prepare("DELETE FROM audit_log WHERE target=$1 AND class_id=$2 AND action LIKE 'student.%'").run(String(studentId), student.class_id);
      await db.prepare("DELETE FROM users WHERE id=$1").run(studentId);
      await recordAudit(db, { userId: req.user.id, classId: student.class_id, action: 'student.delete_permanent', target: '', details: { removed: true } });
    })();
    res.json({
      ok: true
    });
  });
  router.get('/classes/:classId/assignments', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const rows = await db.prepare(`SELECT a.*,
      (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id AND s.status IN ('submitted','returned','accepted')) AS submitted_count,
      (SELECT COUNT(*) FROM users u WHERE u.class_id=a.class_id AND u.role='student' AND u.active=1 AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))) AS target_count
      FROM assignments a WHERE a.class_id=$1 ORDER BY a.created_at DESC`).all(classId);
    res.json({
      assignments: rows.map(row => ({
        ...row,
        checks: safeJson(row.checks_json, [])
      }))
    });
  });
  router.post('/classes/:classId/assignments', async (req, res) => {
    const classId = asId(req.params.classId);
    const status = req.body?.publish ? 'published' : 'draft';
    const assignmentId = await createAssignment(db, req.user, classId, req.body || {}, status);
    await recordAudit(db, {
      userId: req.user.id,
      classId,
      action: status === 'published' ? 'assignment.publish' : 'assignment.create',
      target: String(assignmentId)
    });
    res.status(201).json({
      assignment_id: assignmentId,
      status
    });
  });
  router.patch('/assignments/:assignmentId', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId),
      old = await ownedAssignment(db, req.user.id, assignmentId);
    assert(old.status === 'draft', 400, 'Опубликованное задание нельзя изменить. Создай его копию.');
    const body = {
      ...old,
      ...req.body
    };
    const title = text(body.title, 'название задания', 120);
    const description = optionalText(body.description, 'описание', 12000);
    const lessonId = body.lesson_id == null || body.lesson_id === '' ? null : Number(body.lesson_id);
    assert(lessonId == null || Number.isInteger(lessonId) && ACTIVE_LESSONS.has(lessonId), 400, 'Выбери урок из программы курса.');
    const starterHtml = code(body.starter_html, 'HTML'),
      starterCss = code(body.starter_css, 'CSS'),
      dueAt = isoDate(body.due_at, true);
    const maxScore = Number(body.max_score ?? 10);
    assert(Number.isInteger(maxScore) && maxScore >= 1 && maxScore <= 100, 400, 'Максимальный балл должен быть от 1 до 100.');
    const targets = Array.isArray(body.student_ids) ? [...new Set(body.student_ids.map(asId))] : [];
    if (targets.length) {
      const marks = targets.map((_, index) => `$${2 + index}`).join(',');
      const valid = await db.prepare(`SELECT id FROM users WHERE role='student' AND active=1 AND class_id=$1 AND id IN (${marks})`).all(old.class_id, ...targets);
      assert(valid.length === targets.length, 400, 'В списке получателей есть ученик не из этого класса.');
    }
    const checks = JSON.stringify(validateChecks(body.checks ?? safeJson(old.checks_json, [])));
    const taskType = String(body.task_type || old.task_type || 'build');
    assert(['build','fix','complete','model','quiz'].includes(taskType), 400, 'Выбери тип задания.');
    const hints = JSON.stringify(validateHints(body.hints ?? safeJson(old.hints_json, [])));
    const quizItems = validateQuiz(body.quiz ?? safeJson(old.quiz_json, []));
    assert(taskType !== 'quiz' || quizItems.length > 0, 400, 'Для небольшого теста добавь хотя бы один вопрос.');
    const modelHtml = code(body.model_html ?? old.model_html, 'эталон HTML');
    const modelCss = code(body.model_css ?? old.model_css, 'эталон CSS');
    const modelPreview = String(body.model_preview ?? old.model_preview ?? '');
    assert(modelPreview.length <= 280000 && (!modelPreview || /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(modelPreview)), 400, 'Эталон должен быть изображением PNG, JPG или WebP не больше 200 КБ.');
    const penaltyPerDay = Math.max(0, Math.min(100, Number(body.late_penalty_percent_per_day ?? old.late_penalty_percent_per_day) || 0));
    const penaltyMax = Math.max(0, Math.min(100, Number(body.late_penalty_max_percent ?? old.late_penalty_max_percent) || 0));
    const update = db.transaction(async () => {
      const noHints = body.no_hints === undefined ? Number(old.no_hints) || 0 : body.no_hints === true || body.no_hints === 1 || body.no_hints === '1' ? 1 : 0;
      await db.prepare(`UPDATE assignments SET title=$1,description=$2,lesson_id=$3,starter_html=$4,starter_css=$5,due_at=$6,max_score=$7,allow_resubmit=$8,no_hints=$9,target_all=$10,checks_json=$11,task_type=$12,model_html=$13,model_css=$14,model_preview=$15,quiz_json=$16,hints_json=$17,checklist_autograde=$18,late_penalty_percent_per_day=$19,late_penalty_max_percent=$20,updated_at=$21 WHERE id=$22`).run(title, description, lessonId, starterHtml, starterCss, dueAt, maxScore, body.allow_resubmit === false || body.allow_resubmit === 0 ? 0 : 1, noHints, targets.length ? 0 : 1, checks, taskType, modelHtml, modelCss, modelPreview, JSON.stringify(quizItems), hints, body.checklist_autograde === true || body.checklist_autograde === 1 ? 1 : 0, penaltyPerDay, penaltyMax, now(), assignmentId);
      await db.prepare("DELETE FROM assignment_targets WHERE assignment_id=$1").run(assignmentId);
      const insertTarget = db.prepare("INSERT INTO assignment_targets(assignment_id,student_id) VALUES($1,$2)");
      for (const studentId of targets) await insertTarget.run(assignmentId, studentId);
    });
    await update();
    await recordAudit(db, {
      userId: req.user.id,
      classId: old.class_id,
      action: 'assignment.update',
      target: String(assignmentId)
    });
    res.json({
      ok: true
    });
  });
  router.post('/assignments/:assignmentId/publish', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId),
      assignment = await ownedAssignment(db, req.user.id, assignmentId);
    assert(assignment.status === 'draft', 400, 'Это задание уже опубликовано или архивировано.');
    assert(assignment.task_type !== 'model' || assignment.model_preview, 400, 'Перед публикацией добавь изображение образца.');
    assert(assignment.task_type !== 'quiz' || safeJson(assignment.quiz_json,[]).length>0, 400, 'Перед публикацией добавь хотя бы один вопрос в тест.');
    await db.prepare("UPDATE assignments SET status='published',updated_at=$1 WHERE id=$2").run(now(), assignmentId);
    const targets = (await db.prepare("SELECT student_id FROM assignment_targets WHERE assignment_id=$1").all(assignmentId)).map(r => r.student_id);
    const students = assignment.target_all ? (await db.prepare("SELECT id FROM users WHERE class_id=$1 AND role='student' AND active=1").all(assignment.class_id)).map(r => r.id) : targets;
    const event = db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,created_at) VALUES($1,$2,$3,$4,$5,$6)");
    for (const studentId of students) await event.run(studentId, 'assignment', 'Новое задание', assignment.title, assignmentId, now());
    await recordAudit(db, {
      userId: req.user.id,
      classId: assignment.class_id,
      action: 'assignment.publish',
      target: String(assignmentId)
    });
    res.json({
      ok: true
    });
  });
  router.post('/assignments/:assignmentId/duplicate', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId),
      assignment = await ownedAssignment(db, req.user.id, assignmentId);
    const destination = asId(req.body?.class_id);
    await ownedClass(db, req.user.id, destination);
    const body = {
      ...assignment,
      title: `${assignment.title} — копия`,
      student_ids: [],
      checks: safeJson(assignment.checks_json, [])
    };
    const copyId = await createAssignment(db, req.user, destination, body, 'draft');
    await recordAudit(db, {
      userId: req.user.id,
      classId: destination,
      action: 'assignment.duplicate',
      target: String(copyId),
      details: {
        source_id: assignmentId
      }
    });
    res.status(201).json({
      assignment_id: copyId
    });
  });
  router.patch('/classes/:classId/similarity', async (req,res)=>{
    const classId=asId(req.params.classId);await ownedClass(db,req.user.id,classId);const enabled=req.body?.enabled===true||req.body?.enabled===1,threshold=Number(req.body?.threshold??75);assert(Number.isInteger(threshold)&&threshold>=25&&threshold<=100,400,'Порог сходства должен быть от 25 до 100 процентов.');await db.prepare('UPDATE classes SET similarity_enabled=$1,similarity_threshold=$2 WHERE id=$3').run(enabled?1:0,threshold,classId);await recordAudit(db,{userId:req.user.id,classId,action:'class.similarity.update',target:String(classId),details:{enabled,threshold}});res.json({enabled,threshold});
  });
  router.get('/classes/:classId/similarity',async(req,res)=>{const classId=asId(req.params.classId),klass=await ownedClass(db,req.user.id,classId);res.json({enabled:Boolean(Number(klass.similarity_enabled)),threshold:Number(klass.similarity_threshold)||75});});
  router.get('/classes/:classId/announcements',async(req,res)=>{const classId=asId(req.params.classId);await ownedClass(db,req.user.id,classId);const announcements=await db.prepare('SELECT id,title,body,pinned,created_at FROM class_announcements WHERE class_id=$1 ORDER BY pinned DESC,created_at DESC').all(classId);res.json({announcements});});
  router.post('/classes/:classId/announcements',async(req,res)=>{const classId=asId(req.params.classId);await ownedClass(db,req.user.id,classId);const title=text(req.body?.title,'заголовок объявления',120),body=text(req.body?.body,'текст объявления',4000),pinned=req.body?.pinned?1:0,timestamp=now();const saved=await db.prepare('INSERT INTO class_announcements(class_id,teacher_id,title,body,pinned,created_at) VALUES($1,$2,$3,$4,$5,$6)').run(classId,req.user.id,title,body,pinned,timestamp);const students=await db.prepare("SELECT id FROM users WHERE class_id=$1 AND role='student' AND active=1").all(classId);for(const student of students)await db.prepare('INSERT INTO activity_events(user_id,kind,title,details,created_at) VALUES($1,$2,$3,$4,$5)').run(student.id,'announcement','Новое объявление',title,timestamp);res.status(201).json({id:Number(saved.lastInsertRowid),title,body,pinned,created_at:timestamp});});
  router.delete('/announcements/:announcementId',async(req,res)=>{const announcementId=asId(req.params.announcementId),row=await db.prepare('SELECT a.id,a.class_id,c.teacher_id FROM class_announcements a JOIN classes c ON c.id=a.class_id WHERE a.id=$1').get(announcementId);assert(row&&row.teacher_id===req.user.id,404,'Объявление не найдено.');await db.prepare('DELETE FROM class_announcements WHERE id=$1').run(announcementId);res.json({ok:true});});
  router.get('/classes/:classId/gallery', async (req, res) => {
    const classId = asId(req.params.classId); await ownedClass(db, req.user.id, classId);
    const projects = await db.prepare(`SELECT g.id,g.title,g.description,g.created_at,u.full_name,a.title AS assignment_title
      FROM class_gallery_projects g JOIN users u ON u.id=g.student_id JOIN assignments a ON a.id=g.assignment_id
      WHERE g.class_id=$1 ORDER BY g.created_at DESC`).all(classId);
    res.json({ projects });
  });
  router.post('/submissions/:submissionId/gallery', async (req, res) => {
    const submissionId = asId(req.params.submissionId);
    const row = await db.prepare(`SELECT s.id,s.student_id,s.assignment_id,a.class_id,a.title AS assignment_title,u.full_name,c.teacher_id,v.html,v.css
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN users u ON u.id=s.student_id JOIN classes c ON c.id=a.class_id
      JOIN submission_versions v ON v.id=(SELECT MAX(v2.id) FROM submission_versions v2 WHERE v2.submission_id=s.id AND v2.kind='submitted')
      WHERE s.id=$1 AND s.status='accepted'`).get(submissionId);
    assert(row && Number(row.teacher_id) === Number(req.user.id), 404, 'Принятая работа не найдена.');
    const title = text(req.body?.title || row.assignment_title, 'название работы в галерее', 120);
    const description = optionalText(String(req.body?.description || ''), 'описание работы', 500);
    const timestamp = now();
    const saved = await db.prepare(`INSERT INTO class_gallery_projects(class_id,student_id,assignment_id,submission_id,title,description,html,css,created_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(submission_id) DO UPDATE SET title=excluded.title,description=excluded.description,html=excluded.html,css=excluded.css,created_at=excluded.created_at RETURNING id`)
      .run(row.class_id,row.student_id,row.assignment_id,submissionId,title,description,row.html||'',row.css||'',timestamp);
    res.status(201).json({ id:Number(saved.lastInsertRowid),title,description });
  });
  router.delete('/gallery/:projectId', async (req, res) => {
    const projectId = asId(req.params.projectId);
    const project = await db.prepare('SELECT g.id,c.teacher_id FROM class_gallery_projects g JOIN classes c ON c.id=g.class_id WHERE g.id=$1').get(projectId);
    assert(project && Number(project.teacher_id) === Number(req.user.id), 404, 'Работа в галерее не найдена.');
    await db.prepare('DELETE FROM class_gallery_projects WHERE id=$1').run(projectId);
    res.json({ ok: true });
  });
  router.get('/assignment-templates', async (req, res) => {
    const templates = await db.prepare('SELECT id,title,updated_at FROM teacher_assignment_templates WHERE teacher_id=$1 ORDER BY title').all(req.user.id);
    res.json({ templates });
  });
  router.get('/assignment-templates/:templateId', async (req, res) => {
    const templateId = asId(req.params.templateId);
    const row = await db.prepare('SELECT id,title,config_json FROM teacher_assignment_templates WHERE id=$1 AND teacher_id=$2').get(templateId, req.user.id);
    assert(row, 404, 'Шаблон задания не найден.');
    res.json({ id: Number(row.id), title: row.title, config: safeJson(row.config_json, {}) });
  });
  router.post('/assignments/:assignmentId/templates', async (req, res) => {
    const assignment = await ownedAssignment(db, req.user.id, asId(req.params.assignmentId));
    const title = text(req.body?.title || assignment.title, 'название шаблона', 100);
    const config = {
      title: assignment.title,
      description: assignment.description,
      lesson_id: assignment.lesson_id,
      max_score: assignment.max_score,
      allow_resubmit: Boolean(Number(assignment.allow_resubmit)),
      no_hints: Boolean(Number(assignment.no_hints)),
      starter_html: assignment.starter_html,
      starter_css: assignment.starter_css,
      checks: safeJson(assignment.checks_json, []),
      task_type: assignment.task_type,
      model_html: assignment.model_html,
      model_css: assignment.model_css,
      model_preview: assignment.model_preview,
      quiz: safeJson(assignment.quiz_json, []),
      hints: safeJson(assignment.hints_json, []),
      checklist_autograde: Boolean(Number(assignment.checklist_autograde)),
      late_penalty_percent_per_day: assignment.late_penalty_percent_per_day,
      late_penalty_max_percent: assignment.late_penalty_max_percent
    };
    const timestamp = now();
    const result = await db.prepare(`INSERT INTO teacher_assignment_templates(teacher_id,title,config_json,created_at,updated_at)
      VALUES($1,$2,$3,$4,$4) ON CONFLICT(teacher_id,title) DO UPDATE SET config_json=excluded.config_json,updated_at=excluded.updated_at RETURNING id`).run(req.user.id, title, JSON.stringify(config), timestamp);
    res.status(201).json({ id: Number(result.lastInsertRowid), title, updated_at: timestamp });
  });
  router.delete('/assignment-templates/:templateId', async (req, res) => {
    await db.prepare('DELETE FROM teacher_assignment_templates WHERE id=$1 AND teacher_id=$2').run(asId(req.params.templateId), req.user.id);
    res.json({ ok: true });
  });
  router.get('/rubric-templates', async (req, res) => {
    const rows = await db.prepare('SELECT id,title,criteria_json,updated_at FROM teacher_rubric_templates WHERE teacher_id=$1 ORDER BY title').all(req.user.id);
    res.json({ templates: rows.map(row => ({ ...row, criteria: safeJson(row.criteria_json, []) })) });
  });
  router.post('/rubric-templates', async (req, res) => {
    const title = text(req.body?.title, 'название критериев', 80);
    assert(Array.isArray(req.body?.criteria) && req.body.criteria.length > 0 && req.body.criteria.length <= 8, 400, 'Добавь от одного до восьми критериев.');
    const criteria = req.body.criteria.map(item => ({
      title: text(item?.title, 'название критерия', 100),
      max_points: Number(item?.max_points),
      description: optionalText(String(item?.description || ''), 'описание критерия', 240)
    }));
    assert(criteria.every(item => Number.isInteger(item.max_points) && item.max_points >= 1 && item.max_points <= 100), 400, 'Для каждого критерия задай целое число баллов от 1 до 100.');
    assert(criteria.reduce((sum, item) => sum + item.max_points, 0) <= 100, 400, 'Сумма критериев не должна превышать 100 баллов.');
    const timestamp = now();
    const saved = await db.prepare(`INSERT INTO teacher_rubric_templates(teacher_id,title,criteria_json,created_at,updated_at)
      VALUES($1,$2,$3,$4,$4) ON CONFLICT(teacher_id,title) DO UPDATE SET criteria_json=excluded.criteria_json,updated_at=excluded.updated_at RETURNING id`).run(req.user.id, title, JSON.stringify(criteria), timestamp);
    res.status(201).json({ id: Number(saved.lastInsertRowid), title, criteria, updated_at: timestamp });
  });
  router.delete('/rubric-templates/:templateId', async (req, res) => {
    await db.prepare('DELETE FROM teacher_rubric_templates WHERE id=$1 AND teacher_id=$2').run(asId(req.params.templateId), req.user.id);
    res.json({ ok: true });
  });
  router.put('/assignments/:assignmentId/students/:studentId/due',async(req,res)=>{const assignmentId=asId(req.params.assignmentId),studentId=asId(req.params.studentId),assignment=await ownedAssignment(db,req.user.id,assignmentId);await ownedStudent(db,req.user.id,studentId);assert((await db.prepare('SELECT 1 FROM assignment_targets WHERE assignment_id=$1 AND student_id=$2').get(assignmentId,studentId))||Number(assignment.target_all),404,'Задание не назначено этому ученику.');const dueAt=isoDate(req.body?.due_at,false),timestamp=now();await db.prepare('INSERT INTO assignment_due_extensions(assignment_id,student_id,due_at,updated_at) VALUES($1,$2,$3,$4) ON CONFLICT(assignment_id,student_id) DO UPDATE SET due_at=excluded.due_at,updated_at=excluded.updated_at').run(assignmentId,studentId,dueAt,timestamp);res.json({due_at:dueAt});});
  router.get('/assignments/:assignmentId/questions',async(req,res)=>{const assignmentId=asId(req.params.assignmentId);await ownedAssignment(db,req.user.id,assignmentId);const questions=await db.prepare(`SELECT q.*,u.full_name FROM assignment_questions q JOIN users u ON u.id=q.student_id WHERE q.assignment_id=$1 ORDER BY q.teacher_read_at IS NULL DESC,q.created_at DESC`).all(assignmentId);await db.prepare('UPDATE assignment_questions SET teacher_read_at=$1 WHERE assignment_id=$2 AND teacher_read_at IS NULL').run(now(),assignmentId);res.json({questions});});
  router.post('/questions/:questionId/reply',async(req,res)=>{const questionId=asId(req.params.questionId),row=await db.prepare('SELECT q.*,a.class_id,c.teacher_id FROM assignment_questions q JOIN assignments a ON a.id=q.assignment_id JOIN classes c ON c.id=a.class_id WHERE q.id=$1').get(questionId);assert(row&&row.teacher_id===req.user.id,404,'Вопрос не найден.');const reply=text(req.body?.reply,'ответ',2000),replyPublic=Boolean(req.body?.reply_public),timestamp=now();await db.prepare('UPDATE assignment_questions SET teacher_reply=$1,reply_public=$2,replied_at=$3,student_read_at=NULL WHERE id=$4').run(reply,replyPublic?1:0,timestamp,questionId);await db.prepare('INSERT INTO activity_events(user_id,kind,title,details,assignment_id,created_at) VALUES($1,$2,$3,$4,$5,$6)').run(row.student_id,'question_reply','Ответ учителя на вопрос',reply,row.assignment_id,timestamp);res.json({ok:true,replied_at:timestamp,reply_public:replyPublic});});
  router.get('/comment-templates',async(req,res)=>{const templates=await db.prepare('SELECT id,title,body,created_at,updated_at FROM teacher_comment_templates WHERE teacher_id=$1 ORDER BY title').all(req.user.id);res.json({templates});});
  router.post('/comment-templates',async(req,res)=>{const title=text(req.body?.title,'название заготовки',80),body=text(req.body?.body,'текст заготовки',2000),timestamp=now();const saved=await db.prepare('INSERT INTO teacher_comment_templates(teacher_id,title,body,created_at,updated_at) VALUES($1,$2,$3,$4,$4) ON CONFLICT(teacher_id,title) DO UPDATE SET body=excluded.body,updated_at=excluded.updated_at').run(req.user.id,title,body,timestamp);res.status(201).json({id:Number(saved.lastInsertRowid)||0,title,body,updated_at:timestamp});});
  router.delete('/comment-templates/:templateId',async(req,res)=>{const templateId=asId(req.params.templateId);await db.prepare('DELETE FROM teacher_comment_templates WHERE id=$1 AND teacher_id=$2').run(templateId,req.user.id);res.json({ok:true});});
  router.get('/classes/:classId/submissions', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const status = String(req.query.status || 'submitted');
    const allowed = new Set(['submitted', 'returned', 'accepted', 'draft', 'not_submitted', 'all']);
    assert(allowed.has(status), 400, 'Неизвестный фильтр работ.');
    if (status === 'not_submitted') {
      const rows = await db.prepare(`SELECT a.id AS assignment_id,a.title,a.due_at,u.id AS student_id,u.full_name,u.login
        FROM assignments a JOIN users u ON u.class_id=a.class_id AND u.role='student' AND u.active=1
        WHERE a.class_id=$1 AND a.status='published'
        AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))
        AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=u.id AND s.status IN ('submitted','returned','accepted'))
        ORDER BY a.due_at IS NULL,a.due_at,u.full_name`).all(classId);
      return res.json({
        submissions: rows.map(r => ({
          ...r,
          status: 'not_submitted'
        }))
      });
    }
    const clause = status === 'all' ? '' : 'AND s.status=$2';
    const rows = await db.prepare(`SELECT s.id,s.assignment_id,s.student_id,s.status,s.score,s.auto_score,s.client_submitted_at,s.submitted_at,s.graded_at,s.teacher_comment,
      a.title AS assignment_title,a.due_at,(SELECT due_at FROM assignment_due_extensions x WHERE x.assignment_id=a.id AND x.student_id=s.student_id) AS extension_due_at,u.full_name,u.login
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN users u ON u.id=s.student_id
      WHERE a.class_id=$1 ${clause} ORDER BY CASE s.status WHEN 'submitted' THEN 0 WHEN 'returned' THEN 1 ELSE 2 END,s.submitted_at`).all(...(status === 'all' ? [classId] : [classId, status]));
    res.json({
      submissions: rows
    });
  });
  router.get('/submissions/:submissionId', async (req, res) => {
    const submissionId = asId(req.params.submissionId);
    const row = await db.prepare(`SELECT s.*,a.title AS assignment_title,a.class_id,a.max_score,a.due_at,a.checks_json,a.hints_json,a.late_penalty_percent_per_day,a.late_penalty_max_percent,
      u.full_name,u.login,c.teacher_id FROM submissions s JOIN assignments a ON a.id=s.assignment_id
      JOIN users u ON u.id=s.student_id JOIN classes c ON c.id=a.class_id WHERE s.id=$1`).get(submissionId);
    assert(row && row.teacher_id === req.user.id, 404, 'Работа не найдена.');
    row.extension_due_at=(await db.prepare('SELECT due_at FROM assignment_due_extensions WHERE assignment_id=$1 AND student_id=$2').get(row.assignment_id,row.student_id))?.due_at||null;
    const versions = await db.prepare("SELECT id,html,css,kind,created_at,auto_checks_json,revision_number FROM submission_versions WHERE submission_id=$1 ORDER BY created_at DESC,id DESC").all(submissionId);
    const comments=await db.prepare('SELECT c.* FROM assignment_line_comments c JOIN submission_versions v ON v.id=c.version_id WHERE v.submission_id=$1 ORDER BY c.created_at').all(submissionId);
    const hints=await db.prepare('SELECT hint_index,opened_at FROM assignment_hint_opens WHERE assignment_id=$1 AND student_id=$2 ORDER BY hint_index').all(row.assignment_id,row.student_id);
    const similarity=await db.prepare(`SELECT c.similarity_enabled,s.score,s.other_submission_id,u.full_name,v.html,v.css FROM classes c LEFT JOIN assignment_similarity s ON s.assignment_id=$1 AND (s.submission_id=$2 OR s.other_submission_id=$2) LEFT JOIN submissions other ON other.id=CASE WHEN s.submission_id=$2 THEN s.other_submission_id ELSE s.submission_id END LEFT JOIN users u ON u.id=other.student_id LEFT JOIN LATERAL(SELECT html,css FROM submission_versions WHERE submission_id=other.id AND kind='submitted' ORDER BY revision_number DESC LIMIT 1)v ON true WHERE c.id=$3`).all(row.assignment_id,submissionId,row.class_id);
    res.json({
      submission: row,
      checks: safeJson(row.checks_json, []),
      versions,
      line_comments:comments,
      opened_hints:hints,
      similarity:similarity.filter(item=>item.score!=null).map(item=>({...item,similarity_enabled:Boolean(Number(item.similarity_enabled))}))
    });
  });
  router.post('/versions/:versionId/comments',async(req,res)=>{const versionId=asId(req.params.versionId),version=await db.prepare(`SELECT v.*,s.assignment_id,a.class_id,c.teacher_id FROM submission_versions v JOIN submissions s ON s.id=v.submission_id JOIN assignments a ON a.id=s.assignment_id JOIN classes c ON c.id=a.class_id WHERE v.id=$1`).get(versionId);assert(version&&version.teacher_id===req.user.id,404,'Версия работы не найдена.');const language=String(req.body?.language||''),line=Number(req.body?.line_number);assert(['html','css'].includes(language),400,'Выбери HTML или CSS.');assert(Number.isInteger(line)&&line>=1&&line<=10000,400,'Проверь номер строки.');const source=language==='html'?version.html:version.css,excerpt=String(source.split('\n')[line-1]||'').slice(0,500),comment=text(req.body?.comment,'комментарий к строке',1000),timestamp=now();const saved=await db.prepare('INSERT INTO assignment_line_comments(version_id,teacher_id,language,line_number,excerpt,comment,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)').run(versionId,req.user.id,language,line,excerpt,comment,timestamp);res.status(201).json({id:Number(saved.lastInsertRowid),version_id:versionId,language,line_number:line,excerpt,comment,created_at:timestamp});});
  router.patch('/line-comments/:commentId/resolve',async(req,res)=>{const commentId=asId(req.params.commentId),row=await db.prepare(`SELECT c.id,s.assignment_id,s.student_id,cl.teacher_id FROM assignment_line_comments c JOIN submission_versions v ON v.id=c.version_id JOIN submissions s ON s.id=v.submission_id JOIN assignments a ON a.id=s.assignment_id JOIN classes cl ON cl.id=a.class_id WHERE c.id=$1`).get(commentId);assert(row&&row.teacher_id===req.user.id,404,'Комментарий к строке не найден.');const resolvedAt=req.body?.resolved?now():null;await db.prepare('UPDATE assignment_line_comments SET resolved_at=$1 WHERE id=$2').run(resolvedAt,commentId);res.json({ok:true,resolved_at:resolvedAt});});
  router.post('/submissions/:submissionId/review', async (req, res) => {
    const submissionId = asId(req.params.submissionId);
    const row = await db.prepare(`SELECT s.*,a.title AS assignment_title,a.class_id,a.max_score,a.due_at,a.late_penalty_percent_per_day,a.late_penalty_max_percent,c.teacher_id FROM submissions s
      JOIN assignments a ON a.id=s.assignment_id JOIN classes c ON c.id=a.class_id WHERE s.id=$1`).get(submissionId);
    assert(row && row.teacher_id === req.user.id, 404, 'Работа не найдена.');
    assert(row.status === 'submitted' || row.status === 'returned', 400, 'Эта работа сейчас не ждёт проверки.');
    const status = String(req.body?.status || '');
    assert(['accepted', 'returned'].includes(status), 400, 'Выбери «Принять» или «Вернуть на доработку».');
    const comment = optionalText(req.body?.comment, 'комментарий', 5000);
    if(status==='returned')assert(comment,400,'Добавь комментарий с тем, что нужно исправить.');
    let score = req.body?.score == null || req.body.score === '' ? null : Number(req.body.score);
    if (status === 'accepted') assert(Number.isInteger(score) && score >= 0 && score <= row.max_score, 400, `Баллы должны быть от 0 до ${row.max_score}.`);
    if (status === 'returned') score = null;
    const extension=await db.prepare('SELECT due_at FROM assignment_due_extensions WHERE assignment_id=$1 AND student_id=$2').get(row.assignment_id,row.student_id),effectiveDue=extension?.due_at||row.due_at;
    const lateDays=effectiveDue&&row.submitted_at&&Date.parse(row.submitted_at)>Date.parse(effectiveDue)?Math.ceil((Date.parse(row.submitted_at)-Date.parse(effectiveDue))/(24*60*60*1000)):0;
    const waived=Boolean(req.body?.waive_late_penalty),penaltyPercent=status==='accepted'&&!waived&&lateDays?Math.min(Number(row.late_penalty_max_percent)||0,lateDays*(Number(row.late_penalty_percent_per_day)||0)):0;
    const rawScore=score;if(score!=null&&penaltyPercent)score=Math.max(0,Math.round(score*(100-penaltyPercent)/100));
    const timestamp = now();
    await db.prepare("UPDATE submissions SET status=$1,score=$2,teacher_comment=$3,graded_at=$4,updated_at=$5,late_penalty_percent=$6,late_penalty_waived=$7 WHERE id=$8").run(status, score, comment, timestamp, timestamp, penaltyPercent, waived?1:0, submissionId);
    const student = await db.prepare("SELECT student_id FROM submissions WHERE id=$1").get(submissionId);
    const title = status === 'accepted' ? 'Работа проверена' : 'Работу вернули на доработку';
    await db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,submission_id,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)").run(student.student_id, 'review', title, comment || row.assignment_title, row.assignment_id, submissionId, timestamp);
    await recordAudit(db, {
      userId: req.user.id,
      classId: row.class_id,
      action: status === 'accepted' ? 'submission.accept' : 'submission.return',
      target: String(submissionId),
      details: {
        score,
        raw_score:rawScore,
        late_penalty_percent:penaltyPercent,
        assignment_id: row.assignment_id
      }
    });
    res.json({
      ok: true,
      status,
      score,
      raw_score:rawScore,
      late_penalty_percent:penaltyPercent,
      graded_at: timestamp
    });
  });
  router.get('/classes/:classId/gradebook', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const students = await db.prepare("SELECT id,full_name,login FROM users WHERE class_id=$1 AND role='student' AND active=1 ORDER BY full_name COLLATE NOCASE").all(classId);
    const assignments = await db.prepare("SELECT id,title,max_score,due_at FROM assignments WHERE class_id=$1 AND status='published' ORDER BY created_at").all(classId);
    const cells = await db.prepare(`SELECT s.student_id,s.assignment_id,s.status,s.score,s.submitted_at,s.graded_at FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1`).all(classId);
    res.json({
      students,
      assignments,
      submissions: cells
    });
  });
  router.get('/classes/:classId/analytics', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const bounded = (value, fallback, min, max) => {
      const number = Number(value);
      return Number.isInteger(number) ? Math.max(min, Math.min(max, number)) : fallback;
    };
    const inactivityDays = bounded(req.query.inactivity_days, 14, 1, 90);
    const missingMinimum = bounded(req.query.missing_min, 2, 1, 20);
    const started = performance.now();
    const students = await db.prepare("SELECT id,full_name FROM users WHERE class_id=$1 AND role='student' AND active=1 ORDER BY full_name COLLATE NOCASE,id LIMIT 40").all(classId);
    const assignments = await db.prepare("SELECT id,title,max_score,due_at,target_all FROM assignments WHERE class_id=$1 AND status='published' ORDER BY created_at,id LIMIT 40").all(classId);
    const studentIds = students.map(item => Number(item.id));
    const assignmentIds = assignments.map(item => Number(item.id));
    const cells = studentIds.length && assignmentIds.length ? await db.prepare(`SELECT s.id,s.student_id,s.assignment_id,s.status,s.score,s.submitted_at
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id
      WHERE a.class_id=$1 AND s.student_id=ANY($2::integer[]) AND s.assignment_id=ANY($3::integer[])`).all(classId, studentIds, assignmentIds) : [];
    const atRisk = await db.prepare(`WITH roster AS (
      SELECT u.id,u.full_name,
        (SELECT MAX(d.active_on) FROM student_activity_days d WHERE d.user_id=u.id) AS last_active_on,
        GREATEST(
          (SELECT MAX(e.created_at) FROM activity_events e WHERE e.user_id=u.id),
          u.last_login_at
        ) AS last_activity_at,
        (SELECT COUNT(*) FROM assignments a WHERE a.class_id=$1 AND a.status='published'
          AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=u.id))
          AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=u.id AND s.status IN ('submitted','returned','accepted'))) AS missing_count
      FROM users u WHERE u.class_id=$1 AND u.role='student' AND u.active=1
    )
    SELECT id,full_name,last_active_on,last_activity_at,missing_count,
      (last_activity_at IS NULL OR last_activity_at < NOW() - ($2::integer * INTERVAL '1 day')) AS inactive
    FROM roster WHERE missing_count >= $3 OR last_activity_at IS NULL OR last_activity_at < NOW() - ($2::integer * INTERVAL '1 day')
    ORDER BY missing_count DESC,last_activity_at ASC NULLS FIRST,full_name COLLATE NOCASE LIMIT 40`).all(classId, inactivityDays, missingMinimum);
    const frequentErrors = await db.prepare(`SELECT a.id AS assignment_id,a.title,COALESCE(NULLIF(check_row.value->>'label',''),'Автопроверка') AS check_label,
        COUNT(*) AS failure_count,COUNT(DISTINCT s.student_id) AS students_count,
        ARRAY_AGG(DISTINCT s.student_id) AS student_ids
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id
      CROSS JOIN LATERAL jsonb_array_elements(s.auto_checks_json) AS check_row(value)
      WHERE a.class_id=$1 AND a.status='published' AND s.status IN ('submitted','returned')
        AND COALESCE((check_row.value->>'passed')::boolean,TRUE)=FALSE
      GROUP BY a.id,a.title,COALESCE(NULLIF(check_row.value->>'label',''),'Автопроверка')
      ORDER BY COUNT(DISTINCT s.student_id) DESC,COUNT(*) DESC,a.title LIMIT 80`).all(classId);
    res.json({
      students, assignments, cells, at_risk: atRisk, frequent_errors: frequentErrors,
      thresholds: { inactivity_days: inactivityDays, missing_min: missingMinimum },
      truncated: { students: studentIds.length === 40, assignments: assignmentIds.length === 40 },
      timings_ms: { total: Math.round((performance.now() - started) * 100) / 100 }
    });
  });
  router.get('/classes/:classId/close-year/preview', async (req, res) => {
    const classId = asId(req.params.classId);
    const klass = await ownedClass(db, req.user.id, classId);
    const students = await db.prepare("SELECT id,full_name,active FROM users WHERE class_id=$1 AND role='student' ORDER BY active DESC,full_name COLLATE NOCASE,id").all(classId);
    const counts = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM assignments WHERE class_id=$1 AND status='published') AS assignment_count,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 AND s.status IN ('submitted','returned','accepted')) AS submission_count,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 AND s.status='accepted' AND s.score IS NOT NULL) AS graded_count`).get(classId);
    res.json({ class: klass, students, counts, read_only_after_close: true, personal_data_deletion_default: false });
  });
  router.post('/classes/:classId/close-year', async (req, res) => {
    const classId = asId(req.params.classId), klass = await ownedClass(db, req.user.id, classId);
    assert(!Number(klass.archived), 409, 'Этот класс уже закрыт.');
    const action = String(req.body?.action || '');
    assert(['archive','rollover','graduate'].includes(action), 400, 'Выбери способ закрытия учебного года.');
    const activeStudents = await db.prepare("SELECT id FROM users WHERE class_id=$1 AND role='student' AND active=1 ORDER BY id").all(classId);
    const activeSet = new Set(activeStudents.map(item => Number(item.id)));
    const parseIds = value => {
      assert(value == null || Array.isArray(value), 400, 'Список учеников должен быть массивом.');
      const result = [...new Set((value || []).map(Number))];
      assert(result.every(id => Number.isSafeInteger(id) && id > 0 && activeSet.has(id)), 400, 'В списке есть ученик не из этого класса.');
      return result;
    };
    const transferIds = action === 'rollover' ? parseIds(req.body?.student_ids) : [];
    const graduateIds = action === 'graduate' ? parseIds(req.body?.student_ids) : parseIds(req.body?.graduate_ids);
    assert(!transferIds.some(id => graduateIds.includes(id)), 400, 'Один ученик не может быть одновременно переведён и выпущен.');
    assert(action !== 'rollover' || (req.body?.new_class_name && req.body?.new_school_year), 400, 'Укажи название класса и новый учебный год.');
    const newClassName = action === 'rollover' ? text(req.body.new_class_name, 'название нового класса', 60) : null;
    const newSchoolYear = action === 'rollover' ? text(req.body.new_school_year, 'новый учебный год', 20) : null;
    const anonymize = Boolean(req.body?.anonymize_personal_data);
    assert(!anonymize || (graduateIds.length && req.body?.confirm_personal_data_deletion === 'УДАЛИТЬ ДАННЫЕ'), 400, 'Для удаления персональных данных введи фразу «УДАЛИТЬ ДАННЫЕ».');
    const timestamp = now();
    let newClassId = null;
    await db.tx(async () => {
      if (action === 'rollover') {
        const created = await db.prepare('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4)').run(req.user.id, newClassName, newSchoolYear, timestamp);
        newClassId = Number(created.lastInsertRowid);
        if (transferIds.length) await db.prepare('UPDATE users SET class_id=$1 WHERE id=ANY($2::integer[]) AND class_id=$3').run(newClassId, transferIds, classId);
      }
      await db.prepare('UPDATE classes SET archived=1,closed_at=$1,close_action=$2,rollover_class_id=$3 WHERE id=$4').run(timestamp, action, newClassId, classId);
      if (graduateIds.length) {
        await db.prepare('UPDATE users SET active=0 WHERE id=ANY($1::integer[]) AND class_id=$2').run(graduateIds, classId);
        await db.prepare('DELETE FROM sessions WHERE user_id=ANY($1::integer[])').run(graduateIds);
        if (anonymize) {
          for (const studentId of graduateIds) {
            const maskedLogin = `graduate-${studentId}`;
            await db.prepare('DELETE FROM login_attempts WHERE normalized_login=(SELECT LOWER(login) FROM users WHERE id=$1)').run(studentId);
            await db.prepare('DELETE FROM login_events WHERE user_id=$1').run(studentId);
            await db.prepare('DELETE FROM lesson_notes WHERE user_id=$1').run(studentId);
            await db.prepare('DELETE FROM user_settings WHERE user_id=$1').run(studentId);
            await db.prepare('DELETE FROM student_activity_days WHERE user_id=$1').run(studentId);
            await db.prepare('DELETE FROM activity_events WHERE user_id=$1').run(studentId);
            await db.prepare('DELETE FROM assignment_questions WHERE student_id=$1').run(studentId);
            await db.prepare('UPDATE users SET full_name=$1,login=$2,password_hash=$3,last_login_at=NULL,must_change_password=0 WHERE id=$4')
              .run(`Выпускник №${studentId}`, maskedLogin, await hashPassword(crypto.randomBytes(32).toString('base64url')), studentId);
          }
        }
      }
      await recordAudit(db, { userId: req.user.id, classId, action: `class.year_close.${action}`, target: klass.name,
        details: { new_class_id: newClassId, transferred_count: transferIds.length, graduated_count: graduateIds.length, personal_data_anonymized: anonymize } });
    });
    res.json({ ok: true, action, archived: true, new_class_id: newClassId, transferred_count: transferIds.length, graduated_count: graduateIds.length, personal_data_anonymized: anonymize });
  });
  router.get('/classes/:classId/export', async (req, res) => {
    const classId = asId(req.params.classId),
      klass = await ownedClass(db, req.user.id, classId);
    const students = await db.prepare("SELECT id,full_name,login,active,created_at,last_login_at FROM users WHERE class_id=$1 AND role='student' ORDER BY full_name").all(classId);
    const assignments = await db.prepare(`SELECT a.id,a.title,a.due_at,a.max_score,a.status,a.target_all,
      ARRAY(SELECT t.student_id FROM assignment_targets t WHERE t.assignment_id=a.id) AS targeted_student_ids
      FROM assignments a WHERE a.class_id=$1 ORDER BY a.created_at`).all(classId);
    const submissions = await db.prepare(`SELECT s.*,a.title AS assignment_title,u.full_name,u.login FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN users u ON u.id=s.student_id WHERE a.class_id=$1 ORDER BY s.updated_at`).all(classId);
    if (req.query.format === 'csv') {
      const quote = v => {
        let value = String(v ?? '').replace(/[\r\n]+/g, ' ');
        if (/^[=+\-@\t]/.test(value)) value = `'${value}`;
        return `"${value.replace(/"/g, '""')}"`;
      };
      const rows = [['Ученик', 'Логин', 'Задание', 'Статус', 'Балл', 'Комментарий', 'Отправлено', 'Проверено'], ...submissions.map(s => [s.full_name, s.login, s.assignment_title, s.status, s.score, s.teacher_comment, s.submitted_at, s.graded_at])];
      const csv = '\ufeff' + rows.map(row => row.map(quote).join(';')).join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="class-${classId}.csv"`);
      return res.send(csv);
    }
    if (req.query.format === 'xlsx') {
      const published = assignments.filter(item => item.status === 'published');
      const workbook = buildClassWorkbook({ klass, students, assignments: published, submissions });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="class-${classId}-journal.xlsx"`);
      res.setHeader('Cache-Control', 'no-store');
      try { await workbook.xlsx.write(res); }
      catch (error) { if (!res.headersSent) throw error; res.destroy(error); }
      return;
    }
    const versions = await db.prepare(`SELECT v.id,v.submission_id,v.kind,v.html,v.css,v.created_at FROM submission_versions v
      JOIN submissions s ON s.id=v.submission_id JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 ORDER BY v.created_at,v.id`).all(classId);
    const progress = await db.prepare(`SELECT p.student_id,u.full_name,p.lesson_id,p.step_id,p.done_at FROM lesson_progress p
      JOIN users u ON u.id=p.student_id WHERE u.class_id=$1 AND u.role='student' ORDER BY u.full_name,p.lesson_id,p.step_id`).all(classId);
    const audit = (await db.prepare(`SELECT a.action,a.target,a.details_json,a.created_at,u.full_name AS actor_name FROM audit_log a
      LEFT JOIN users u ON u.id=a.user_id WHERE a.class_id=$1 ORDER BY a.created_at,a.id`).all(classId)).map(row => ({
      ...row,
      details: safeJson(row.details_json, {})
    }));
    res.setHeader('Content-Disposition', `attachment; filename="class-${classId}.json"`);
    res.json({
      class: {
        id: klass.id,
        name: klass.name,
        school_year: klass.school_year
      },
      students,
      assignments,
      submissions,
      versions,
      progress,
      audit
    });
  });
  router.get('/students/:studentId/report.pdf', async (req, res) => {
    const studentId = asId(req.params.studentId), student = await ownedStudent(db, req.user.id, studentId);
    const parsePeriod = (value, label) => {
      if (value == null || value === '') return null;
      const date = new Date(`${value}T00:00:00Z`);
      assert(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) && !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value, 400, `Проверь дату «${label}».`);
      return `${value}T00:00:00.000Z`;
    };
    const from = parsePeriod(req.query.from, 'с'), to = parsePeriod(req.query.to, 'по');
    assert(!from || !to || Date.parse(from) <= Date.parse(to), 400, 'Дата начала периода не может быть позже даты окончания.');
    const grades = await db.prepare(`SELECT a.id AS assignment_id,a.title,a.max_score,s.score,s.status,s.teacher_comment,s.submitted_at,s.graded_at,
        c.name AS assignment_class,c.school_year AS assignment_school_year
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN classes c ON c.id=a.class_id
      WHERE s.student_id=$1 AND c.teacher_id=$2 AND s.status IN ('accepted','returned')
        AND ($3::timestamptz IS NULL OR s.graded_at >= $3)
        AND ($4::timestamptz IS NULL OR s.graded_at < ($4::date + INTERVAL '1 day'))
      ORDER BY s.graded_at,a.created_at`).all(studentId, req.user.id, from, to);
    const doc = createStudentReport({ student, grades, period: { from, to } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="student-${studentId}-report.pdf"`);
    res.setHeader('Cache-Control', 'no-store');
    doc.on('error', error => { if (!res.headersSent) res.destroy(error); });
    doc.pipe(res);
    doc.end();
  });
  router.get('/classes/:classId/audit', async (req, res) => {
    const classId = asId(req.params.classId);
    await ownedClass(db, req.user.id, classId);
    const rows = await db.prepare(`SELECT a.id,a.action,a.target,a.details_json,a.created_at,u.full_name AS actor_name
      FROM audit_log a LEFT JOIN users u ON u.id=a.user_id WHERE a.class_id=$1 ORDER BY a.created_at DESC LIMIT 250`).all(classId);
    res.json({
      entries: rows.map(row => ({
        ...row,
        details: safeJson(row.details_json, {})
      }))
    });
  });
  router.get('/notifications', async (req, res) => {
    const classId = req.query.class_id ? asId(req.query.class_id) : 0;
    if (classId) await ownedClass(db, req.user.id, classId);
    const count = classId ? (await db.prepare("SELECT COUNT(*) AS n FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE a.class_id=$1 AND s.status='submitted'").get(classId)).n : (await db.prepare("SELECT COUNT(*) AS n FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN classes c ON c.id=a.class_id WHERE c.teacher_id=$1 AND s.status='submitted'").get(req.user.id)).n;
    const questions=classId?(await db.prepare('SELECT COUNT(*) AS n FROM assignment_questions q JOIN assignments a ON a.id=q.assignment_id WHERE a.class_id=$1 AND q.teacher_read_at IS NULL').get(classId)).n:(await db.prepare('SELECT COUNT(*) AS n FROM assignment_questions q JOIN assignments a ON a.id=q.assignment_id JOIN classes c ON c.id=a.class_id WHERE c.teacher_id=$1 AND q.teacher_read_at IS NULL').get(req.user.id)).n;
    res.json({
      pending: count,
      questions
    });
  });
  router.get('/backup', async (req, res) => {
    assert(req.user.is_owner, 403, 'Резервную копию может скачать только владелец курса.');
    const backup = await createBackup(db);
    backup.checksum = signature(backup, req.app.locals.config.sessionSecret);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `attachment; filename="classroom-${new Date().toISOString().slice(0,10)}.json"`);
    res.json(backup);
  });
  return router;
}
function safeJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
module.exports = {
  createTeacherRouter,
  generatePassword,
  uniqueLogin,
  transliterate,
  ACTIVE_LESSONS,
  normalizeCodeForSimilarity,
  shingleSimilarity
};
