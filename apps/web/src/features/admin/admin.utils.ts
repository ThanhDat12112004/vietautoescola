export function fileNameFromStoredPath(path: string): string {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export function isPdfFile(file: File): boolean {
  const t = (file.type || '').toLowerCase();
  if (t === 'application/pdf') return true;
  return file.name.toLowerCase().endsWith('.pdf');
}

/** Hiển thị vai trò tài khoản bằng ngôn ngữ người dùng (không dùng mã tiếng Anh thuần). */
export function formatUserRole(role: string, lang: 'vi' | 'es'): string {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return lang === 'vi' ? 'Quản trị viên' : 'Administración';
  if (r === 'teacher') return lang === 'vi' ? 'Giáo viên' : 'Profesor';
  if (r === 'student') return lang === 'vi' ? 'Học viên' : 'Alumno';
  return role || '—';
}
