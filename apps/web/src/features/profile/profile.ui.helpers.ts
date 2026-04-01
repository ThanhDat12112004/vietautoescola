export function buildRankMotivation(rank: number | null, lang: 'vi' | 'es') {
  if (!rank) {
    return lang === 'vi'
      ? 'Làm bài thi để tích điểm và xuất hiện trên bảng xếp hạng — mỗi bài đều đếm!'
      : 'Haz exámenes para sumar puntos y entrar en el ranking: ¡cada intento cuenta!';
  }
  if (rank === 1) {
    return lang === 'vi'
      ? 'Bạn đang dẫn đầu bảng — duy trì nhịp luyện để giữ ngôi vương!'
      : 'Lideras la clasificación: ¡mantén el ritmo para seguir arriba!';
  }
  if (rank <= 3) {
    return lang === 'vi'
      ? `Bạn đang top #${rank} — thêm vài bài nữa để tranh hạng cao hơn!`
      : `¡Estás en el top #${rank}! Unos exámenes más y subes posiciones.`;
  }
  if (rank <= 10) {
    return lang === 'vi'
      ? `Bạn đã lọt top 10 (#${rank}) — cố một nhịp nữa để tiến xa hơn!`
      : `¡Entre los 10 primeros (#${rank})! Sigue practicando para subir.`;
  }
  return lang === 'vi'
    ? `Hạng #${rank} — mỗi lần làm bài đều giúp bạn tiến lên.`
    : `Puesto #${rank}: cada examen te acerca a los primeros puestos.`;
}

export function toUpdateErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
