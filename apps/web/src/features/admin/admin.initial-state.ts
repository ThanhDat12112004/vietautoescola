export function createInitialEditUserForm() {
  return {
    username: '',
    email: '',
    full_name: '',
    role: 'student',
    is_active: true,
    password: '',
  };
}

export function createInitialMaterialTopicGroupForm() {
  return {
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  };
}

export function createInitialEditMaterialTopicGroupForm() {
  return {
    code: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  };
}

export function createInitialSubjectForm() {
  return {
    material_topic_group_id: 1,
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  };
}

export function createInitialEditMaterialForm() {
  return {
    subject_id: '',
    title_vi: '',
    title_es: '',
    description_vi: '',
    description_es: '',
    file_path_vi: '',
    file_path_es: '',
    file_size_mb_vi: '',
    file_size_mb_es: '',
    page_count_vi: '',
    page_count_es: '',
  };
}

export function createInitialUploadState() {
  return { vi: false, es: false };
}

export function createInitialPickedFileNameState() {
  return { vi: '', es: '' };
}

export function createInitialMaterialForm() {
  return {
    title_vi: '',
    description_vi: '',
    title_es: '',
    description_es: '',
  };
}

export function createInitialQuizForm(defaultQuizTypeCode: string) {
  return {
    quiz_topic_group_id: '',
    category_id: '',
    quiz_type: defaultQuizTypeCode,
    title_vi: '',
    title_es: '',
    description_vi: '',
    description_es: '',
    instructions_vi: '',
    instructions_es: '',
  };
}

export function createInitialQuizTopicGroupForm() {
  return {
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  };
}

export function createInitialEditQuizTopicGroupForm() {
  return {
    code: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  };
}

export function createInitialQuizTypeForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  };
}

export function createInitialEditQuizTypeForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  };
}

export function createInitialQuizCategoryForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  };
}

export function createInitialEditQuizCategoryForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    slug: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  };
}

export function createInitialEditQuizForm(defaultQuizTypeCode: string) {
  return {
    quiz_topic_group_id: '',
    category_id: '',
    quiz_type: defaultQuizTypeCode,
    title_vi: '',
    title_es: '',
    description_vi: '',
    description_es: '',
    instructions_vi: '',
    instructions_es: '',
    is_active: true,
  };
}
