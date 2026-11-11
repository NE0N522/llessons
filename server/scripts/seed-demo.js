const {
  openDatabase,
  now
} = require('../db');
const {
  getConfig
} = require('../config');
const {
  hashPassword
} = require('../auth');
const {
  generatePassword
} = require('../routes/teacher');
async function main() {
  const config = getConfig();
  if (config.production) throw new Error('Демо-данные нельзя создавать в production.');
  const db = await openDatabase(config);
  try {
    if (await db.prepare("SELECT 1 FROM users WHERE login='demo.teacher'").get()) throw new Error('Демо-класс уже существует; используйте его данные, выведенные при первом создании.');
    const teacherPassword = generatePassword(),
      teacherHash = await hashPassword(teacherPassword),
      timestamp = now();
    const create = db.transaction(async students => {
      const teacherId = Number((await db.prepare("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','demo.teacher',$1,'Учитель демо-класса',1,$2)").run(teacherHash, timestamp)).lastInsertRowid);
      const classId = Number((await db.prepare("INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4)").run(teacherId, 'Демо-класс', '2026–2027', timestamp)).lastInsertRowid);
      const addStudent = db.prepare("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student',$1,$2,$3,$4,1,$5)");
      const made = [];
      for (const student of students) made.push({
        ...student,
        id: Number((await addStudent.run(student.login, student.hash, student.full_name, classId, timestamp)).lastInsertRowid)
      });
      return {
        teacherId,
        classId,
        made
      };
    });
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const password = generatePassword();
      students.push({
        login: `demo.student${i}`,
        full_name: `Ученик Демо ${i}`,
        password,
        hash: await hashPassword(password)
      });
    }
    const {
      classId,
      made
    } = await create(students);
    const add = db.prepare(`INSERT INTO assignments(class_id,title,description,lesson_id,starter_html,starter_css,due_at,max_score,allow_resubmit,status,checks_json,created_at,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'published','[]',$10,$11)`);
    const first = Number((await add.run(classId, 'Карточка любимой книги', 'Собери HTML-карточку с заголовком, кратким описанием и ссылкой.', 1, '<main>\n  <h1>Название книги</h1>\n  <p>Короткое описание</p>\n</main>', '', null, 10, 1, timestamp, timestamp)).lastInsertRowid);
    const second = Number((await add.run(classId, 'Карточка занятия', 'Сделай понятную карточку и оформи её цветом, отступами и рамкой.', 5, '<article class="card">\n  <h2>Занятие</h2>\n  <p>Краткое описание</p>\n</article>', '.card { padding: 20px; border-radius: 12px; }', null, 10, 1, timestamp, timestamp)).lastInsertRowid);
    for (const student of made) {
      await db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,created_at) VALUES($1,$2,$3,$4,$5,$6)").run(student.id, 'assignment', 'Новое задание', 'Карточка любимой книги', first, timestamp);
      await db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,created_at) VALUES($1,$2,$3,$4,$5,$6)").run(student.id, 'assignment', 'Новое задание', 'Карточка занятия', second, timestamp);
    }
    console.log('Демо-аккаунты созданы. Эти пароли показываются только один раз:');
    console.log(`Учитель: demo.teacher / ${teacherPassword}`);
    for (const student of made) console.log(`${student.login} / ${student.password}`);
  } finally {
    await db.close();
  }
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
