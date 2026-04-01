type SupportedLanguage = 'vi' | 'es';

type QuizTypeLike = {
  id: number | string;
  code: string;
  name_vi?: string;
  name_es?: string;
};

export function getQuizTypeLabel(typeItem: QuizTypeLike, lang: SupportedLanguage) {
  return lang === 'es' ? String(typeItem.name_es || '') : String(typeItem.name_vi || '');
}

export function getQuizTypeFilterKey(
  item: Record<string, unknown>,
  quizTypes: QuizTypeLike[]
) {
  if (item.quiz_type_id != null) return String(item.quiz_type_id);

  const byCode = quizTypes.find((typeItem) => typeItem.code === String(item.quiz_type || ''));
  if (byCode) return String(byCode.id);

  return String(item.quiz_type || '');
}

export function getQuizTypeDisplayName(
  item: Record<string, unknown>,
  lang: SupportedLanguage,
  quizTypes: QuizTypeLike[]
) {
  if (lang === 'es' && item.quiz_type_name_es) return String(item.quiz_type_name_es);
  if (lang === 'vi' && item.quiz_type_name_vi) return String(item.quiz_type_name_vi);

  const byId = quizTypes.find(
    (typeItem) => String(typeItem.id) === getQuizTypeFilterKey(item, quizTypes)
  );
  if (byId) return getQuizTypeLabel(byId, lang);

  return String(item.quiz_type || '-');
}

export function getQuizDisplayTitle(item: Record<string, unknown>, lang: SupportedLanguage) {
  if (lang === 'es') return String(item.title_es || item.title_vi || item.code || '-');
  return String(item.title_vi || item.title_es || item.code || '-');
}

export function getQuizDisplayDescription(item: Record<string, unknown>, lang: SupportedLanguage) {
  if (lang === 'es') return String(item.description_es || item.description_vi || '-');
  return String(item.description_vi || item.description_es || '-');
}
