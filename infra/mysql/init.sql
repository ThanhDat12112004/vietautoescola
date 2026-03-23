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

CREATE TABLE subjects (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(30) UNIQUE NOT NULL,
    name_vi         VARCHAR(150) NOT NULL,
    name_es         VARCHAR(150) NOT NULL,
    description_vi  TEXT,
    description_es  TEXT,
    created_by      BIGINT DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Mon hoc / Chu de';

CREATE TABLE reference_materials (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id      BIGINT NOT NULL,
    lang_code       CHAR(2) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    file_path       VARCHAR(255) NOT NULL,
    file_size_mb    DECIMAL(6,2) DEFAULT NULL,
    uploaded_by     BIGINT NOT NULL,
    uploaded_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id)  REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (lang_code)   REFERENCES languages(code),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_subject_lang (subject_id, lang_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tai lieu hoc PDF';

CREATE TABLE quizzes (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id          BIGINT DEFAULT NULL,
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
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id)  REFERENCES quiz_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)   REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject_cat (subject_id, category_id),
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
VALUES (1, 'seed_admin', 'seed_admin@local.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOeA4x0N7EzxKQEiC5EvhczFMMz9Yx8u', 'admin', 'Seed Admin', TRUE)
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

INSERT INTO subjects (id, code, name_vi, name_es, description_vi, description_es, created_by)
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
    subject_id,
    lang_code,
    title,
    description,
    file_path,
    file_size_mb,
    uploaded_by
)
VALUES
(1, 'vi', 'Ly thuyet giao thong co ban', 'Tai lieu PDF tong hop ly thuyet can nho.', '/docs/vi/ly-thuyet-co-ban.pdf', 2.40, 1),
(1, 'es', 'Teoria basica de trafico', 'Documento PDF con teoria esencial del examen.', '/docs/es/teoria-basica.pdf', 2.55, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), file_path = VALUES(file_path), file_size_mb = VALUES(file_size_mb);

INSERT INTO quizzes (
    id, subject_id, category_id, code, quiz_type,
    title_vi, title_es,
    description_vi, description_es,
    instructions_vi, instructions_es,
    duration_minutes, total_questions, passing_score, is_active, created_by
)
VALUES (
    1, 1, 1, 'QUIZ-000001', 'general',
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

SET FOREIGN_KEY_CHECKS = 1;
