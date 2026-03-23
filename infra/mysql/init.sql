SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE languages (
    code    CHAR(2) PRIMARY KEY,
    name    VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO languages (code, name) VALUES
('vi', 'Tieng Viet'),
('es', 'Espanol');

CREATE TABLE users (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    username            VARCHAR(50) UNIQUE NOT NULL,
    email               VARCHAR(100) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                ENUM('admin','teacher','student') NOT NULL DEFAULT 'student',
    current_session_id  VARCHAR(64) DEFAULT NULL,
    session_last_seen_at DATETIME DEFAULT NULL,
    full_name           VARCHAR(100),
    avatar_url          VARCHAR(255) DEFAULT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    total_score         DECIMAL(12,2) DEFAULT 0.00,
    total_quizzes       INT DEFAULT 0,
    total_correct       INT DEFAULT 0,
    total_questions     INT DEFAULT 0,
    average_percentage  DECIMAL(5,2) DEFAULT 0.00,
    last_login_at       DATETIME DEFAULT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_score (is_active, total_score DESC),
    INDEX idx_email (email),
    INDEX idx_current_session (current_session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Nguoi dung';

CREATE TABLE quiz_categories (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name_vi         VARCHAR(100) NOT NULL,
    name_es         VARCHAR(100) NOT NULL,
    slug            VARCHAR(60) UNIQUE DEFAULT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Phan loai bai kiem tra';

CREATE TABLE quiz_types (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(80) UNIQUE NOT NULL,
    name_vi         VARCHAR(150) NOT NULL,
    name_es         VARCHAR(150) NOT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Loai de thi';

CREATE TABLE material_types (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(30) UNIQUE NOT NULL,
    name_vi         VARCHAR(150) NOT NULL,
    name_es         VARCHAR(150) NOT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    created_by      BIGINT DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Phan loai tai lieu';

CREATE TABLE reference_materials (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_type_id BIGINT NOT NULL,
    lang_code       CHAR(2) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    file_path       VARCHAR(255) NOT NULL,
    file_size_mb    DECIMAL(6,2) DEFAULT NULL,
    uploaded_by     BIGINT NOT NULL,
    uploaded_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE CASCADE,
    FOREIGN KEY (lang_code)   REFERENCES languages(code),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_material_type_lang (material_type_id, lang_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tai lieu hoc PDF';

CREATE TABLE quizzes (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id         BIGINT DEFAULT NULL,
    code                VARCHAR(50) UNIQUE NOT NULL,
    quiz_type           VARCHAR(100) NOT NULL DEFAULT 'general',
    title_vi            VARCHAR(200) NOT NULL,
    title_es            VARCHAR(200) NOT NULL,
    description_vi      TEXT,
    description_es      TEXT,
    instructions_vi     TEXT,
    instructions_es     TEXT,
    duration_minutes    INT NOT NULL DEFAULT 0,
    total_questions     INT DEFAULT 0,
    passing_score       DECIMAL(5,2) DEFAULT 5.00,
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          BIGINT NOT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id)  REFERENCES quiz_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)   REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_code (code),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bai kiem tra';

CREATE TABLE questions (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id             BIGINT NOT NULL,
    order_number        INT NOT NULL,
    points              DECIMAL(5,2) DEFAULT 1.00,
    question_text_vi    TEXT NOT NULL,
    question_text_es    TEXT NOT NULL,
    explanation_vi      TEXT,
    explanation_es      TEXT,
    image_url           VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_order (quiz_id, order_number),
    INDEX idx_quiz_order (quiz_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cau hoi';

CREATE TABLE answers (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id         BIGINT NOT NULL,
    order_number        INT NOT NULL,
    is_correct          BOOLEAN DEFAULT FALSE,
    answer_text_vi      VARCHAR(400) NOT NULL,
    answer_text_es      VARCHAR(400) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_ans_order (question_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Dap an';

CREATE TABLE user_quiz_attempts (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id             BIGINT NOT NULL,
    quiz_id             BIGINT NOT NULL,
    started_at          DATETIME NOT NULL,
    finished_at         DATETIME DEFAULT NULL,
    score               DECIMAL(7,2) DEFAULT NULL,
    percentage          DECIMAL(5,2) DEFAULT NULL,
    correct_count       INT DEFAULT NULL,
    total_questions     INT DEFAULT NULL,
    status              ENUM('in_progress','completed','abandoned') DEFAULT 'in_progress',
    completed_at        DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user_quiz (user_id, quiz_id),
    INDEX idx_completed (completed_at DESC),
    INDEX idx_user_completed (user_id, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lich su lam bai';

CREATE TABLE user_answers (
    attempt_id          BIGINT NOT NULL,
    question_id         BIGINT NOT NULL,
    selected_answer_id  BIGINT DEFAULT NULL,
    short_answer_text   TEXT DEFAULT NULL,
    is_correct          BOOLEAN DEFAULT NULL,
    points_earned       DECIMAL(5,2) DEFAULT NULL,
    PRIMARY KEY (attempt_id, question_id),
    FOREIGN KEY (attempt_id) REFERENCES user_quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_answer_id) REFERENCES answers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Chi tiet dap an cua nguoi dung';

INSERT INTO users (id, username, email, password_hash, role, full_name, is_active)
VALUES (1, 'seed_admin', 'seed_admin@local.test', '$2a$10$A0xbDZbAp0ytSBgceT3U6uvzxEGfZ2lM1AH3P/nCn4coK9eEyyxA.', 'admin', 'Seed Admin', TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO quiz_categories (id, name_vi, name_es, slug, description_vi, description_es, is_active)
VALUES (
    1,
    'Bien bao giao thong',
    'Senales de trafico',
    'bien-bao-giao-thong',
    'Cau hoi bien bao va tinh huong giao thong co ban',
    'Preguntas sobre senales y situaciones basicas de trafico',
    TRUE
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO quiz_types (id, code, name_vi, name_es, description_vi, description_es, is_active)
VALUES
(1, 'general', 'De tong hop', 'Examen general', 'Bo cau hoi tong hop nhieu nhom noi dung.', 'Coleccion de preguntas mixtas de varias areas.', TRUE),
(2, 'bien_bao', 'Bien bao giao thong', 'Senales de trafico', 'Tap trung vao nhan biet va xu ly bien bao.', 'Enfocado en reconocimiento y uso de senales.', TRUE),
(3, 'cao_toc', 'Duong cao toc', 'Autopista', 'Cau hoi ve nhap lan, toc do va an toan tren cao toc.', 'Preguntas sobre incorporacion, velocidad y seguridad en autopista.', TRUE),
(4, 'ly_thuyet', 'Ly thuyet', 'Teoria', 'Nhom cau hoi ly thuyet co ban de on thi.', 'Preguntas teoricas basicas para practicar.', TRUE),
(5, 'an_toan', 'An toan lai xe', 'Seguridad vial', 'Kien thuc va tinh huong lai xe an toan.', 'Conocimientos y situaciones de conduccion segura.', TRUE),
(6, 'sa_hinh', 'Sa hinh', 'Pista', 'Bai tap tinh huong sa hinh va thao tac xe.', 'Ejercicios de circuito y maniobras del vehiculo.', TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO material_types (id, code, name_vi, name_es, description_vi, description_es, created_by)
VALUES (
    1,
    'DGT_BASE',
    'Luyen thi lai xe co ban',
    'Practica basica DGT',
    'Tong hop cau hoi mo phong de thi DGT',
    'Coleccion de preguntas para simulador DGT',
    1
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO reference_materials (
    material_type_id,
    lang_code,
    title,
    description,
    file_path,
    file_size_mb,
    uploaded_by
)
VALUES
(1, 'vi', 'Ly thuyet giao thong co ban', 'Tai lieu PDF tong hop ly thuyet can nho.', '/docs/vi/ly-thuyet-co-ban.pdf', 2.40, 1),
(1, 'vi', 'Cau truc de thi co ban', 'Tong hop cau truc de thi va meo lam bai.', '/docs/vi/cau-truc-de-thi-co-ban.pdf', 2.10, 1),
(1, 'vi', 'Meo nho bien bao', 'Tai lieu tong hop cac nhom bien bao thuong gap.', '/docs/vi/meo-nho-bien-bao.pdf', 2.05, 1),
(1, 'es', 'Teoria basica de trafico', 'Documento PDF con teoria esencial del examen.', '/docs/es/teoria-basica.pdf', 2.55, 1),
(1, 'es', 'Estructura del examen base', 'Resumen de estructura y consejos para el examen.', '/docs/es/estructura-examen-base.pdf', 2.20, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), file_path = VALUES(file_path), file_size_mb = VALUES(file_size_mb);

INSERT INTO quizzes (
    id, category_id, code, quiz_type,
    title_vi, title_es,
    description_vi, description_es,
    instructions_vi, instructions_es,
    duration_minutes, total_questions, passing_score, is_active, created_by
)
VALUES (
    1, 1, 'QUIZ-000001', 'general',
    'De thi mo phong DGT 30 cau',
    'Simulador DGT 30 preguntas',
    'De mo phong cho nguoi hoc thi bang lai tai Tay Ban Nha',
    'Examen simulado para estudiantes de conducir en Espana',
    'Chon dap an dung nhat cho tung cau hoi',
    'Selecciona la mejor respuesta para cada pregunta',
    0, 3, 5.00, TRUE, 1
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO questions (
    id, quiz_id, order_number, points,
    question_text_vi, question_text_es,
    explanation_vi, explanation_es,
    image_url
)
VALUES
(
    1, 1, 1, 1.00,
    'Trong khu dan cu, bien nao bao hieu toc do toi da 30 km/h?',
    'En zona urbana, que senal indica velocidad maxima de 30 km/h?',
    'Bien tron vien do co so 30 la gioi han toc do toi da 30 km/h.',
    'La senal circular con borde rojo y numero 30 indica velocidad maxima de 30 km/h.',
    NULL
),
(
    2, 1, 2, 1.00,
    'Khi vao duong cao toc, ban can lam gi?',
    'Al incorporarte a una autopista, que debes hacer?',
    'Can tang toc o lan tang toc va nhuong duong cho xe dang di tren cao toc.',
    'Debes acelerar por el carril de incorporacion y ceder el paso al trafico de la autopista.',
    NULL
),
(
    3, 1, 3, 1.00,
    'Su dung dien thoai khi dang lai xe co duoc phep khong?',
    'Se permite usar el movil mientras conduces?',
    'Khong duoc phep, tru khi xe da dung dung quy dinh va an toan.',
    'No esta permitido, salvo situaciones legalmente permitidas con el vehiculo detenido con seguridad.',
    NULL
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO answers (question_id, order_number, is_correct, answer_text_vi, answer_text_es)
VALUES
(1, 1, TRUE,  'Bien tron vien do ghi so 30', 'La senal circular con borde rojo y numero 30'),
(1, 2, FALSE, 'Bien tam giac canh bao nguy hiem', 'La senal triangular de peligro'),
(1, 3, FALSE, 'Bien tron nen xanh huong dan', 'La senal circular azul de obligacion'),

(2, 1, TRUE,  'Tang toc tren lan tang toc va quan sat de nhap an toan', 'Acelerar en el carril de incorporacion y entrar con seguridad'),
(2, 2, FALSE, 'Dung han o dau duong cao toc va cho trong', 'Parar en el inicio de la autopista para esperar hueco'),
(2, 3, FALSE, 'Di cham tren lan khan cap', 'Circular despacio por el arcen'),

(3, 1, TRUE,  'Khong duoc dung dien thoai cam tay khi dang lai xe', 'No se permite usar el movil en la mano mientras conduces'),
(3, 2, FALSE, 'Duoc dung neu duong vang', 'Si se permite si la via esta despejada'),
(3, 3, FALSE, 'Duoc dung moi luc neu la tai xe kinh nghiem', 'Se permite siempre para conductores con experiencia')
ON DUPLICATE KEY UPDATE question_id = question_id;

-- ---------------------------------------------------------------------------
-- Bulk synthetic seed data (large dataset)
-- ---------------------------------------------------------------------------

INSERT INTO quiz_categories (id, name_vi, name_es, slug, description_vi, description_es, is_active)
VALUES
(2, 'Tinh huong do thi', 'Situaciones urbanas', 'tinh-huong-do-thi', 'Tinh huong giao thong trong do thi.', 'Situaciones de trafico en ciudad.', TRUE),
(3, 'Nhuong duong', 'Prioridad de paso', 'nhuong-duong', 'Quy tac nhuong duong.', 'Reglas de prioridad de paso.', TRUE),
(4, 'Duong cao toc nang cao', 'Autopista avanzada', 'duong-cao-toc-nang-cao', 'Tinh huong nang cao tren cao toc.', 'Situaciones avanzadas en autopista.', TRUE),
(5, 'An toan va phan xa', 'Seguridad y reflejos', 'an-toan-va-phan-xa', 'Ky nang xu ly tinh huong nguy hiem.', 'Habilidades ante situaciones peligrosas.', TRUE),
(6, 'Ky thuat lai xe', 'Tecnica de conduccion', 'ky-thuat-lai-xe', 'Nguyen tac dieu khien xe an toan.', 'Principios de conduccion segura.', TRUE),
(7, 'Luật va bien phat', 'Normativa y sanciones', 'luat-va-bien-phat', 'Quy dinh va muc phat thuong gap.', 'Normativa y sanciones comunes.', TRUE),
(8, 'Moc sa hinh nang cao', 'Pista avanzada', 'moc-sa-hinh-nang-cao', 'Bai tap sa hinh nang cao.', 'Ejercicios avanzados de pista.', TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO users (username, email, password_hash, role, full_name, is_active)
SELECT
    gen_users.username,
    gen_users.email,
    '$2a$10$A0xbDZbAp0ytSBgceT3U6uvzxEGfZ2lM1AH3P/nCn4coK9eEyyxA.',
    gen_users.role,
    gen_users.full_name,
    TRUE
FROM (
    SELECT
        n,
        CASE
            WHEN n <= 40 THEN CONCAT('teacher_', LPAD(n, 4, '0'))
            ELSE CONCAT('student_', LPAD(n - 40, 5, '0'))
        END AS username,
        CASE
            WHEN n <= 40 THEN CONCAT('teacher_', LPAD(n, 4, '0'), '@seed.local')
            ELSE CONCAT('student_', LPAD(n - 40, 5, '0'), '@seed.local')
        END AS email,
        CASE
            WHEN n <= 40 THEN 'teacher'
            ELSE 'student'
        END AS role,
        CASE
            WHEN n <= 40 THEN CONCAT('Teacher Seed ', LPAD(n, 4, '0'))
            ELSE CONCAT('Student Seed ', LPAD(n - 40, 5, '0'))
        END AS full_name
    FROM (
        SELECT ones.n + tens.n * 10 + hundreds.n * 100 AS n
        FROM
            (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
            CROSS JOIN
            (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
            CROSS JOIN
            (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) hundreds
    ) seq_users
    WHERE n BETWEEN 1 AND 360
) gen_users
LEFT JOIN users u ON u.username = gen_users.username
WHERE u.id IS NULL;

INSERT INTO material_types (code, name_vi, name_es, description_vi, description_es, created_by)
SELECT
    gen_mat.code,
    gen_mat.name_vi,
    gen_mat.name_es,
    gen_mat.description_vi,
    gen_mat.description_es,
    1
FROM (
    SELECT
        CONCAT('DGT_BULK_', LPAD(n, 4, '0')) AS code,
        CONCAT('Chu de tai lieu ', LPAD(n, 4, '0')) AS name_vi,
        CONCAT('Tema material ', LPAD(n, 4, '0')) AS name_es,
        CONCAT('Mo ta tai lieu tong hop so ', LPAD(n, 4, '0')) AS description_vi,
        CONCAT('Descripcion material de referencia ', LPAD(n, 4, '0')) AS description_es
    FROM (
        SELECT ones.n + tens.n * 10 + hundreds.n * 100 AS n
        FROM
            (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
            CROSS JOIN
            (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
            CROSS JOIN
            (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) hundreds
    ) seq_mat
    WHERE n BETWEEN 1 AND 9
) gen_mat
LEFT JOIN material_types mt ON mt.code = gen_mat.code
WHERE mt.id IS NULL;

INSERT INTO reference_materials (material_type_id, lang_code, title, description, file_path, file_size_mb, uploaded_by)
SELECT
    mt.id,
    doc.lang_code,
    CASE
        WHEN doc.lang_code = 'vi' THEN CONCAT('Tai lieu ', mt.code, ' (VI) - Phan ', doc.doc_no)
        ELSE CONCAT('Material ', mt.code, ' (ES) - Parte ', doc.doc_no)
    END AS title,
    CASE
        WHEN doc.lang_code = 'vi' THEN CONCAT('Mo ta chi tiet phan ', doc.doc_no, ' cho ', mt.code)
        ELSE CONCAT('Descripcion detallada parte ', doc.doc_no, ' para ', mt.code)
    END AS description,
    CASE
        WHEN doc.lang_code = 'vi' THEN CONCAT('/docs/vi/', LOWER(mt.code), '-p', doc.doc_no, '.pdf')
        ELSE CONCAT('/docs/es/', LOWER(mt.code), '-p', doc.doc_no, '.pdf')
    END AS file_path,
    ROUND(1 + ((mt.id + doc.doc_no) % 11) * 0.27, 2) AS file_size_mb,
    1
FROM material_types mt
JOIN (
    SELECT 'vi' AS lang_code, 1 AS doc_no
    UNION ALL SELECT 'vi', 2
    UNION ALL SELECT 'vi', 3
    UNION ALL SELECT 'es', 1
    UNION ALL SELECT 'es', 2
) doc
LEFT JOIN reference_materials rm
    ON rm.material_type_id = mt.id
 AND rm.lang_code = doc.lang_code
 AND rm.file_path = CASE
        WHEN doc.lang_code = 'vi' THEN CONCAT('/docs/vi/', LOWER(mt.code), '-p', doc.doc_no, '.pdf')
        ELSE CONCAT('/docs/es/', LOWER(mt.code), '-p', doc.doc_no, '.pdf')
    END
WHERE rm.id IS NULL
    AND mt.code LIKE 'DGT_BULK_%';

INSERT INTO quizzes (
    category_id,
    code,
    quiz_type,
    title_vi,
    title_es,
    description_vi,
    description_es,
    instructions_vi,
    instructions_es,
    duration_minutes,
    total_questions,
    passing_score,
    is_active,
    created_by
)
SELECT
    ((n - 1) % 8) + 1 AS category_id,
    CONCAT('QUIZ-BULK-', LPAD(n, 6, '0')) AS code,
    CASE ((n - 1) % 6)
        WHEN 0 THEN 'general'
        WHEN 1 THEN 'bien_bao'
        WHEN 2 THEN 'cao_toc'
        WHEN 3 THEN 'ly_thuyet'
        WHEN 4 THEN 'an_toan'
        ELSE 'sa_hinh'
    END AS quiz_type,
    CONCAT('De thi tong hop so ', LPAD(n, 6, '0')) AS title_vi,
    CONCAT('Examen de practica ', LPAD(n, 6, '0')) AS title_es,
    CONCAT('Mo ta de thi so ', LPAD(n, 6, '0')) AS description_vi,
    CONCAT('Descripcion de examen ', LPAD(n, 6, '0')) AS description_es,
    'Chon dap an dung nhat cho moi cau hoi.' AS instructions_vi,
    'Selecciona la mejor respuesta para cada pregunta.' AS instructions_es,
    0,
    20,
    10.00,
    TRUE,
    1
FROM (
    SELECT ones.n + tens.n * 10 + hundreds.n * 100 AS n
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
        CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
        CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) hundreds
) s
LEFT JOIN quizzes q ON q.code = CONCAT('QUIZ-BULK-', LPAD(s.n, 6, '0'))
WHERE s.n BETWEEN 1 AND 420
    AND q.id IS NULL;

INSERT INTO questions (
    quiz_id,
    order_number,
    points,
    question_text_vi,
    question_text_es,
    explanation_vi,
    explanation_es,
    image_url
)
SELECT
    q.id,
    o.n,
    0.50,
    CONCAT('Cau hoi ', o.n, ' cua ', q.code, ' (VI)') AS question_text_vi,
    CONCAT('Pregunta ', o.n, ' de ', q.code, ' (ES)') AS question_text_es,
    CONCAT('Giai thich cho cau ', o.n, ' cua ', q.code) AS explanation_vi,
    CONCAT('Explicacion para pregunta ', o.n, ' de ', q.code) AS explanation_es,
    NULL
FROM quizzes q
JOIN (
    SELECT ones.n + tens.n * 10 AS n
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
        CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) tens
    WHERE ones.n + tens.n * 10 BETWEEN 1 AND 20
) o
LEFT JOIN questions qq
    ON qq.quiz_id = q.id
 AND qq.order_number = o.n
WHERE q.code LIKE 'QUIZ-BULK-%'
    AND qq.id IS NULL;

INSERT INTO answers (
    question_id,
    order_number,
    is_correct,
    answer_text_vi,
    answer_text_es
)
SELECT
    qq.id,
    ans.order_number,
    CASE WHEN ans.order_number = 1 THEN TRUE ELSE FALSE END AS is_correct,
    CONCAT('Dap an ', ans.label, ' cho cau ', qq.order_number, ' - ', q.code) AS answer_text_vi,
    CONCAT('Respuesta ', ans.label, ' para pregunta ', qq.order_number, ' - ', q.code) AS answer_text_es
FROM questions qq
JOIN quizzes q ON q.id = qq.quiz_id
JOIN (
    SELECT 1 AS order_number, 'A' AS label
    UNION ALL
    SELECT 2, 'B'
    UNION ALL
    SELECT 3, 'C'
) ans
LEFT JOIN answers aa
    ON aa.question_id = qq.id
 AND aa.order_number = ans.order_number
WHERE q.code LIKE 'QUIZ-BULK-%'
    AND aa.id IS NULL;

SET FOREIGN_KEY_CHECKS = 1;
