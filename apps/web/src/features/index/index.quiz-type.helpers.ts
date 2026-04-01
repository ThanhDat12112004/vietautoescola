type QuizTypeCatalogItem = {
  code: string;
  name: string;
  description?: string | null;
};

export function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

export function formatQuizTypeName(value: string, quizTypeCatalog: QuizTypeCatalogItem[]) {
  const formatted = value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const matchedType = quizTypeCatalog.find(
    (quizType) =>
      normalizeText(quizType.code) === normalizeText(value) ||
      normalizeText(quizType.name) === normalizeText(formatted)
  );
  return matchedType?.name?.trim() ? matchedType.name.trim() : formatted;
}

export function getQuizTopicDescription(
  type: string,
  quizTypeCatalog: QuizTypeCatalogItem[],
  fallback: string
) {
  const formattedType = formatQuizTypeName(type, quizTypeCatalog);
  const matchedType = quizTypeCatalog.find(
    (quizType) =>
      normalizeText(quizType.code) === normalizeText(type) ||
      normalizeText(quizType.name) === normalizeText(formattedType)
  );

  if (matchedType?.description?.trim()) {
    return matchedType.description.trim();
  }

  return fallback;
}
