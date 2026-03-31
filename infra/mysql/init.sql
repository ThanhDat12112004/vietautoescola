SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

CREATE TABLE quiz_topic_groups (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(30) UNIQUE NOT NULL,
    name_vi         VARCHAR(150) NOT NULL,
    name_es         VARCHAR(150) NOT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Nhom loai chu de bai thi';

CREATE TABLE quiz_categories (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_topic_group_id BIGINT NOT NULL DEFAULT 1,
    name_vi         VARCHAR(100) NOT NULL,
    name_es         VARCHAR(100) NOT NULL,
    slug            VARCHAR(60) UNIQUE DEFAULT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_topic_group_id) REFERENCES quiz_topic_groups(id) ON DELETE RESTRICT,
    INDEX idx_quiz_category_topic_group (quiz_topic_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Phan loai bai kiem tra';

CREATE TABLE material_topic_groups (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(40) UNIQUE NOT NULL,
    name_vi         VARCHAR(150) NOT NULL,
    name_es         VARCHAR(150) NOT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      BIGINT DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Nhom loai chu de tai lieu';

CREATE TABLE material_types (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_topic_group_id BIGINT NOT NULL DEFAULT 1,
    code            VARCHAR(30) UNIQUE NOT NULL,
    name_vi         VARCHAR(150) NOT NULL,
    name_es         VARCHAR(150) NOT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    created_by      BIGINT DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_topic_group_id) REFERENCES material_topic_groups(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Phan loai tai lieu';

CREATE TABLE reference_materials (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_type_id BIGINT NOT NULL,
    title_vi         VARCHAR(200) NOT NULL,
    title_es         VARCHAR(200) NOT NULL,
    description_vi   TEXT,
    description_es   TEXT,
    file_path_vi     VARCHAR(255) NOT NULL,
    file_path_es     VARCHAR(255) NOT NULL,
    file_size_mb_vi  DECIMAL(6,2) DEFAULT NULL,
    page_count_vi    INT DEFAULT NULL,
    file_size_mb_es  DECIMAL(6,2) DEFAULT NULL,
    page_count_es    INT DEFAULT NULL,
    uploaded_by      BIGINT NOT NULL,
    uploaded_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_material_type (material_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tai lieu hoc PDF';

CREATE TABLE quizzes (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id         BIGINT DEFAULT NULL,
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

INSERT INTO quiz_topic_groups (id, code, name_vi, name_es, description_vi, description_es, is_active)
VALUES
(1, 'QG_REAL', 'De thi that', 'Examen real', 'Nhom de thi sat voi de thi that.', 'Grupo de examenes similares al examen real.', TRUE),
(2, 'QG_LEVEL', 'De theo muc do', 'Examen por nivel', 'Nhom de thi theo muc do kho.', 'Grupo de examenes por nivel de dificultad.', TRUE),
(3, 'QG_TRICK', 'De cau hoi meo', 'Preguntas trampa', 'Nhom de thi voi cac cau hoi meo thuong gap.', 'Grupo de examenes con preguntas trampa frecuentes.', TRUE),
(4, 'QG_CHAPTER', 'De thi theo chuong', 'Examen por tema', 'Nhom de thi theo tung chuong noi dung.', 'Grupo de examenes por tema/capitulo.', TRUE),
(5, 'QG_COMMON', 'De thi hay gap', 'Examen frecuente', 'Nhom de thi tong hop hay gap.', 'Grupo de examenes frecuentes.', TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO quiz_categories (id, quiz_topic_group_id, name_vi, name_es, slug, description_vi, description_es, is_active)
VALUES
(1, 1, 'Bien bao giao thong', 'Senales de trafico', 'bien-bao-giao-thong', 'Cau hoi bien bao va tinh huong giao thong co ban', 'Preguntas sobre senales y situaciones basicas de trafico', TRUE),
(2, 5, 'Tinh huong do thi', 'Situaciones urbanas', 'tinh-huong-do-thi', 'Tinh huong giao thong trong do thi.', 'Situaciones de trafico en ciudad.', TRUE),
(3, 1, 'Nhuong duong', 'Prioridad de paso', 'nhuong-duong', 'Quy tac nhuong duong.', 'Reglas de prioridad de paso.', TRUE),
(4, 2, 'Duong cao toc nang cao', 'Autopista avanzada', 'duong-cao-toc-nang-cao', 'Tinh huong nang cao tren cao toc.', 'Situaciones avanzadas en autopista.', TRUE),
(5, 3, 'An toan va phan xa', 'Seguridad y reflejos', 'an-toan-va-phan-xa', 'Ky nang xu ly tinh huong nguy hiem.', 'Habilidades ante situaciones peligrosas.', TRUE),
(6, 4, 'Ky thuat lai xe', 'Tecnica de conduccion', 'ky-thuat-lai-xe', 'Nguyen tac dieu khien xe an toan.', 'Principios de conduccion segura.', TRUE),
(7, 5, 'Luat va bien phat', 'Normativa y sanciones', 'luat-va-bien-phat', 'Quy dinh va muc phat thuong gap.', 'Normativa y sanciones comunes.', TRUE),
(8, 4, 'Moc sa hinh nang cao', 'Pista avanzada', 'moc-sa-hinh-nang-cao', 'Bai tap sa hinh nang cao.', 'Ejercicios avanzados de pista.', TRUE)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO material_topic_groups
    (id, code, name_vi, name_es, description_vi, description_es, is_active, created_by)
VALUES
(1, 'MG_THEORY', 'Tai lieu ly thuyet', 'Material teorico', 'Nhom tai lieu ly thuyet tong hop.', 'Grupo de material teorico general.', TRUE, 1),
(2, 'MG_SIGN', 'Tai lieu bien bao', 'Material de senales', 'Nhom tai lieu bien bao giao thong.', 'Grupo de material de senales de trafico.', TRUE, 1),
(3, 'MG_PRACTICE', 'Tai lieu thuc hanh', 'Material practico', 'Nhom tai lieu bai tap va tinh huong.', 'Grupo de material practico y situaciones.', TRUE, 1),
(4, 'MG_TIPS', 'Tai lieu meo thi', 'Material de consejos', 'Nhom tai lieu meo thi va ghi nho.', 'Grupo de material de consejos de examen.', TRUE, 1)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO material_types (id, material_topic_group_id, code, name_vi, name_es, description_vi, description_es, created_by)
VALUES (
    1,
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
    title_vi,
    title_es,
    description_vi,
    description_es,
    file_path_vi,
    file_path_es,
    file_size_mb_vi,
    page_count_vi,
    file_size_mb_es,
    page_count_es,
    uploaded_by
)
VALUES
(1, 'Ly thuyet giao thong co ban', 'Teoria basica de trafico', 'Tai lieu PDF tong hop ly thuyet can nho.', 'Documento PDF con teoria esencial del examen.', '/docs/vi/ly-thuyet-co-ban.pdf', '/docs/es/teoria-basica.pdf', 2.40, 48, 2.55, 50, 1),
(1, 'Cau truc de thi co ban', 'Estructura del examen base', 'Tong hop cau truc de thi va meo lam bai.', 'Resumen de estructura y consejos para el examen.', '/docs/vi/cau-truc-de-thi-co-ban.pdf', '/docs/es/estructura-examen-base.pdf', 2.10, 32, 2.20, 32, 1),
(1, 'Meo nho bien bao', 'Guia rapida de senales', 'Tai lieu tong hop cac nhom bien bao thuong gap.', 'Material de referencia con grupos de senales frecuentes.', '/docs/vi/meo-nho-bien-bao.pdf', '/docs/es/guia-rapida-senales.pdf', 2.05, 24, 2.05, 24, 1)
ON DUPLICATE KEY UPDATE
title_vi = VALUES(title_vi),
title_es = VALUES(title_es),
description_vi = VALUES(description_vi),
description_es = VALUES(description_es),
file_path_vi = VALUES(file_path_vi),
file_path_es = VALUES(file_path_es),
file_size_mb_vi = VALUES(file_size_mb_vi),
page_count_vi = VALUES(page_count_vi),
file_size_mb_es = VALUES(file_size_mb_es),
page_count_es = VALUES(page_count_es);

INSERT INTO quizzes (
    id, category_id,
    title_vi, title_es,
    description_vi, description_es,
    instructions_vi, instructions_es,
    duration_minutes, total_questions, passing_score, is_active, created_by
)
VALUES (
    1, 1,
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

INSERT INTO material_types (material_topic_group_id, code, name_vi, name_es, description_vi, description_es, created_by)
SELECT
    ((gen_mat.n - 1) % 4) + 1 AS material_topic_group_id,
    gen_mat.code,
    gen_mat.name_vi,
    gen_mat.name_es,
    gen_mat.description_vi,
    gen_mat.description_es,
    1
FROM (
    SELECT
        n,
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

INSERT INTO reference_materials (
    material_type_id,
    title_vi,
    title_es,
    description_vi,
    description_es,
    file_path_vi,
    file_path_es,
    file_size_mb_vi,
    page_count_vi,
    file_size_mb_es,
    page_count_es,
    uploaded_by
)
SELECT
    mt.id,
    CONCAT('Tai lieu ', mt.code, ' (VI) - Phan ', doc.doc_no) AS title_vi,
    CONCAT('Material ', mt.code, ' (ES) - Parte ', doc.doc_no) AS title_es,
    CONCAT('Mo ta chi tiet phan ', doc.doc_no, ' cho ', mt.code) AS description_vi,
    CONCAT('Descripcion detallada parte ', doc.doc_no, ' para ', mt.code) AS description_es,
    CONCAT('/docs/vi/', LOWER(mt.code), '-p', doc.doc_no, '.pdf') AS file_path_vi,
    CONCAT('/docs/es/', LOWER(mt.code), '-p', doc.doc_no, '.pdf') AS file_path_es,
    ROUND(1 + ((mt.id + doc.doc_no) % 11) * 0.27, 2) AS file_size_mb_vi,
    12 + ((mt.id + doc.doc_no) % 40) AS page_count_vi,
    ROUND(1 + ((mt.id + doc.doc_no + 3) % 11) * 0.27, 2) AS file_size_mb_es,
    12 + ((mt.id + doc.doc_no + 1) % 40) AS page_count_es,
    1
FROM material_types mt
JOIN (
    SELECT 1 AS doc_no
    UNION ALL SELECT 2
    UNION ALL SELECT 3
) doc
LEFT JOIN reference_materials rm
    ON rm.material_type_id = mt.id
 AND rm.file_path_vi = CONCAT('/docs/vi/', LOWER(mt.code), '-p', doc.doc_no, '.pdf')
WHERE rm.id IS NULL
    AND mt.code LIKE 'DGT_BULK_%';

INSERT INTO quizzes (
    category_id,
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
LEFT JOIN quizzes q ON q.title_vi = CONCAT('De thi tong hop so ', LPAD(s.n, 6, '0'))
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
    CONCAT('Cau hoi ', o.n, ' cua de ', q.id, ' (VI)') AS question_text_vi,
    CONCAT('Pregunta ', o.n, ' del examen ', q.id, ' (ES)') AS question_text_es,
    CONCAT('Giai thich cho cau ', o.n, ' cua de ', q.id) AS explanation_vi,
    CONCAT('Explicacion para pregunta ', o.n, ' del examen ', q.id) AS explanation_es,
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
WHERE q.title_vi LIKE 'De thi tong hop so %'
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
    CONCAT('Dap an ', ans.label, ' cho cau ', qq.order_number, ' - de ', q.id) AS answer_text_vi,
    CONCAT('Respuesta ', ans.label, ' para pregunta ', qq.order_number, ' - examen ', q.id) AS answer_text_es
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
WHERE q.title_vi LIKE 'De thi tong hop so %'
    AND aa.id IS NULL;

SET FOREIGN_KEY_CHECKS = 1;
