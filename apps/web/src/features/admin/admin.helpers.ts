export function parseDateSafe(value: unknown) {
  if (!value) return null;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDateTime(value: unknown, locale: string) {
  const parsed = parseDateSafe(value);
  if (!parsed) return '-';
  return parsed.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
