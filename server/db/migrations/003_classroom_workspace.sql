ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS weekly_goal integer NOT NULL DEFAULT 3 CHECK (weekly_goal BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS last_course_location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_location_at timestamptz;

CREATE TABLE IF NOT EXISTS student_activity_days (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_on date NOT NULL,
  PRIMARY KEY (user_id, active_on)
);

CREATE TABLE IF NOT EXISTS lesson_notes (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id integer NOT NULL,
  note text NOT NULL DEFAULT '' CHECK (length(note) <= 10000),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_student_activity_days_user_date ON student_activity_days(user_id, active_on DESC);
