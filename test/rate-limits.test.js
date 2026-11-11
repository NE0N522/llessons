const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');

test('Stages 1 and 5: 30 students on one IP save independently and report concurrent p95', async () => {
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'rate-limiter-test-secret-at-least-32-chars' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`, db = app.locals.db;
  try {
    const stamp = new Date().toISOString(), password = 'RateLimitStudent#2026', passwordHash = await hashPassword(password);
    const teacher = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','rate.teacher',$1,'Учитель теста',1,$2) RETURNING id", [await hashPassword('RateLimitTeacher#2026'), stamp])).rows[0].id;
    const klass = (await db.query('INSERT INTO classes(teacher_id,name,created_at) VALUES($1,$2,$3) RETURNING id', [teacher, 'Класс лимитов', stamp])).rows[0].id;
    const studentIds = [];
    for (let i = 1; i <= 30; i += 1) {
      const result = await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,created_at) VALUES('student',$1,$2,$3,$4,$5) RETURNING id", [`rate.student${i}`, passwordHash, `Ученик ${i}`, klass, stamp]);
      studentIds.push(result.rows[0].id);
    }
    const taskId = (await db.query("INSERT INTO assignments(class_id,title,status,checks_json,created_at,updated_at) VALUES($1,'Задание проверки лимита','published','[]',$2,$2) RETURNING id", [klass, stamp])).rows[0].id;
    const cookies = [];
    for (let i = 1; i <= studentIds.length; i += 1) {
      const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { origin: base, 'content-type': 'application/json' }, body: JSON.stringify({ login: `rate.student${i}`, password }) });
      assert.equal(response.status, 200, `student ${i} login`);
      cookies.push(response.headers.get('set-cookie').split(';')[0]);
    }
    async function save(index, revision) {
      return fetch(`${base}/api/student/assignments/${taskId}/draft`, {
        method: 'PUT',
        headers: { origin: base, 'content-type': 'application/json', cookie: cookies[index] },
        body: JSON.stringify({ html: `<main><p>Ученик ${index + 1}, версия ${revision}</p></main>`, css: 'main { padding: 1rem; }' })
      });
    }
    const started=performance.now(),results=[];
    for(let request=1;request<=12;request+=1){
      const waveStarted=performance.now();
      const wave=await Promise.all(Array.from({length:30},async(_,student)=>{const requestStarted=performance.now();try{const response=await save(student,request);return{student:student+1,status:response.status,elapsed:performance.now()-requestStarted};}catch(error){return{student:student+1,status:0,elapsed:performance.now()-requestStarted,error:error.message};}}));
      results.push(...wave);
      if(request<12)await new Promise(resolve=>setTimeout(resolve,Math.max(0,5000-(performance.now()-waveStarted))));
    }
    const duration=performance.now()-started;
    const timings=results.map(result=>result.elapsed).sort((a,b)=>a-b),percentile=value=>timings[Math.ceil(value*timings.length)-1],overLimit=results.filter(result=>result.status===429);
    for(const result of results)assert.equal(result.status,200,`student ${result.student}, status ${result.status}${result.error?`, ${result.error}`:''}`);
    assert.equal(overLimit.length,0,'normal autosave must not hit the user/IP limit');
    console.log(`Нагрузочная проверка (PGlite, локальная; не прогноз Neon): 30 учеников × 12 сохранений, до 30 одновременно = ${results.length} запросов, ${overLimit.length} ответов 429, общее время ${duration.toFixed(0)} мс, p50 ${percentile(.5).toFixed(1)} мс, p95 ${percentile(.95).toFixed(1)} мс.`);
    for (let request = 13; request <= 30; request += 1) assert.equal((await save(0, request)).status, 200, `first student save ${request}`);
    assert.equal((await save(0, 31)).status, 429, 'the user who exceeded the limit should receive 429');
    assert.equal((await save(1, 13)).status, 200, 'another user with the same IP should not be limited');
    assert.equal((await save(29, 13)).status, 200, 'a third user with the same IP should not be limited');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    clearInterval(app.locals.maintenanceTimer);
    await db.close();
  }
});
