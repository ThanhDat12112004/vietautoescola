type Lang = 'vi' | 'es';

export type AdminTabId = 'users' | 'materials' | 'quizzes';
export type AdminTabIconKey = 'users' | 'materials' | 'quizzes';

export function getAdminTabButtons(lang: Lang) {
  return [
    {
      id: 'users' as const,
      label: lang === 'vi' ? 'Học viên & tài khoản' : 'Usuarios y cuentas',
      desc:
        lang === 'vi'
          ? 'Xem danh sách, chỉnh sửa, khóa hoặc mở đăng nhập'
          : 'Ver listado, editar datos, bloquear o activar cuentas',
      iconKey: 'users' as const,
    },
    {
      id: 'materials' as const,
      label: lang === 'vi' ? 'Tài Liệu' : 'Temario',
      desc:
        lang === 'vi'
          ? 'Chủ đề, tải lên và quản lý file cho học viên'
          : 'Temas, subir archivos y gestionar el temario',
      iconKey: 'materials' as const,
    },
    {
      id: 'quizzes' as const,
      label: lang === 'vi' ? 'Bài thi' : 'Exámenes',
      desc:
        lang === 'vi'
          ? 'Loại đề, tạo bài và chỉnh câu hỏi trắc nghiệm'
          : 'Tipos de examen, crear tests y editar preguntas',
      iconKey: 'quizzes' as const,
    },
  ];
}
