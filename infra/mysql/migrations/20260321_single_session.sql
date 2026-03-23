ALTER TABLE users
  ADD COLUMN current_session_id VARCHAR(64) NULL AFTER password_hash,
  ADD INDEX idx_current_session (current_session_id);
