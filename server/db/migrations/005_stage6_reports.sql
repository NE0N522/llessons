ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rollover_class_id integer REFERENCES classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS close_action text CHECK (close_action IS NULL OR close_action IN ('archive','rollover','graduate'));

CREATE INDEX IF NOT EXISTS idx_activity_events_user_created ON activity_events(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_student_updated ON submissions(student_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_class_status_created ON assignments(class_id,status,created_at);
