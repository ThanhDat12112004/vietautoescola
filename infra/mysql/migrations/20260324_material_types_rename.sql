SET FOREIGN_KEY_CHECKS = 0;

RENAME TABLE subjects TO material_types;

ALTER TABLE reference_materials
  DROP FOREIGN KEY reference_materials_ibfk_1;

ALTER TABLE reference_materials
  DROP INDEX idx_subject_lang;

ALTER TABLE reference_materials
  CHANGE COLUMN subject_id material_type_id BIGINT NOT NULL;

ALTER TABLE reference_materials
  ADD CONSTRAINT fk_reference_materials_material_type
    FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE CASCADE;

ALTER TABLE reference_materials
  ADD INDEX idx_material_type_lang (material_type_id, lang_code);

ALTER TABLE quizzes
  DROP FOREIGN KEY quizzes_ibfk_1;

ALTER TABLE quizzes
  DROP INDEX idx_subject_cat;

ALTER TABLE quizzes
  DROP COLUMN subject_id;

ALTER TABLE quizzes
  ADD INDEX idx_category (category_id);

SET FOREIGN_KEY_CHECKS = 1;
