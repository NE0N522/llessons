ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS no_hints smallint NOT NULL DEFAULT 0 CHECK (no_hints IN (0, 1));

CREATE TABLE IF NOT EXISTS user_settings (
  user_id integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  font_size integer NOT NULL DEFAULT 15 CHECK (font_size BETWEEN 12 AND 24),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE submission_versions DROP CONSTRAINT IF EXISTS submission_versions_kind_check;
ALTER TABLE submission_versions ADD CONSTRAINT submission_versions_kind_check
  CHECK (kind IN ('draft', 'submitted', 'backup'));
