export const ADMIN_LIST_PAGE_SIZE = 50;

export const ADMIN_USER_ROLE_FILTER_OPTIONS = [
  { id: 'all', vi: 'Tất cả', es: 'Todas' },
  { id: 'student', vi: 'Học viên', es: 'Alumnos' },
  { id: 'teacher', vi: 'Giáo viên', es: 'Profesores' },
  { id: 'admin', vi: 'Quản trị', es: 'Admin' },
] as const;

export const ADMIN_USER_STATUS_FILTER_OPTIONS = [
  { id: 'all', vi: 'Mọi trạng thái', es: 'Todos los estados' },
  { id: 'active', vi: 'Đang hoạt động', es: 'Activa' },
  { id: 'inactive', vi: 'Đã khóa', es: 'Bloqueada' },
] as const;
