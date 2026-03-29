-- Số trang PDF (mỗi file VI/ES)
ALTER TABLE reference_materials
  ADD COLUMN page_count_vi INT NULL DEFAULT NULL AFTER file_size_mb_vi,
  ADD COLUMN page_count_es INT NULL DEFAULT NULL AFTER file_size_mb_es;
