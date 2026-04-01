export function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '00')}`;
}
