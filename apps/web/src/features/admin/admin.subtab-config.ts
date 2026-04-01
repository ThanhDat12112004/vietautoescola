type Lang = 'vi' | 'es';

export function getMaterialsSubtabs(lang: Lang) {
  return [
    {
      id: 'topic_groups' as const,
      label: lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema',
    },
    {
      id: 'subjects' as const,
      label: lang === 'vi' ? 'Chủ đề' : 'Tema',
    },
    {
      id: 'manage' as const,
      label: lang === 'vi' ? 'Tài liệu' : 'Materiales',
    },
  ];
}

export function resolveMaterialsSubtabState(tabId: 'topic_groups' | 'subjects' | 'manage') {
  return tabId;
}

export function getQuizzesSubtabs(lang: Lang) {
  return [
    {
      id: 'topic_groups' as const,
      label: lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema',
    },
    {
      id: 'types' as const,
      label: lang === 'vi' ? 'Chủ đề' : 'Temas',
    },
    {
      id: 'manage' as const,
      label: lang === 'vi' ? 'Bài thi' : 'Exámenes',
    },
  ];
}

export function isQuizzesSubtabActive(
  tabId: 'topic_groups' | 'types' | 'manage',
  quizzesSubTab: 'types' | 'manage',
  quizzesHierarchyTab: 'topic_groups' | 'types'
) {
  if (tabId === 'topic_groups') {
    return quizzesSubTab === 'types' && quizzesHierarchyTab === 'topic_groups';
  }
  if (tabId === 'types') {
    return quizzesSubTab === 'types' && quizzesHierarchyTab === 'types';
  }
  return quizzesSubTab === 'manage';
}

export function resolveQuizzesSubtabState(tabId: 'topic_groups' | 'types' | 'manage') {
  if (tabId === 'topic_groups' || tabId === 'types') {
    return {
      quizzesSubTab: 'types' as const,
      quizzesHierarchyTab: tabId,
    };
  }
  return {
    quizzesSubTab: 'manage' as const,
    quizzesHierarchyTab: null,
  };
}
