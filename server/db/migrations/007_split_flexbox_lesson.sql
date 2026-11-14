-- The former lesson 23 combined Flexbox and Grid. Keep Grid progress at 23,
-- move Flexbox step marks to lesson 29, and preserve the old completion mark
-- for both halves because the completed lesson contained both topics.
INSERT INTO lesson_notes(user_id, lesson_id, note, updated_at, revision)
SELECT user_id, 29, note, updated_at, revision
FROM lesson_notes
WHERE lesson_id = 23
ON CONFLICT (user_id, lesson_id) DO NOTHING;

INSERT INTO lesson_progress(student_id, lesson_id, step_id, done_at)
SELECT student_id, 29, 'lesson-complete', done_at
FROM lesson_progress
WHERE lesson_id = 23 AND step_id = 'lesson-complete'
ON CONFLICT (student_id, lesson_id, step_id)
DO UPDATE SET done_at = GREATEST(lesson_progress.done_at, EXCLUDED.done_at);

-- Move the three former Flexbox checks and its six step marks first. This
-- leaves the old lesson's can-0 free for the Grid check copied below.
UPDATE lesson_progress
SET lesson_id = 29
WHERE lesson_id = 23 AND step_id IN ('can-0', 'can-1', 'can-2', 'axes', 'alignment', 'spacing-wrap', 'flex-values', 'cards', 'interface');

-- The old fourth self-check was the only Grid check. Keep it as Grid's first
-- check before removing the legacy can-3 row.
INSERT INTO lesson_progress(student_id, lesson_id, step_id, done_at)
SELECT student_id, 23, 'can-0', done_at
FROM lesson_progress
WHERE lesson_id = 23 AND step_id = 'can-3'
ON CONFLICT (student_id, lesson_id, step_id)
DO UPDATE SET done_at = GREATEST(lesson_progress.done_at, EXCLUDED.done_at);

DELETE FROM lesson_progress WHERE lesson_id = 23 AND step_id = 'can-3';
