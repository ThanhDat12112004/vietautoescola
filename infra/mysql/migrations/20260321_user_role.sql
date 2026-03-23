ALTER TABLE users
  ADD COLUMN role ENUM('admin','teacher','student') NOT NULL DEFAULT 'student' AFTER password_hash;

UPDATE users SET role = 'admin' WHERE id = 1;
