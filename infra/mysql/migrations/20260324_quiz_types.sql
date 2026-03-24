CREATE TABLE IF NOT EXISTS quiz_types (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(80) UNIQUE NOT NULL,
  name_vi VARCHAR(150) NOT NULL,
  name_es VARCHAR(150) NOT NULL,
  description_vi TEXT,
  description_es TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO quiz_types (code, name_vi, name_es, is_active)
SELECT DISTINCT
  q.quiz_type,
  REPLACE(CONCAT(UPPER(LEFT(q.quiz_type, 1)), SUBSTRING(q.quiz_type, 2)), '_', ' '),
  REPLACE(CONCAT(UPPER(LEFT(q.quiz_type, 1)), SUBSTRING(q.quiz_type, 2)), '_', ' '),
  TRUE
FROM quizzes q
LEFT JOIN quiz_types qt ON qt.code = q.quiz_type
WHERE q.quiz_type IS NOT NULL AND q.quiz_type <> '' AND qt.id IS NULL;
