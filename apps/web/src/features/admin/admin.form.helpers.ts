export function createEmptyQuestionDraft() {
  return {
    question_text_vi: '',
    question_text_es: '',
    explanation_vi: '',
    explanation_es: '',
    answer_vi_1: '',
    answer_vi_2: '',
    answer_vi_3: '',
    answer_es_1: '',
    answer_es_2: '',
    answer_es_3: '',
    correct_index: '1',
  };
}

export function createEmptyEditQuestionDraft() {
  return {
    question_text_vi: '',
    question_text_es: '',
    explanation_vi: '',
    explanation_es: '',
    image_url: '',
    answers: [
      {
        order_number: 1,
        answer_text_vi: '',
        answer_text_es: '',
        is_correct: true,
      },
      {
        order_number: 2,
        answer_text_vi: '',
        answer_text_es: '',
        is_correct: false,
      },
      {
        order_number: 3,
        answer_text_vi: '',
        answer_text_es: '',
        is_correct: false,
      },
    ],
  };
}

export function buildStoredMediaPath(uploaded: { key?: string; cdn_url?: string } | null | undefined) {
  if (!uploaded) return '';

  const key = String(uploaded.key || '').trim();
  if (key) {
    return `/media/static/${key}`;
  }

  const cdnUrl = String(uploaded.cdn_url || '').trim();
  if (!cdnUrl) return '';

  try {
    const parsed = new URL(cdnUrl);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return cdnUrl.startsWith('/') ? cdnUrl : `/${cdnUrl}`;
  }
}

export function parseMaterialPageCountFromForm(s: string): number | null {
  if (s === '' || s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}
