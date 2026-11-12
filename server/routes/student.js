const express = require('express');
const {
  rateLimit
} = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const {
  requireRole
} = require('../auth');
const {
  now
} = require('../db');
const {
  assert,
  asId
} = require('../lib/errors');
const {
  code
} = require('../lib/validation');
const {
  ACTIVE_LESSONS,
  normalizeCodeForSimilarity,
  shingleSimilarity
} = require('./teacher');
const { dateOnly, streakMetrics } = require('../lib/student-metrics');
function createStudentRouter(db) {
  const router = express.Router();
  const draftLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    keyGenerator: (req) => req.user ? `user:${req.user.id}` : `ip:${ipKeyGenerator(req.ip || '127.0.0.1')}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Слишком часто сохраняется черновик. Подожди немного.'
    }
  });
  router.use(requireRole('student'));
  async function recordActiveDay(userId, timestamp = now()) {
    await db.prepare('INSERT INTO student_activity_days(user_id,active_on) VALUES($1,$2) ON CONFLICT(user_id,active_on) DO NOTHING').run(userId, dateOnly(timestamp));
  }
  router.get('/settings/editor', async (req, res) => {
    const settings = await db.prepare('SELECT font_size FROM user_settings WHERE user_id=$1').get(req.user.id);
    res.json({ font_size: Number(settings?.font_size) || 15 });
  });
  router.put('/settings/editor', async (req, res) => {
    const fontSize = Number(req.body?.font_size);
    assert(Number.isInteger(fontSize) && fontSize >= 12 && fontSize <= 24, 400, 'Размер шрифта должен быть от 12 до 24 пикселей.');
    const timestamp = now();
    await db.prepare(`INSERT INTO user_settings(user_id,font_size,updated_at) VALUES($1,$2,$3)
      ON CONFLICT(user_id) DO UPDATE SET font_size=excluded.font_size,updated_at=excluded.updated_at`).run(req.user.id, fontSize, timestamp);
    res.json({ font_size: fontSize, updated_at: timestamp });
  });
  router.get('/settings/learning', async (req, res) => {
    const settings = await db.prepare('SELECT weekly_goal,last_course_location,last_location_at FROM user_settings WHERE user_id=$1').get(req.user.id);
    res.json({ weekly_goal: Number(settings?.weekly_goal) || 3, last_course_location: settings?.last_course_location || '', last_location_at: settings?.last_location_at || null });
  });
  router.put('/settings/learning', async (req, res) => {
    const weeklyGoal = Number(req.body?.weekly_goal);
    assert(Number.isInteger(weeklyGoal) && weeklyGoal >= 1 && weeklyGoal <= 10, 400, 'Цель недели должна быть от 1 до 10 заданий.');
    const timestamp = now();
    await db.prepare(`INSERT INTO user_settings(user_id,weekly_goal,updated_at) VALUES($1,$2,$3)
      ON CONFLICT(user_id) DO UPDATE SET weekly_goal=excluded.weekly_goal,updated_at=excluded.updated_at`).run(req.user.id, weeklyGoal, timestamp);
    res.json({ weekly_goal: weeklyGoal, updated_at: timestamp });
  });
  router.get('/journey', async (req, res) => {
    const settings = await db.prepare('SELECT last_course_location,last_location_at FROM user_settings WHERE user_id=$1').get(req.user.id);
    res.json({ last_course_location: settings?.last_course_location || '', last_location_at: settings?.last_location_at || null });
  });
  router.put('/journey', async (req, res) => {
    const kind = String(req.body?.kind || ''), timestamp = now();
    let location = '';
    if (kind === 'lesson') {
      const lessonId = Number(req.body?.lesson_id), stepId = String(req.body?.step_id || '');
      assert(ACTIVE_LESSONS.has(lessonId), 400, 'Урок не найден.');
      assert(!stepId || /^[a-z0-9][a-z0-9_-]{0,90}$/.test(stepId), 400, 'Неверный шаг урока.');
      location = `/lesson-view.html?lesson=${lessonId}${stepId ? `#${stepId}` : ''}`;
    } else if (kind === 'assignment') {
      const assignmentId = asId(req.body?.assignment_id);
      await assignedRecord(req.user.id, assignmentId);
      location = `/student/assignment.html?id=${assignmentId}`;
    } else assert(false, 400, 'Не удалось определить место в курсе.');
    await db.prepare(`INSERT INTO user_settings(user_id,last_course_location,last_location_at,updated_at) VALUES($1,$2,$3,$3)
      ON CONFLICT(user_id) DO UPDATE SET last_course_location=excluded.last_course_location,last_location_at=excluded.last_location_at,updated_at=excluded.updated_at`).run(req.user.id, location, timestamp);
    res.json({ last_course_location: location, last_location_at: timestamp });
  });
  router.get('/lessons/:lessonId/notes', async (req, res) => {
    const lessonId = asId(req.params.lessonId);
    assert(ACTIVE_LESSONS.has(lessonId), 404, 'Урок не найден.');
    const record = await db.prepare('SELECT note,updated_at,revision FROM lesson_notes WHERE user_id=$1 AND lesson_id=$2').get(req.user.id, lessonId);
    res.json({ note: record?.note || '', updated_at: record?.updated_at || null,revision:Number(record?.revision||0) });
  });
  router.put('/lessons/:lessonId/notes', async (req, res) => {
    const lessonId = asId(req.params.lessonId), note = String(req.body?.note ?? '');
    assert(ACTIVE_LESSONS.has(lessonId), 404, 'Урок не найден.');
    assert(note.length <= 10000, 400, 'Заметка должна быть не длиннее 10 000 символов.');
    const current=await db.prepare('SELECT note,updated_at,revision FROM lesson_notes WHERE user_id=$1 AND lesson_id=$2').get(req.user.id,lessonId);
    if(current&&req.body?.client_revision!=null&&Number(req.body.client_revision)!==Number(current.revision))return res.status(409).json({error:'Заметка изменена на другом устройстве. Выбери нужную версию.',conflict:true,server_note:current.note,server_revision:Number(current.revision)});
    const timestamp = now();
    const saved=await db.prepare(`INSERT INTO lesson_notes(user_id,lesson_id,note,updated_at,revision) VALUES($1,$2,$3,$4,1)
      ON CONFLICT(user_id,lesson_id) DO UPDATE SET note=excluded.note,updated_at=excluded.updated_at,revision=lesson_notes.revision+1 RETURNING revision`).get(req.user.id, lessonId, note, timestamp);
    res.json({ note, updated_at: timestamp,revision:Number(saved.revision) });
  });
  async function studentClass(req) {
    const row = await db.prepare(`SELECT u.id,u.class_id,c.name AS class_name,c.school_year,c.archived
      FROM users u LEFT JOIN classes c ON c.id=u.class_id WHERE u.id=$1 AND u.role='student' AND u.active=1`).get(req.user.id);
    assert(row && row.class_id, 403, 'У аккаунта пока нет активного класса. Обратись к учителю.');
    return row;
  }
  async function assignedRecord(studentId, assignmentId, {
    mustBePublished = true
  } = {}) {
    const row = await db.prepare(`SELECT a.*,c.name AS class_name,c.archived,
      (SELECT due_at FROM assignment_due_extensions x WHERE x.assignment_id=a.id AND x.student_id=$1) AS extension_due_at,
      (SELECT id FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$1 ) AS submission_id,
      (SELECT status FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$2 ) AS submission_status,
      (SELECT score FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$3 ) AS score,
      (SELECT teacher_comment FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$4 ) AS teacher_comment,
      (SELECT submitted_at FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$5 ) AS submitted_at,
      (SELECT graded_at FROM submissions s WHERE s.assignment_id=a.id AND s.student_id=$6 ) AS graded_at
      ,c.teacher_id FROM assignments a JOIN classes c ON c.id=a.class_id
      WHERE a.id=$7 AND c.id=(SELECT class_id FROM users WHERE id=$8 AND role='student' AND active=1)
      AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=$9))`).get(studentId, studentId, studentId, studentId, studentId, studentId, assignmentId, studentId, studentId);
    assert(row && (!mustBePublished || row.status === 'published'), 404, 'Задание не найдено.');
    return row;
  }
  async function getSubmission(db, assignmentId, studentId) {
    return await db.prepare("SELECT * FROM submissions WHERE assignment_id=$1 AND student_id=$2").get(assignmentId, studentId);
  }
  function canEdit(assignment, submission) {
    if (Number(assignment.archived)) return false;
    if (!submission || submission.status === 'draft') return true;
    return Boolean(assignment.allow_resubmit && ['returned', 'accepted'].includes(submission.status));
  }
  async function saveStudentDraft(studentId, assignmentId, body) {
    const assignment = await assignedRecord(studentId, assignmentId),
      html = code(body?.html, 'HTML'),
      css = code(body?.css, 'CSS'),
      timestamp = now();
    assert(!Number(assignment.archived), 403, 'Класс находится в архиве. Работы доступны только для просмотра.');
    assert(Buffer.byteLength(html, 'utf8') + Buffer.byteLength(css, 'utf8') <= 200 * 1024, 413, 'Общий размер черновика HTML и CSS не должен превышать 200 КБ.');
    let submission = await getSubmission(db, assignmentId, studentId);
    assert(canEdit(assignment, submission), 409, 'Работа уже отправлена. Дождись ответа учителя.');
    const save = db.transaction(async () => {
      if (!submission) {
        const id = Number((await db.prepare(`INSERT INTO submissions(assignment_id,student_id,status,draft_revision,created_at,updated_at) VALUES($1,$2,'draft',1,$3,$4)`).run(assignmentId, studentId, timestamp, timestamp)).lastInsertRowid);
        submission = {
          id,
          status: 'draft',
          draft_revision: 1
        };
      } else {
        // Preserve returned/accepted state until the student explicitly resubmits.
        const updated = await db.prepare("UPDATE submissions SET updated_at=$1,draft_revision=draft_revision+1 WHERE id=$2 RETURNING draft_revision").get(timestamp, submission.id);
        submission.draft_revision = Number(updated.draft_revision);
      }
      const previous = await db.prepare("SELECT id FROM submission_versions WHERE submission_id=$1 AND kind='draft'").get(submission.id);
      if (previous) await db.prepare("UPDATE submission_versions SET html=$1,css=$2,created_at=$3,revision_number=revision_number+1 WHERE id=$4").run(html, css, timestamp, previous.id);else await db.prepare("INSERT INTO submission_versions(submission_id,html,css,kind,created_at,revision_number) VALUES($1,$2,$3,'draft',$4,1)").run(submission.id, html, css, timestamp);
      const lastEvent = await db.prepare("SELECT created_at FROM activity_events WHERE user_id=$1 AND submission_id=$2 AND kind='draft' ORDER BY id DESC LIMIT 1").get(studentId, submission.id);
      if (!lastEvent || Date.now() - Date.parse(lastEvent.created_at) > 10 * 60 * 1000) await db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,submission_id,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)").run(studentId, 'draft', 'Черновик сохранён', assignment.title, assignmentId, submission.id, timestamp);
      await recordActiveDay(studentId, timestamp);
      return { id: submission.id, revision: Number(submission.draft_revision || 0) };
    });
    const saved = await save();
    return {
      submission_id: saved.id,
      revision: saved.revision,
      saved_at: timestamp
    };
  }
  router.get('/assignments', async (req, res) => {
    const klass = await studentClass(req);
    const rows = await db.prepare(`SELECT a.id,a.title,a.description,a.lesson_id,a.due_at,a.max_score,a.allow_resubmit,a.no_hints,a.task_type,
      s.id AS submission_id,s.status,s.score,s.teacher_comment,s.submitted_at,s.graded_at,
      (SELECT due_at FROM assignment_due_extensions x WHERE x.assignment_id=a.id AND x.student_id=$5) AS extension_due_at,
      (SELECT COUNT(*) FROM assignment_hint_opens h WHERE h.assignment_id=a.id AND h.student_id=$6) AS hints_opened,
      (SELECT COUNT(*) FROM activity_events e WHERE e.user_id=$1 AND e.assignment_id=a.id AND e.kind='review' AND e.read_at IS NULL) AS unread_review
      FROM assignments a LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=$2
      WHERE a.class_id=$3 AND a.status='published'
      AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=$4))
      ORDER BY a.due_at IS NULL,a.due_at,a.created_at DESC`).all(req.user.id, req.user.id, klass.class_id, req.user.id, req.user.id, req.user.id);
    const announcements = await db.prepare('SELECT id,title,body,pinned,created_at FROM class_announcements WHERE class_id=$1 ORDER BY pinned DESC,created_at DESC LIMIT 10').all(klass.class_id);
    const gallery = await db.prepare(`SELECT g.id,g.title,g.description,g.created_at,u.full_name,a.title AS assignment_title
      FROM class_gallery_projects g JOIN users u ON u.id=g.student_id JOIN assignments a ON a.id=g.assignment_id
      WHERE g.class_id=$1 ORDER BY g.created_at DESC LIMIT 60`).all(klass.class_id);
    const unreadQuestions=(await db.prepare("SELECT COUNT(*) AS n FROM assignment_questions WHERE student_id=$1 AND teacher_reply<>'' AND student_read_at IS NULL").get(req.user.id)).n;
    const assignments = rows.map(row => ({
      ...row,
      due_at: row.extension_due_at || row.due_at,
      effective_due_at: row.extension_due_at || row.due_at,
      status: row.status || 'not_started',
      overdue: Boolean((row.extension_due_at || row.due_at) && Date.parse(row.extension_due_at || row.due_at) < Date.now() && !['submitted', 'accepted'].includes(row.status))
    }));
    res.json({
      class: klass,
      assignments,
      announcements,
      gallery,
      unread_questions:unreadQuestions,
      unread_reviews: assignments.reduce((n, a) => n + a.unread_review, 0)
    });
  });
  router.get('/assignments/:assignmentId', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId),
      assignment = await assignedRecord(req.user.id, assignmentId);
    const submission = await getSubmission(db, assignmentId, req.user.id);
    const versions = submission ? await db.prepare("SELECT id,html,css,kind,created_at FROM submission_versions WHERE submission_id=$1 ORDER BY created_at DESC,id DESC").all(submission.id) : [];
    const draft = versions.find(version => version.kind === 'draft') || null;
    const privateQuiz = safeJson(assignment.quiz_json, []);
    const safeAssignment = { ...assignment, due_at: assignment.extension_due_at || assignment.due_at, checks: safeJson(assignment.checks_json, []), hints: safeJson(assignment.hints_json, []).length, quiz: privateQuiz.map(item => ({ prompt: item.prompt, options: item.options, multiple: Boolean(item.multiple) })) };
    delete safeAssignment.model_html;
    delete safeAssignment.model_css;
    delete safeAssignment.quiz_json;
    delete safeAssignment.hints_json;
    const submittedAnswers=safeJson(submission?.quiz_answers_json,[]);
    const quizFeedback=submission&&assignment.task_type==='quiz'?privateQuiz.map((question,index)=>{const selected=[...new Set(submittedAnswers[index]||[])].sort((a,b)=>a-b),correct=[...question.correct].sort((a,b)=>a-b);return{passed:selected.length===correct.length&&selected.every((value,n)=>value===correct[n]),explanation:question.explanation||''};}):null;
    res.json({
      assignment: safeAssignment,
      quiz: privateQuiz.map(item => ({ prompt: item.prompt, options: item.options, multiple: Boolean(item.multiple) })),
      submission: submission ? {
        ...submission,
        can_edit: canEdit(assignment, submission)
      } : null,
      draft,
      versions,
      quiz_feedback:quizFeedback,
      draft_revision: Number(submission?.draft_revision || 0),
      opened_hints: (await db.prepare('SELECT hint_index,opened_at FROM assignment_hint_opens WHERE assignment_id=$1 AND student_id=$2 ORDER BY hint_index').all(assignmentId, req.user.id)).map(item=>({ ...item, text: safeJson(assignment.hints_json,[])[Number(item.hint_index)] || '' })),
      line_comments: submission ? await db.prepare(`SELECT c.*,v.kind,v.revision_number FROM assignment_line_comments c JOIN submission_versions v ON v.id=c.version_id WHERE v.submission_id=$1 ORDER BY c.line_number,c.id`).all(submission.id) : []
    });
  });
  router.get('/gallery/:projectId', async (req, res) => {
    const klass = await studentClass(req), projectId = asId(req.params.projectId);
    const project = await db.prepare(`SELECT g.id,g.title,g.description,g.html,g.css,g.created_at,u.full_name,a.title AS assignment_title
      FROM class_gallery_projects g JOIN users u ON u.id=g.student_id JOIN assignments a ON a.id=g.assignment_id
      WHERE g.id=$1 AND g.class_id=$2`).get(projectId, klass.class_id);
    assert(project, 404, 'Работа не найдена в галерее класса.');
    res.json({ project });
  });
  router.post('/assignments/:assignmentId/read', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId);
    await assignedRecord(req.user.id, assignmentId);
    await db.prepare("UPDATE activity_events SET read_at=$1 WHERE user_id=$2 AND assignment_id=$3 AND read_at IS NULL AND kind IN ('assignment','review')").run(now(), req.user.id, assignmentId);
    res.json({
      ok: true
    });
  });
  router.put('/assignments/:assignmentId/draft', draftLimiter, async (req, res) => {
    const assignmentId = asId(req.params.assignmentId), current = await getSubmission(db, assignmentId, req.user.id);
    if (current && req.body?.client_revision != null && Number(req.body.client_revision) !== Number(current.draft_revision)) {
      const serverDraft = await db.prepare("SELECT html,css,created_at FROM submission_versions WHERE submission_id=$1 AND kind='draft'").get(current.id);
      return res.status(409).json({ error: 'Черновик изменён на другом устройстве. Выбери, какую версию оставить.', conflict: true, draft_revision: Number(current.draft_revision), server_draft: serverDraft || { html: '', css: '' } });
    }
    const result = await saveStudentDraft(req.user.id, asId(req.params.assignmentId), req.body);
    res.json({
      ok: true,
      ...result
    });
  });
  router.post('/assignments/:assignmentId/hints/:hintIndex', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId), index = Number(req.params.hintIndex), assignment = await assignedRecord(req.user.id, assignmentId);
    assert(!Number(assignment.archived), 403, 'Класс находится в архиве. Подсказки доступны только для просмотра.');
    assert(!Number(assignment.no_hints), 403, 'Учитель отключил подсказки.');
    const hints = safeJson(assignment.hints_json, []);
    assert(Number.isInteger(index) && index >= 0 && index < hints.length, 404, 'Подсказка не найдена.');
    if (index > 0) assert(await db.prepare('SELECT 1 FROM assignment_hint_opens WHERE assignment_id=$1 AND student_id=$2 AND hint_index=$3').get(assignmentId, req.user.id, index - 1), 400, 'Сначала открой предыдущую подсказку.');
    const openedAt = now();
    await db.prepare('INSERT INTO assignment_hint_opens(assignment_id,student_id,hint_index,opened_at) VALUES($1,$2,$3,$4) ON CONFLICT(assignment_id,student_id,hint_index) DO NOTHING').run(assignmentId, req.user.id, index, openedAt);
    res.json({ hint: hints[index], opened_at: openedAt, hint_index: index });
  });
  router.post('/assignments/:assignmentId/quiz/grade', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId), assignment = await assignedRecord(req.user.id, assignmentId);
    assert(!Number(assignment.archived), 403, 'Класс находится в архиве. Ответы доступны только для просмотра.');
    assert(assignment.task_type === 'quiz', 400, 'Это задание не является тестом.');
    const quiz = safeJson(assignment.quiz_json, []), answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const results = quiz.map((question, index) => {
      const selected = [...new Set((Array.isArray(answers[index]) ? answers[index] : []).map(Number).filter(n => Number.isInteger(n)))].sort((a,b)=>a-b);
      const correct = [...question.correct].sort((a,b)=>a-b);
      const passed = selected.length === correct.length && selected.every((value,n)=>value===correct[n]);
      return { passed, explanation: question.explanation || '' };
    });
    const score = quiz.length ? Math.round((results.filter(item=>item.passed).length / quiz.length) * Number(assignment.max_score)) : 0;
    res.json({ results, score, max_score: Number(assignment.max_score), correct_count: results.filter(item=>item.passed).length, total: quiz.length });
  });
  router.post('/assignments/:assignmentId/questions', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId), assignment = await assignedRecord(req.user.id, assignmentId);
    assert(!Number(assignment.archived), 403, 'Класс находится в архиве. Новые вопросы недоступны.');
    const question = String(req.body?.question || '').trim();
    assert(question.length > 0 && question.length <= 2000, 400, 'Вопрос должен содержать от 1 до 2000 символов.');
    const timestamp = now();
    const saved = await db.prepare('INSERT INTO assignment_questions(assignment_id,student_id,question,created_at) VALUES($1,$2,$3,$4)').run(assignmentId, req.user.id, question, timestamp);
    await db.prepare('INSERT INTO activity_events(user_id,kind,title,details,assignment_id,created_at) VALUES($1,$2,$3,$4,$5,$6)').run(assignment.teacher_id, 'question', 'Вопрос по заданию', req.user.full_name, assignmentId, timestamp);
    res.status(201).json({ id: Number(saved.lastInsertRowid), created_at: timestamp });
  });
  router.get('/assignments/:assignmentId/questions', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId); await assignedRecord(req.user.id, assignmentId);
    const questions = await db.prepare(`SELECT id,question,teacher_reply,reply_public,created_at,replied_at,student_read_at FROM assignment_questions
      WHERE (assignment_id=$1 AND student_id=$2) OR (assignment_id=$1 AND reply_public=1 AND teacher_reply<>'') ORDER BY created_at DESC`).all(assignmentId, req.user.id);
    await db.prepare('UPDATE assignment_questions SET student_read_at=$1 WHERE assignment_id=$2 AND student_id=$3 AND teacher_reply<>\'\' AND student_read_at IS NULL').run(now(), assignmentId, req.user.id);
    res.json({ questions });
  });
  router.patch('/line-comments/:commentId/resolve',async(req,res)=>{const commentId=asId(req.params.commentId),row=await db.prepare(`SELECT c.id,s.student_id,cl.archived FROM assignment_line_comments c JOIN submission_versions v ON v.id=c.version_id JOIN submissions s ON s.id=v.submission_id JOIN assignments a ON a.id=s.assignment_id JOIN classes cl ON cl.id=a.class_id WHERE c.id=$1`).get(commentId);assert(row&&Number(row.student_id)===Number(req.user.id),404,'Комментарий не найден.');assert(!Number(row.archived),403,'Класс находится в архиве. Комментарии доступны только для просмотра.');const resolvedAt=req.body?.resolved?now():null;await db.prepare('UPDATE assignment_line_comments SET resolved_at=$1 WHERE id=$2').run(resolvedAt,commentId);res.json({ok:true,resolved_at:resolvedAt});});
  router.post('/assignments/:assignmentId/draft/beacon', draftLimiter, async (req, res) => {
    const assignmentId=asId(req.params.assignmentId),current=await getSubmission(db,assignmentId,req.user.id);
    if(current&&req.body?.client_revision!=null&&Number(req.body.client_revision)!==Number(current.draft_revision)){return res.status(409).json({error:'Черновик изменён на другом устройстве.',conflict:true,draft_revision:Number(current.draft_revision)});}
    await saveStudentDraft(req.user.id, asId(req.params.assignmentId), req.body);
    res.status(204).setHeader('Cache-Control', 'no-store').end();
  });
  router.post('/assignments/:assignmentId/draft/backup', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId);
    const assignment = await assignedRecord(req.user.id, assignmentId);
    const html = code(req.body?.html, 'HTML');
    const css = code(req.body?.css, 'CSS');
    assert(Buffer.byteLength(html, 'utf8') + Buffer.byteLength(css, 'utf8') <= 200 * 1024, 413, 'Общий размер HTML и CSS не должен превышать 200 КБ.');
    const submission = await getSubmission(db, assignmentId, req.user.id);
    assert(!Number(assignment.archived), 403, 'Класс находится в архиве. Работы доступны только для просмотра.');
    assert(submission && canEdit(assignment, submission), 409, 'Сначала сохрани черновик, затем попробуй сбросить код.');
    const timestamp = now();
    const result = await db.prepare("INSERT INTO submission_versions(submission_id,html,css,kind,created_at) VALUES($1,$2,$3,'backup',$4)").run(submission.id, html, css, timestamp);
    res.status(201).json({ id: Number(result.lastInsertRowid), kind: 'backup', created_at: timestamp });
  });
  router.post('/assignments/:assignmentId/submit', async (req, res) => {
    const assignmentId = asId(req.params.assignmentId),
      assignment = await assignedRecord(req.user.id, assignmentId);
    assert(!Number(assignment.archived), 403, 'Класс находится в архиве. Работы доступны только для просмотра.');
    let submission = await getSubmission(db, assignmentId, req.user.id);
    assert(canEdit(assignment, submission), 409, 'Работа уже отправлена. Дождись ответа учителя.');
    const quiz = safeJson(assignment.quiz_json, []), isQuiz = assignment.task_type === 'quiz';
    const html = code(req.body?.html, 'HTML'),
      css = code(req.body?.css, 'CSS'),
      timestamp = now();
    assert(Buffer.byteLength(html, 'utf8') + Buffer.byteLength(css, 'utf8') <= 200 * 1024, 413, 'Общий размер работы HTML и CSS не должен превышать 200 КБ.');
    const submittedAtClient = req.body?.client_submitted_at && !Number.isNaN(Date.parse(req.body.client_submitted_at)) ? new Date(req.body.client_submitted_at).toISOString() : null;
    const checks = Array.isArray(req.body?.check_results) ? req.body.check_results.slice(0,12).map(item=>({ label:String(item?.label||'Проверка').slice(0,100),passed:Boolean(item?.passed) })) : [];
    const answers = isQuiz && Array.isArray(req.body?.answers) ? req.body.answers.slice(0,20).map(item=>Array.isArray(item)?item.map(Number).filter(Number.isInteger).slice(0,6):[]) : [];
    const quizResults = isQuiz ? quiz.map((question,index)=>{const selected=[...new Set(answers[index]||[])].sort((a,b)=>a-b),correct=[...question.correct].sort((a,b)=>a-b);return selected.length===correct.length&&selected.every((value,n)=>value===correct[n]);}) : [];
    const autoScore = isQuiz ? (quiz.length ? Math.round(quizResults.filter(Boolean).length / quiz.length * Number(assignment.max_score)) : 0) : (Number(assignment.checklist_autograde) && checks.length ? Math.round(checks.filter(item=>item.passed).length / checks.length * Number(assignment.max_score)) : null);
    const submit = db.transaction(async () => {
      if (!submission) {
        const initialStatus = isQuiz ? 'accepted' : 'submitted';
        const id = Number((await db.prepare(`INSERT INTO submissions(assignment_id,student_id,status,score,auto_score,auto_checks_json,quiz_answers_json,submitted_at,client_submitted_at,graded_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`).run(assignmentId, req.user.id, initialStatus, isQuiz ? autoScore : null, autoScore, JSON.stringify(checks), JSON.stringify(answers), timestamp, submittedAtClient, isQuiz ? timestamp : null, timestamp, timestamp)).lastInsertRowid);
        submission = {
          id
        };
      } else {
        await db.prepare("UPDATE submissions SET status=$1,score=$2,auto_score=$3,auto_checks_json=$4,quiz_answers_json=$5,teacher_comment='',submitted_at=$6,client_submitted_at=$7,graded_at=$8,updated_at=$9,draft_revision=draft_revision+1 WHERE id=$10").run(isQuiz ? 'accepted' : 'submitted', isQuiz ? autoScore : null, autoScore, JSON.stringify(checks), JSON.stringify(answers), timestamp, submittedAtClient, isQuiz ? timestamp : null, timestamp, submission.id);
      }
      const nextRevision=Number((await db.prepare("SELECT COUNT(*) AS n FROM submission_versions WHERE submission_id=$1 AND kind='submitted'").get(submission.id)).n)+1;
      const submittedVersion = await db.prepare("INSERT INTO submission_versions(submission_id,html,css,kind,created_at,auto_checks_json,revision_number) VALUES($1,$2,$3,'submitted',$4,$5,$6)").run(submission.id, html, css, timestamp, JSON.stringify(checks), nextRevision);
      const similarity=await db.prepare(`SELECT c.similarity_enabled,c.similarity_threshold,a.starter_html,a.starter_css FROM classes c JOIN assignments a ON a.class_id=c.id WHERE a.id=$1`).get(assignmentId);
      if(Number(similarity?.similarity_enabled)){
        const others=await db.prepare(`SELECT s.id,v.html,v.css FROM submissions s JOIN LATERAL(SELECT html,css FROM submission_versions WHERE submission_id=s.id AND kind='submitted' ORDER BY revision_number DESC LIMIT 1)v ON true WHERE s.assignment_id=$1 AND s.id<>$2`).all(assignmentId,submission.id);
        const current=normalizeCodeForSimilarity(html,css,similarity.starter_html,similarity.starter_css);
        for(const other of others){const candidate=normalizeCodeForSimilarity(other.html,other.css,similarity.starter_html,similarity.starter_css),score=shingleSimilarity(current,candidate);if(score>=Number(similarity.similarity_threshold))await db.prepare('INSERT INTO assignment_similarity(assignment_id,submission_id,other_submission_id,score,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(submission_id,other_submission_id) DO UPDATE SET score=excluded.score,created_at=excluded.created_at').run(assignmentId,submission.id,other.id,score,timestamp);}
      }
      if (!isQuiz) await db.prepare("INSERT INTO activity_events(user_id,kind,title,details,assignment_id,submission_id,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)").run(assignment.teacher_id, 'submission', 'Новая работа на проверку', req.user.full_name, assignmentId, submission.id, timestamp);
      await recordActiveDay(req.user.id, timestamp);
      return { id: submission.id, version_id: submittedVersion.lastInsertRowid };
    });
    const saved = await submit();
    res.json({
      ok: true,
      submitted_at: timestamp,
      client_submitted_at: submittedAtClient,
      submission_id: saved.id,
      version_id: saved.version_id,
      auto_score: autoScore,
      quiz_results: isQuiz ? quizResults : undefined
    });
  });
  router.get('/submissions/:submissionId', async (req, res) => {
    const submissionId = asId(req.params.submissionId);
    const submission = await db.prepare(`SELECT s.*,a.title AS assignment_title,a.max_score,a.allow_resubmit,a.due_at,a.class_id
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id WHERE s.id=$1 AND s.student_id=$2`).get(submissionId, req.user.id);
    assert(submission, 404, 'Работа не найдена.');
    const versions = await db.prepare("SELECT id,html,css,kind,created_at FROM submission_versions WHERE submission_id=$1 ORDER BY created_at DESC,id DESC").all(submissionId);
    res.json({
      submission,
      versions
    });
  });
  router.get('/profile', async (req, res) => {
    const klass = await studentClass(req);
    const totals = await db.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN s.status IN ('submitted','returned','accepted') THEN 1 ELSE 0 END) AS completed,
      ROUND(AVG(CASE WHEN s.status='accepted' THEN s.score END),1) AS average,
      SUM(CASE WHEN s.submitted_at IS NOT NULL AND (a.due_at IS NULL OR s.submitted_at<=a.due_at) THEN 1 ELSE 0 END) AS on_time,
      SUM(CASE WHEN s.status='accepted' THEN 1 ELSE 0 END) AS accepted_count
      FROM assignments a LEFT JOIN submissions s ON s.assignment_id=a.id AND s.student_id=$1
      WHERE a.class_id=$2 AND a.status='published'
      AND (a.target_all=1 OR EXISTS(SELECT 1 FROM assignment_targets t WHERE t.assignment_id=a.id AND t.student_id=$3))`).get(req.user.id, klass.class_id, req.user.id);
    const history = await db.prepare(`SELECT id,kind,title,details,assignment_id,submission_id,created_at,read_at FROM activity_events WHERE user_id=$1 ORDER BY created_at DESC,id DESC LIMIT 100`).all(req.user.id);
    const grades = await db.prepare(`SELECT a.id AS assignment_id,a.title,s.score,a.max_score,s.graded_at,s.teacher_comment,s.status,
        c.name AS class_name,c.school_year
      FROM submissions s JOIN assignments a ON a.id=s.assignment_id JOIN classes c ON c.id=a.class_id
      WHERE s.student_id=$1 AND s.status IN ('accepted','returned') ORDER BY s.graded_at DESC`).all(req.user.id);
    const progress = await db.prepare("SELECT lesson_id,step_id,done_at FROM lesson_progress WHERE student_id=$1 ORDER BY lesson_id,done_at").all(req.user.id);
    const login_events = await db.prepare('SELECT occurred_at,success,ip_address,user_agent FROM login_events WHERE user_id=$1 ORDER BY occurred_at DESC LIMIT 25').all(req.user.id);
    const [days, settings, weekly] = await Promise.all([
      db.prepare('SELECT active_on FROM student_activity_days WHERE user_id=$1 ORDER BY active_on DESC LIMIT 180').all(req.user.id),
      db.prepare('SELECT weekly_goal,last_course_location,last_location_at FROM user_settings WHERE user_id=$1').get(req.user.id),
      db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE student_id=$1 AND submitted_at >= date_trunc('week', now()) AND status IN ('submitted','returned','accepted')").get(req.user.id)
    ]);
    const streak = streakMetrics(days.map(day => day.active_on));
    const completedLessons = new Set(progress.filter(item => item.step_id === 'lesson-complete').map(item => Number(item.lesson_id))).size;
    const achievements = [
      { id: 'first-work', title: 'Первая работа', description: 'Отправь первую работу учителю.', progress: Math.min(1, Number(totals.completed) || 0), target: 1 },
      { id: 'five-lessons', title: 'Пять уроков', description: 'Заверши пять уроков курса.', progress: completedLessons, target: 5 },
      { id: 'ten-lessons', title: 'Десять уроков', description: 'Заверши десять уроков курса.', progress: completedLessons, target: 10 },
      { id: 'first-accepted', title: 'Принято учителем', description: 'Получи первую принятую работу.', progress: Math.min(1, Number(totals.accepted_count) || 0), target: 1 },
      { id: 'five-accepted', title: 'Пять готовых работ', description: 'Получи пять принятых работ.', progress: Number(totals.accepted_count) || 0, target: 5 },
      { id: 'five-day-streak', title: 'Пять активных дней', description: 'Учись пять дней подряд.', progress: streak.best_streak, target: 5 },
      { id: 'ten-day-streak', title: 'Десять активных дней', description: 'Удерживай учебную серию десять дней.', progress: streak.best_streak, target: 10 },
      { id: 'on-time-three', title: 'Всё вовремя', description: 'Сдай три работы до срока.', progress: Number(totals.on_time) || 0, target: 3 }
    ].map(item => ({ ...item, unlocked: item.progress >= item.target, progress: Math.min(item.progress, item.target), progress_label: `${Math.min(item.progress, item.target)} из ${item.target}` }));
    res.json({
      profile: {
        id: req.user.id,
        full_name: req.user.full_name,
        login: req.user.login,
        avatar_url: req.user.avatar_url || '',
        avatar_public_id: req.user.avatar_public_id || '',
        profile_theme: req.user.profile_theme || 'ocean',
        profile_status: req.user.profile_status || '',
        class_name: klass.class_name,
        school_year: klass.school_year,
        stats: {
          ...totals,
          total: totals.total || 0,
          completed: totals.completed || 0,
          on_time: totals.on_time || 0,
          weekly_goal: Number(settings?.weekly_goal) || 3,
          weekly_done: Number(weekly.count) || 0,
          ...streak
        }
      },
      history,
      grades,
      progress,
      login_events,
      active_days: days.map(day => dateOnly(day.active_on)),
      badges: achievements.filter(item => item.unlocked),
      achievements,
      last_course_location: settings?.last_course_location || '',
      last_location_at: settings?.last_location_at || null
    });
  });
  router.get('/notifications', async (req, res) => {
    const events = await db.prepare("SELECT id,kind,title,details,assignment_id,submission_id,created_at FROM activity_events WHERE user_id=$1 ORDER BY id DESC LIMIT 50").all(req.user.id);
    const unread = (await db.prepare("SELECT COUNT(*) AS count FROM activity_events WHERE user_id=$1 AND read_at IS NULL AND kind IN ('review','assignment')").get(req.user.id)).count;
    res.json({
      notifications: events,
      unread
    });
  });
  router.post('/notifications/read', async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(asId) : [];
    if (ids.length) {
      const marks = ids.map((_, index) => `$${3 + index}`).join(',');
      await db.prepare(`UPDATE activity_events SET read_at=$1 WHERE user_id=$2 AND id IN (${marks})`).run(now(), req.user.id, ...ids);
    } else await db.prepare("UPDATE activity_events SET read_at=$1 WHERE user_id=$2 AND read_at IS NULL AND kind IN ('review','assignment')").run(now(), req.user.id);
    res.json({
      ok: true
    });
  });
  router.get('/progress', async (req, res) => {
    const progress = await db.prepare("SELECT lesson_id,step_id,done_at FROM lesson_progress WHERE student_id=$1 ORDER BY lesson_id,step_id").all(req.user.id);
    res.json({
      progress
    });
  });
  router.put('/progress', async (req, res) => {
    const lessonId = Number(req.body?.lesson_id),
      stepId = String(req.body?.step_id || '');
    assert(ACTIVE_LESSONS.has(lessonId), 400, 'Урок не найден.');
    assert(/^[a-z0-9][a-z0-9_-]{0,90}$/.test(stepId), 400, 'Неверный шаг урока.');
    const done = Boolean(req.body?.done);
    if (done) { const timestamp = now(); await db.prepare("INSERT INTO lesson_progress(student_id,lesson_id,step_id,done_at) VALUES($1,$2,$3,$4) ON CONFLICT(student_id,lesson_id,step_id) DO UPDATE SET done_at=excluded.done_at").run(req.user.id, lessonId, stepId, timestamp); await recordActiveDay(req.user.id, timestamp); }
    else await db.prepare("DELETE FROM lesson_progress WHERE student_id=$1 AND lesson_id=$2 AND step_id=$3").run(req.user.id, lessonId, stepId);
    res.json({
      ok: true
    });
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
  createStudentRouter
};
