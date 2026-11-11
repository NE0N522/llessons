const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const value = Number(process.argv[index + 1]);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`--${name} должен быть положительным числом.`);
  return value;
}

const studentsCount = option('students', 30);
const durationSeconds = option('duration-seconds', 300);
const intervalSeconds = option('interval-seconds', 5);
const reportFileArg = process.argv.includes('--report') ? process.argv[process.argv.indexOf('--report') + 1] : null;
const reportFile = path.resolve(reportFileArg || path.join(__dirname, '..', 'report', 'stage-7', 'loadtest.json'));

async function main() {
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage7-load-test-secret-with-at-least-32-chars', skipEnv: true });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const db = app.locals.db;
  try {
    const stamp = new Date().toISOString();
    const studentPassword = 'LoadTestStudent#2026';
    const [teacherHash, studentHash] = await Promise.all([hashPassword('LoadTestTeacher#2026'), hashPassword(studentPassword)]);
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','loadtest.teacher',$1,'Учитель нагрузочного теста',1,$2) RETURNING id", [teacherHash, stamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, 'Тест нагрузки', '2026–2027', stamp])).rows[0].id;
    const assignmentId = (await db.query("INSERT INTO assignments(class_id,title,status,checks_json,created_at,updated_at) VALUES($1,'Автосохранение','published','[]',$2,$2) RETURNING id", [classId, stamp])).rows[0].id;
    const passwordHashByLogin = studentHash;
    for (let index = 1; index <= studentsCount; index += 1) {
      const login = `loadtest.student${String(index).padStart(2, '0')}`;
      await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student',$1,$2,$3,$4,0,$5)", [login, passwordHashByLogin, `Виртуальный ученик ${index}`, classId, stamp]);
    }

    const sessions = [];
    for (let index = 1; index <= studentsCount; index += 1) {
      const login = `loadtest.student${String(index).padStart(2, '0')}`;
      const response = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { origin: base, 'content-type': 'application/json' },
        body: JSON.stringify({ login, password: studentPassword })
      });
      if (!response.ok) throw new Error(`Не удалось войти виртуальному ученику ${index}: HTTP ${response.status}.`);
      const cookie = response.headers.get('set-cookie')?.split(';')[0];
      if (!cookie) throw new Error(`Сервер не выдал сессию ученику ${index}.`);
      sessions.push(cookie);
    }

    const intervalMs = intervalSeconds * 1000;
    const rounds = Math.ceil(durationSeconds / intervalSeconds);
    const measurements = [];
    const failed = [];
    const runStarted = performance.now();
    for (let round = 0; round < rounds; round += 1) {
      const waveStart = performance.now();
      const wave = await Promise.all(sessions.map(async (cookie, studentIndex) => {
        const started = performance.now();
        try {
          const response = await fetch(`${base}/api/student/assignments/${assignmentId}/draft`, {
            method: 'PUT',
            headers: { origin: base, 'content-type': 'application/json', cookie },
            body: JSON.stringify({
              html: `<main><h1>Ученик ${studentIndex + 1}, автосохранение ${round + 1}</h1></main>`,
              css: `main { padding: ${12 + round % 12}px; }`
            })
          });
          if (!response.ok) failed.push({ student: studentIndex + 1, round: round + 1, status: response.status });
          return { status: response.status, latencyMs: performance.now() - started };
        } catch (error) {
          failed.push({ student: studentIndex + 1, round: round + 1, status: 0, error: error.message });
          return { status: 0, latencyMs: performance.now() - started };
        }
      }));
      measurements.push(...wave);
      const nextRoundAt = runStarted + (round + 1) * intervalMs;
      const remaining = nextRoundAt - performance.now();
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
      if (performance.now() - waveStart > intervalMs && round + 1 < rounds) {
        console.warn(`Цикл ${round + 1} занял дольше ${intervalSeconds} с; следующий стартует сразу.`);
      }
    }
    const sorted = measurements.map(item => item.latencyMs).sort((a, b) => a - b);
    const percentile = fraction => sorted[Math.max(0, Math.ceil(fraction * sorted.length) - 1)] || 0;
    const result = {
      runtime: 'локальный Express + PGlite',
      students: studentsCount,
      duration_seconds: durationSeconds,
      autosaves_per_minute_per_student: Math.round(60 / intervalSeconds),
      interval_seconds: intervalSeconds,
      requests: measurements.length,
      responses_429: measurements.filter(item => item.status === 429).length,
      failed_requests: failed.length,
      p50_ms: Math.round(percentile(0.50) * 100) / 100,
      p95_ms: Math.round(percentile(0.95) * 100) / 100,
      elapsed_seconds: Math.round((performance.now() - runStarted) / 10) / 100,
      failed: failed.slice(0, 30),
      note: 'Локальный результат на PGlite не прогнозирует задержку, лимиты или поведение Render/Neon.'
    };
    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`Нагрузка (${result.runtime}): ${result.students} учеников, ${result.autosaves_per_minute_per_student} сохранений/мин на каждого в течение ${durationSeconds} с; ${result.requests} запросов, ${result.responses_429} ответов 429, ${result.failed_requests} ошибок, p50 ${result.p50_ms} мс, p95 ${result.p95_ms} мс.`);
    console.log(`Результат записан: ${path.relative(process.cwd(), reportFile)}`);
    if (failed.length) process.exitCode = 1;
  } finally {
    clearInterval(app.locals.maintenanceTimer);
    await new Promise(resolve => server.close(resolve));
    await db.close();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
