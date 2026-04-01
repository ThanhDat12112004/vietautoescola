type Lang = 'vi' | 'es';
type NoticeType = 'error' | 'success';

export function pushTimedNotice(
  setNotice: (value: { text: string; type: NoticeType }) => void,
  payload: { text: string; type: NoticeType },
  timeoutMs = 5000
) {
  setNotice(payload);
  window.setTimeout(() => setNotice({ text: '', type: 'error' }), timeoutMs);
}

export function showErrorNotice(
  setNotice: (value: { text: string; type: NoticeType }) => void,
  message: string
) {
  pushTimedNotice(setNotice, { text: message, type: 'error' });
}

export function showSuccessNotice(
  setNotice: (value: { text: string; type: NoticeType }) => void,
  lang: Lang,
  viText: string,
  esText: string
) {
  pushTimedNotice(setNotice, { text: lang === 'vi' ? viText : esText, type: 'success' });
}
