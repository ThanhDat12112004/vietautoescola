function normalizePeriod(value) {
  const period = String(value || 'all').trim().toLowerCase();
  return period === 'week' || period === 'month' ? period : 'all';
}

function parseLimit(value, fallback = 10, min = 1, max = 100) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseRadius(value, fallback = 3, min = 1, max = 10) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

module.exports = {
  normalizePeriod,
  parseLimit,
  parseRadius,
};
