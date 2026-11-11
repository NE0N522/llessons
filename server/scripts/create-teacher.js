const { openDatabase, now } = require('../db');
const { getConfig } = require('../config');
const { hashPassword } = require('../auth');
const { ask, askHidden } = require('./prompt');
const { text, login } = require('../lib/validation');

async function main() {
  const config = getConfig();
  const db = await openDatabase(config);
  try {
    console.log('Создание аккаунта учителя. Пароль будет сохранён только в виде криптографического хеша.');
    const fullName = text(await ask('ФИО: '), 'ФИО', 100);
    const username = login(await ask('Логин (латиницей): '));
    if (await db.prepare('SELECT 1 FROM users WHERE lower(login)=lower($1)').get(username)) throw new Error('Такой логин уже занят.');
    const password = await askHidden('Пароль (не менее 12 символов): ');
    if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error('Пароль должен содержать не менее 12 символов, буквы и цифры.');
    const count = Number((await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='teacher'").get()).n);
    await db.prepare('INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES(\'teacher\',$1,$2,$3,$4,$5)')
      .run(username, await hashPassword(password), fullName, count ? 0 : 1, now());
    console.log(`Готово. Аккаунт учителя ${username} создан${count ? '' : ' как владелец'}.`);
  } finally { await db.close(); }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
