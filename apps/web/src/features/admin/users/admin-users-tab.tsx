import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ADMIN_LIST_PAGE_SIZE, ADMIN_USER_ROLE_FILTER_OPTIONS, ADMIN_USER_STATUS_FILTER_OPTIONS } from '@/features/admin/admin.constants';
import { AdminActionIconButton, AdminListPaginationControls } from '@/features/admin/admin.shared-components';
import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Eye,
  Lock,
  Trash2,
  Unlock,
  Users,
} from 'lucide-react';

export function AdminUsersTab(props: any) {
  const {
    lang,
    users,
    filteredUsers,
    adminUserQuickStats,
    userRoleFilter,
    setUserRoleFilter,
    userSearch,
    setUserSearch,
    userStatusFilter,
    setUserStatusFilter,
    userCreatedSort,
    setUserCreatedSort,
    userCreatedFrom,
    setUserCreatedFrom,
    userCreatedTo,
    setUserCreatedTo,
    setUserSearch: _setUserSearch,
    setUserRoleFilter: _setUserRoleFilter,
    setUserStatusFilter: _setUserStatusFilter,
    paginatedUsers,
    formatUserRole,
    formatDateTime,
    onViewUserDashboard,
    viewingUserId,
    viewingUserLoading,
    viewingUserError,
    viewingUserDashboard,
    editingUserId,
    onStartEditUser,
    onToggleLockUser,
    onDeleteUser,
    onCancelEditUser,
    editUserForm,
    setEditUserForm,
    onSaveEditUser,
    adminUsersPage,
    setAdminUsersListPage,
  } = props;

  return (
    <div className="space-y-2 p-3">
      <div className="space-y-2">
        <div className="border border-[#dbe3ee] bg-white px-3 py-2">
          <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
            {lang === 'vi' ? 'Danh sách tài khoản' : 'Listado de cuentas'} (
            {filteredUsers.length}
            {filteredUsers.length !== users.length ? ` / ${users.length}` : ''})
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-md border border-[#e5d9de] sm:grid-cols-3">
          <div className="border border-[#e5dde0] bg-[linear-gradient(180deg,#fff_0%,#fdf8fa_100%)] px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#7a2038]">
              <Users className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {lang === 'vi' ? 'Tổng tài khoản' : 'Total cuentas'}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.total}
            </p>
          </div>
          <div className="border border-[#dbe3ee] bg-white px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#5b5b73]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600/90" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {lang === 'vi' ? 'Đang hoạt động' : 'Activas'}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.active}
              <span className="text-sm font-normal text-[#8a7a80]">
                {' '}
                ({adminUserQuickStats.inactive} {lang === 'vi' ? 'khóa' : 'bloq.'})
              </span>
            </p>
          </div>
          <div className="border border-[#dbe3ee] bg-white px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#5b5b73]">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#7a2038]/80" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {lang === 'vi' ? 'Mới hôm nay' : 'Nuevas hoy'}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.newToday}
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-10 space-y-2 rounded-md border border-[#e5d9de] bg-white p-3">
          <div>
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a2038]/90">
              {lang === 'vi' ? 'Vai trò' : 'Rol'}
            </Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ADMIN_USER_ROLE_FILTER_OPTIONS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setUserRoleFilter(tab.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    userRoleFilter === tab.id
                      ? 'border-[#7a2038] bg-[#f5d6df]/80 text-[#5a1428] shadow-sm'
                      : 'border-[#d2c8cc] bg-white text-[#5f5f5f] hover:bg-[#faf7f8]'
                  }`}
                >
                  {lang === 'vi' ? tab.vi : tab.es}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={
                  lang === 'vi'
                    ? 'Tìm theo tên đăng nhập, email hoặc họ tên…'
                    : 'Buscar por usuario, email o nombre…'
                }
                className="h-9 border-[#d2d2d2] bg-white"
              />
            </div>
            <Select
              value={userStatusFilter}
              onValueChange={(value: 'all' | 'active' | 'inactive') =>
                setUserStatusFilter(value)
              }
            >
              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                <SelectValue
                  placeholder={lang === 'vi' ? 'Trạng thái tài khoản' : 'Estado de la cuenta'}
                />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_USER_STATUS_FILTER_OPTIONS.map((statusOption) => (
                  <SelectItem key={statusOption.id} value={statusOption.id}>
                    {lang === 'vi' ? statusOption.vi : statusOption.es}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={userCreatedSort}
              onValueChange={(value: 'asc' | 'desc') => setUserCreatedSort(value)}
            >
              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                <SelectValue
                  placeholder={lang === 'vi' ? 'Sắp xếp theo ngày đăng ký' : 'Ordenar por fecha'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  {lang === 'vi' ? 'Mới nhất trước' : 'Mas recientes primero'}
                </SelectItem>
                <SelectItem value="asc">
                  {lang === 'vi' ? 'Cũ nhất trước' : 'Mas antiguos primero'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 min-w-0">
              <Input
                type="date"
                value={userCreatedFrom}
                onChange={(e) => setUserCreatedFrom(e.target.value)}
                aria-label={lang === 'vi' ? 'Từ ngày đăng ký' : 'Desde fecha de registro'}
                className="h-9 border-[#d2d2d2] bg-white"
              />
              <Input
                type="date"
                value={userCreatedTo}
                onChange={(e) => setUserCreatedTo(e.target.value)}
                aria-label={lang === 'vi' ? 'Đến ngày đăng ký' : 'Hasta fecha de registro'}
                className="h-9 border-[#d2d2d2] bg-white"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
              onClick={() => {
                setUserCreatedFrom('');
                setUserCreatedTo('');
                setUserCreatedSort('desc');
                _setUserSearch('');
                _setUserRoleFilter('all');
                _setUserStatusFilter('all');
              }}
            >
              {lang === 'vi' ? 'Đặt lại bộ lọc' : 'Restablecer filtros'}
            </Button>
          </div>
        </div>

        <div className="space-y-0 overflow-hidden rounded-md border border-[#d8cfd3] divide-y divide-[#e7dde1]">
          {paginatedUsers.map((item: any, rowIdx: number) => {
            const zebra = rowIdx % 2 === 1;
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void onViewUserDashboard(item);
                  }
                }}
                onClick={() => void onViewUserDashboard(item)}
                className={`cursor-pointer rounded-none p-2 transition-colors ${
                  zebra ? 'bg-[#f9fafb]' : 'bg-white'
                } hover:bg-[#f1f5f9]/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2038]`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-base font-semibold tracking-tight text-[#5a1428]">
                        {item.username}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-[#8a7a80]">
                        {formatUserRole(item.role, lang)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          item.is_active ? 'text-emerald-700' : 'text-[#6b6570]'
                        }`}
                      >
                        {item.is_active
                          ? lang === 'vi'
                            ? '· Hoạt động'
                            : '· Activa'
                          : lang === 'vi'
                            ? '· Đã khóa'
                            : '· Bloqueada'}
                      </span>
                    </div>
                    <div className="mt-0 truncate text-xs text-[#6b6570]">
                      {item.email}
                      {item.full_name ? ` · ${item.full_name}` : ''}
                    </div>
                    <div className="mt-0 text-[11px] text-[#9a9096]">
                      {lang === 'vi' ? 'Đăng ký:' : 'Alta:'} {formatDateTime(item.created_at)}
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 flex-wrap gap-2 sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void onViewUserDashboard(item)}
                      title={lang === 'vi' ? 'Xem điểm & lịch sử (không sửa)' : 'Ver puntos e historial'}
                      className="h-9 min-h-9 w-9 border-[#d7bcc6] bg-[#fff6f8] px-0 text-[#5a1428] hover:bg-[#fdecef]"
                    >
                      <Eye className="h-4 w-4 shrink-0" />
                    </Button>
                    <AdminActionIconButton
                      onClick={() => onStartEditUser(item)}
                      title={lang === 'vi' ? 'Sửa thông tin tài khoản' : 'Editar cuenta'}
                      kind="edit"
                      className="h-9 min-h-9 w-9 px-0"
                      icon={<Edit className="h-4 w-4 shrink-0" />}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleLockUser(item)}
                      title={lang === 'vi' ? 'Khóa / mở khóa' : 'Bloquear / desbloquear'}
                      className="h-9 min-h-9 border-[#d2d2d2] bg-white px-3 hover:bg-[#fdf5f8]"
                    >
                      {item.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    <AdminActionIconButton
                      onClick={() => onDeleteUser(item)}
                      title={lang === 'vi' ? 'Xóa tài khoản' : 'Eliminar cuenta'}
                      kind="delete"
                      className="h-9 min-h-9 w-9 px-0"
                      icon={<Trash2 className="h-4 w-4" />}
                    />
                  </div>
                </div>
                {viewingUserId === item.id && (
                  <div
                    className="admin-surface-view mt-3 w-full rounded-xl p-3 md:p-4"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                      <Eye className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                      <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                        {lang === 'vi'
                          ? 'Chế độ xem — chỉ đọc, không thay đổi dữ liệu'
                          : 'Solo lectura — no modifica datos'}
                      </span>
                      <span className="text-[11px] font-medium text-[#7a2038]/90">
                        {lang === 'vi'
                          ? 'Tóm tắt điểm và các lần làm bài gần đây.'
                          : 'Resumen de puntos e intentos recientes.'}
                      </span>
                    </div>
                    {viewingUserLoading && (
                      <div className="text-sm text-[#5b5b5b]">
                        {lang === 'vi' ? 'Đang tải hồ sơ...' : 'Cargando perfil...'}
                      </div>
                    )}
                    {!viewingUserLoading && viewingUserError && (
                      <div className="text-sm text-destructive">{viewingUserError}</div>
                    )}
                    {!viewingUserLoading && !viewingUserError && viewingUserDashboard && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div className="border border-[#d2d2d2] rounded-sm bg-white p-2">
                            <div className="text-xs text-[#5b5b5b]">{lang === 'vi' ? 'Tổng điểm' : 'Puntos'}</div>
                            <div className="font-bold text-[#5a1428]">{Number(viewingUserDashboard.stats.total_score || 0).toFixed(2)}</div>
                          </div>
                          <div className="border border-[#d2d2d2] rounded-sm bg-white p-2">
                            <div className="text-xs text-[#5b5b5b]">{lang === 'vi' ? 'Số đề' : 'Exámenes'}</div>
                            <div className="font-bold text-[#5a1428]">{viewingUserDashboard.stats.total_quizzes || 0}</div>
                          </div>
                          <div className="border border-[#d2d2d2] rounded-sm bg-white p-2">
                            <div className="text-xs text-[#5b5b5b]">{lang === 'vi' ? 'Đúng' : 'Correctas'}</div>
                            <div className="font-bold text-[#5a1428]">{viewingUserDashboard.stats.total_correct || 0}</div>
                          </div>
                          <div className="border border-[#d2d2d2] rounded-sm bg-white p-2">
                            <div className="text-xs text-[#5b5b5b]">{lang === 'vi' ? 'Tổng câu' : 'Total preg.'}</div>
                            <div className="font-bold text-[#5a1428]">{viewingUserDashboard.stats.total_questions || 0}</div>
                          </div>
                          <div className="border border-[#d2d2d2] rounded-sm bg-white p-2">
                            <div className="text-xs text-[#5b5b5b]">{lang === 'vi' ? 'TB %' : 'Prom %'}</div>
                            <div className="font-bold text-[#5a1428]">{Number(viewingUserDashboard.stats.average_percentage || 0).toFixed(2)}%</div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-1.5 text-xs font-semibold text-[#5a1428]">
                            {lang === 'vi' ? 'Lịch sử làm bài gần nhất' : 'Historial reciente'}
                          </div>
                          <div className="mb-1 hidden grid-cols-[1fr_auto_auto_auto] gap-2 rounded bg-[#f6dde4] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6b1b31] md:grid">
                            <span>{lang === 'vi' ? 'Tên bài' : 'Examen'}</span>
                            <span>{lang === 'vi' ? '% đúng' : '%'}</span>
                            <span>{lang === 'vi' ? 'Điểm' : 'Nota'}</span>
                            <span>{lang === 'vi' ? 'Câu đúng' : 'Aciertos'}</span>
                          </div>
                          <div className="max-h-56 space-y-1 overflow-auto">
                            {viewingUserDashboard.history.slice(0, 10).map((h: any) => (
                              <div
                                key={h.id}
                                className="grid grid-cols-1 gap-1 rounded border border-[#ecd7dd] bg-white/95 p-2 text-xs sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-2"
                              >
                                <span className="min-w-0 font-semibold text-[#5a1428]">{h.quiz_title}</span>
                                <span className="text-[#5b5b5b]">
                                  <span className="font-medium text-[#7a2038]">{Number(h.percentage || 0).toFixed(1)}%</span>
                                  <span className="md:hidden"> · </span>
                                </span>
                                <span className="text-[#5b5b5b]">
                                  {lang === 'vi' ? 'Điểm:' : 'Nota:'}{' '}
                                  <span className="font-semibold text-[#5a1428]">{Number(h.score || 0).toFixed(1)}</span>
                                </span>
                                <span className="text-[#5b5b5b]">{h.correct_count}/{h.total_questions}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {editingUserId === item.id && (
                  <Dialog open={editingUserId === item.id} onOpenChange={(open) => !open && onCancelEditUser()}>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-[#6b1b31]">
                          {lang === 'vi' ? 'Chỉnh sửa tài khoản' : 'Editar cuenta'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="admin-surface-edit w-full rounded-xl p-3 md:p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                          <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                          <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                            {lang === 'vi'
                              ? 'Chế độ chỉnh sửa — thay đổi được lưu khi bấm Lưu'
                              : 'Edición — los cambios se guardan al pulsar Guardar'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Tên đăng nhập' : 'Usuario'}
                            </Label>
                            <Input
                              value={editUserForm.username}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, username: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Email' : 'Correo'}
                            </Label>
                            <Input
                              type="email"
                              value={editUserForm.email}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, email: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Họ tên' : 'Nombre'}
                            </Label>
                            <Input
                              value={editUserForm.full_name}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, full_name: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Vai trò' : 'Rol'}
                            </Label>
                            <Select
                              value={editUserForm.role}
                              onValueChange={(v) => setEditUserForm({ ...editUserForm, role: v })}
                            >
                              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">
                                  {lang === 'vi' ? 'Học viên' : 'Estudiante'}
                                </SelectItem>
                                <SelectItem value="teacher">
                                  {lang === 'vi' ? 'Giáo viên' : 'Profesor'}
                                </SelectItem>
                                <SelectItem value="admin">
                                  {lang === 'vi' ? 'Quản trị viên' : 'Administración'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Trạng thái' : 'Estado'}
                            </Label>
                            <Select
                              value={editUserForm.is_active ? 'active' : 'locked'}
                              onValueChange={(v) =>
                                setEditUserForm({ ...editUserForm, is_active: v === 'active' })
                              }
                            >
                              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">
                                  {lang === 'vi' ? 'Hoạt động' : 'Activo'}
                                </SelectItem>
                                <SelectItem value="locked">
                                  {lang === 'vi' ? 'Khóa' : 'Bloqueado'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi'
                                ? 'Mật khẩu mới (tuỳ chọn)'
                                : 'Nueva contraseña (opcional)'}
                            </Label>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              value={editUserForm.password}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, password: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onSaveEditUser(item)}
                              className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                            >
                              {lang === 'vi' ? 'Lưu' : 'Guardar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onCancelEditUser}
                              className="h-9 border-[#d2d2d2] bg-white"
                            >
                              {lang === 'vi' ? 'Hủy' : 'Cancelar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            );
          })}
          <AdminListPaginationControls
            lang={lang}
            page={adminUsersPage}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            total={filteredUsers.length}
            onPageChange={setAdminUsersListPage}
          />
        </div>
      </div>
    </div>
  );
}
