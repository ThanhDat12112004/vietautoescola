type Lang = 'vi' | 'es';

export function getMaterialsHierarchyTitle(
  lang: Lang,
  materialsSubTab: 'topic_groups' | 'subjects' | 'manage'
) {
  if (lang === 'vi') {
    return materialsSubTab === 'topic_groups'
      ? 'Loại chủ đề (để phân loại tài liệu)'
      : 'Chủ đề (để phân loại tài liệu)';
  }
  return 'Temas (para organizar el temario)';
}

export function getQuizzesHierarchyTitle(
  lang: Lang,
  quizzesHierarchyTab: 'topic_groups' | 'types'
) {
  if (lang === 'vi') {
    return quizzesHierarchyTab === 'topic_groups'
      ? 'Loại chủ đề (để phân loại bài thi)'
      : 'Chủ đề (để phân loại bài thi)';
  }
  return quizzesHierarchyTab === 'topic_groups'
    ? 'Grupo de tema (para organizar exámenes)'
    : 'Temas (para organizar exámenes)';
}
