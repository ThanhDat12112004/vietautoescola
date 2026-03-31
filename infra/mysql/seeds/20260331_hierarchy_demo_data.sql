SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE answers;
TRUNCATE TABLE questions;
TRUNCATE TABLE user_answers;
TRUNCATE TABLE user_quiz_attempts;
TRUNCATE TABLE reference_materials;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE quiz_categories;
TRUNCATE TABLE material_types;
TRUNCATE TABLE quiz_topic_groups;
TRUNCATE TABLE material_topic_groups;
TRUNCATE TABLE quiz_types;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO quiz_topic_groups (id, code, name_vi, name_es, description_vi, description_es, is_active, created_at, updated_at)
VALUES
  (1, 'QG_REAL', 'Đề thi thật', 'Examen real', 'Bộ đề mô phỏng sát đề thi thực tế DGT', 'Simulacros cercanos al examen oficial DGT', TRUE, NOW(), NOW()),
  (2, 'QG_COMMON', 'Đề thi hay gặp', 'Examen frecuente', 'Nhóm câu hỏi xuất hiện nhiều trong luyện thi', 'Preguntas que aparecen con frecuencia', TRUE, NOW(), NOW()),
  (3, 'QG_CHAPTER', 'Đề thi theo chương', 'Examen por capítulo', 'Ôn tập theo từng chương kiến thức', 'Estudio por capítulos', TRUE, NOW(), NOW()),
  (4, 'QG_TRICK', 'Đề câu hỏi mẹo', 'Preguntas trampa', 'Tập trung câu dễ nhầm lẫn và mẹo xử lý', 'Preguntas confusas y trucos', TRUE, NOW(), NOW()),
  (5, 'QG_LEVEL', 'Đề theo mức độ', 'Examen por nivel', 'Phân theo độ khó từ dễ đến khó', 'Clasificado por nivel de dificultad', TRUE, NOW(), NOW());

INSERT INTO quiz_types (
  id, quiz_topic_group_id, name_vi, name_es, description_vi, description_es, is_active, created_at, updated_at
)
VALUES
  (1, 1, 'Thi thật tiêu chuẩn', 'Examen real estándar', 'Nhóm đề thi thật chuẩn', 'Grupo estándar de examen real', TRUE, NOW(), NOW()),
  (2, 2, 'Câu hay gặp cơ bản', 'Frecuentes básicos', 'Chủ đề hay gặp mức cơ bản', 'Tema frecuente nivel básico', TRUE, NOW(), NOW()),
  (3, 3, 'Ôn theo chương', 'Repaso por capítulo', 'Chủ đề ôn tập theo từng chương', 'Tema de estudio por capítulos', TRUE, NOW(), NOW()),
  (4, 4, 'Câu mẹo dễ sai', 'Preguntas trampa', 'Chủ đề câu hỏi mẹo dễ nhầm', 'Tema de preguntas trampa', TRUE, NOW(), NOW()),
  (5, 5, 'Luyện theo độ khó', 'Práctica por dificultad', 'Chủ đề luyện theo mức độ', 'Tema por nivel de dificultad', TRUE, NOW(), NOW());

INSERT INTO quiz_categories (quiz_topic_group_id, name_vi, name_es, slug, description_vi, description_es, is_active, created_at, updated_at)
VALUES
  (1, 'Thi thật 30 câu', 'Examen real 30 preguntas', 'CAT_REAL_30', 'Đề thi thật dạng 30 câu', 'Examen real de 30 preguntas', TRUE, NOW(), NOW()),
  (1, 'Thi thật 45 câu', 'Examen real 45 preguntas', 'CAT_REAL_45', 'Đề thi thật dạng 45 câu', 'Examen real de 45 preguntas', TRUE, NOW(), NOW()),
  (1, 'Thi thật tổng hợp', 'Examen real mixto', 'CAT_REAL_MIX', 'Đề thật trộn nhiều nhóm nội dung', 'Examen real mixto', TRUE, NOW(), NOW()),
  (2, 'Câu hỏi hay gặp cơ bản', 'Frecuentes básicos', 'CAT_COMMON_BASIC', 'Các câu hỏi cơ bản thường gặp', 'Preguntas básicas frecuentes', TRUE, NOW(), NOW()),
  (2, 'Câu hỏi hay gặp nâng cao', 'Frecuentes avanzados', 'CAT_COMMON_ADV', 'Các câu hỏi nâng cao thường gặp', 'Preguntas frecuentes avanzadas', TRUE, NOW(), NOW()),
  (3, 'Chương 1: Quy tắc chung', 'Capítulo 1: normas generales', 'CAT_CH1', 'Ôn chương quy tắc giao thông chung', 'Normas generales de tráfico', TRUE, NOW(), NOW()),
  (3, 'Chương 2: Biển báo', 'Capítulo 2: señales', 'CAT_CH2', 'Ôn chương biển báo giao thông', 'Señales de tráfico', TRUE, NOW(), NOW()),
  (3, 'Chương 3: Sa hình', 'Capítulo 3: maniobras', 'CAT_CH3', 'Ôn chương sa hình và kỹ năng xử lý', 'Maniobras y situaciones', TRUE, NOW(), NOW()),
  (4, 'Mẹo ưu tiên giao lộ', 'Trucos de prioridad', 'CAT_TRICK_PRIORITY', 'Mẹo xử lý ưu tiên tại giao lộ', 'Trucos de prioridad en cruces', TRUE, NOW(), NOW()),
  (4, 'Mẹo biển báo dễ nhầm', 'Trucos de señales confusas', 'CAT_TRICK_SIGN', 'Mẹo nhận diện biển báo dễ nhầm', 'Trucos para señales confusas', TRUE, NOW(), NOW()),
  (5, 'Mức độ dễ', 'Nivel fácil', 'CAT_LEVEL_EASY', 'Bộ đề mức độ dễ', 'Exámenes de nivel fácil', TRUE, NOW(), NOW()),
  (5, 'Mức độ trung bình', 'Nivel medio', 'CAT_LEVEL_MED', 'Bộ đề mức độ trung bình', 'Exámenes de nivel medio', TRUE, NOW(), NOW()),
  (5, 'Mức độ khó', 'Nivel difícil', 'CAT_LEVEL_HARD', 'Bộ đề mức độ khó', 'Exámenes de nivel difícil', TRUE, NOW(), NOW());

INSERT INTO quizzes (
  category_id, quiz_type_id, title_vi, title_es, description_vi, description_es,
  instructions_vi, instructions_es, duration_minutes, total_questions, passing_score, is_active, created_by, created_at
)
SELECT
  qc.id,
  qc.quiz_topic_group_id AS quiz_type_id,
  CONCAT(qc.name_vi, ' - Đề A'),
  CONCAT(qc.name_es, ' - Modelo A'),
  CONCAT('Bộ đề luyện tập: ', qc.name_vi),
  CONCAT('Simulacro de práctica: ', qc.name_es),
  'Làm bài trong thời gian quy định.',
  'Realiza el examen en el tiempo indicado.',
  CASE WHEN qc.quiz_topic_group_id = 1 THEN 35 ELSE 25 END,
  20,
  10,
  TRUE,
  1,
  NOW()
FROM quiz_categories qc
UNION ALL
SELECT
  qc.id,
  qc.quiz_topic_group_id AS quiz_type_id,
  CONCAT(qc.name_vi, ' - Đề B'),
  CONCAT(qc.name_es, ' - Modelo B'),
  CONCAT('Bộ đề mở rộng: ', qc.name_vi),
  CONCAT('Simulacro ampliado: ', qc.name_es),
  'Đọc kỹ câu hỏi trước khi chọn đáp án.',
  'Lee bien cada pregunta antes de responder.',
  CASE WHEN qc.quiz_topic_group_id = 1 THEN 35 ELSE 25 END,
  20,
  10,
  TRUE,
  1,
  NOW()
FROM quiz_categories qc;

INSERT INTO material_topic_groups (id, code, name_vi, name_es, description_vi, description_es, is_active, created_by, created_at, updated_at)
VALUES
  (1, 'MG_THEORY', 'Tài liệu lý thuyết', 'Material de teoría', 'Tài liệu nền tảng luật và nguyên tắc lái xe', 'Material base de normas y teoría', TRUE, 1, NOW(), NOW()),
  (2, 'MG_SIGN', 'Tài liệu biển báo', 'Material de señales', 'Tài liệu chuyên về biển báo giao thông', 'Material especializado en señales', TRUE, 1, NOW(), NOW()),
  (3, 'MG_PRACTICE', 'Tài liệu thực hành', 'Material práctico', 'Tài liệu kỹ năng lái và sa hình', 'Material de práctica y maniobras', TRUE, 1, NOW(), NOW()),
  (4, 'MG_TIPS', 'Tài liệu mẹo thi', 'Material de trucos', 'Tài liệu mẹo làm bài và ghi nhớ nhanh', 'Trucos para aprobar más rápido', TRUE, 1, NOW(), NOW());

INSERT INTO material_types (material_topic_group_id, code, name_vi, name_es, description_vi, description_es, created_by, created_at)
VALUES
  (1, 'SUB_THEORY_CORE', 'Tổng hợp lý thuyết', 'Teoría general', 'Tổng hợp kiến thức lý thuyết cốt lõi', 'Resumen de teoría base', 1, NOW()),
  (1, 'SUB_THEORY_LAW', 'Luật giao thông', 'Normas de tráfico', 'Hệ thống luật giao thông cần nhớ', 'Normas de tráfico importantes', 1, NOW()),
  (1, 'SUB_THEORY_SAFETY', 'An toàn lái xe', 'Conducción segura', 'Nguyên tắc lái xe an toàn', 'Principios de conducción segura', 1, NOW()),
  (2, 'SUB_SIGN_WARNING', 'Biển báo nguy hiểm', 'Señales de peligro', 'Nhóm biển báo nguy hiểm', 'Señales de peligro', 1, NOW()),
  (2, 'SUB_SIGN_MANDATORY', 'Biển báo hiệu lệnh', 'Señales obligatorias', 'Nhóm biển báo hiệu lệnh', 'Señales obligatorias', 1, NOW()),
  (2, 'SUB_SIGN_GUIDE', 'Biển báo chỉ dẫn', 'Señales informativas', 'Nhóm biển chỉ dẫn và thông tin', 'Señales de guía e información', 1, NOW()),
  (3, 'SUB_PRACTICE_YARD', 'Sa hình cơ bản', 'Maniobras básicas', 'Bài sa hình cơ bản cho người mới', 'Maniobras básicas para principiantes', 1, NOW()),
  (3, 'SUB_PRACTICE_ADV', 'Sa hình nâng cao', 'Maniobras avanzadas', 'Bài sa hình nâng cao', 'Maniobras avanzadas', 1, NOW()),
  (4, 'SUB_TIPS_MEMORY', 'Mẹo ghi nhớ nhanh', 'Trucos de memorización', 'Mẹo học nhanh và nhớ lâu', 'Trucos para memorizar rápido', 1, NOW()),
  (4, 'SUB_TIPS_EXAM', 'Mẹo làm bài thi', 'Trucos para examen', 'Mẹo xử lý câu hỏi trong phòng thi', 'Trucos para responder en examen', 1, NOW());

INSERT INTO reference_materials (
  material_type_id, title_vi, title_es, description_vi, description_es,
  file_path_vi, file_path_es, file_size_mb_vi, page_count_vi, file_size_mb_es, page_count_es, uploaded_by, uploaded_at
)
SELECT
  mt.id,
  CONCAT(mt.name_vi, ' - Tài liệu 1'),
  CONCAT(mt.name_es, ' - Documento 1'),
  CONCAT('Tài liệu cơ bản cho chủ đề ', mt.name_vi),
  CONCAT('Documento base para ', mt.name_es),
  CONCAT('/materials/vi/', LOWER(mt.code), '_1.pdf'),
  CONCAT('/materials/es/', LOWER(mt.code), '_1.pdf'),
  2.40,
  48,
  2.35,
  46,
  1,
  NOW()
FROM material_types mt
UNION ALL
SELECT
  mt.id,
  CONCAT(mt.name_vi, ' - Tài liệu 2'),
  CONCAT(mt.name_es, ' - Documento 2'),
  CONCAT('Tài liệu nâng cao cho chủ đề ', mt.name_vi),
  CONCAT('Documento avanzado para ', mt.name_es),
  CONCAT('/materials/vi/', LOWER(mt.code), '_2.pdf'),
  CONCAT('/materials/es/', LOWER(mt.code), '_2.pdf'),
  3.10,
  72,
  3.05,
  69,
  1,
  NOW()
FROM material_types mt;
