import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_LIST_PAGE_SIZE } from '@/features/admin/admin.constants';
import { getMaterialsHierarchyTitle } from '@/features/admin/admin.section-titles';
import {
  AdminActionIconButton,
  AdminListPaginationControls,
} from '@/features/admin/admin.shared-components';
import { AdminMaterialsTabShell } from '@/features/admin/materials/admin-materials-tab';
import { Download, Edit, Trash2 } from 'lucide-react';

export function AdminMaterialsSection(props: any) {
  const {
    lang,
    materialsSubTab,
    setMaterialsSubTab,
    materialTopicGroupCreateDialogOpen,
    setMaterialTopicGroupCreateDialogOpen,
    onCreateMaterialTopicGroup,
    newMaterialTopicGroup,
    setNewMaterialTopicGroup,
    materialTopicGroupSearch,
    setMaterialTopicGroupSearch,
    filteredMaterialTopicGroups,
    onStartEditMaterialTopicGroup,
    onDeleteMaterialTopicGroup,
    editingMaterialTopicGroupId,
    setEditingMaterialTopicGroupId,
    editMaterialTopicGroupForm,
    setEditMaterialTopicGroupForm,
    onSaveEditMaterialTopicGroup,
    materialSubjectFilterGroupId,
    setMaterialSubjectFilterGroupId,
    materialTopicGroups,
    materialSubjectCreateDialogOpen,
    setMaterialSubjectCreateDialogOpen,
    onCreateSubject,
    subjectForm,
    setSubjectForm,
    materialSubjectSearch,
    setMaterialSubjectSearch,
    filteredAdminSubjects,
    onStartEditSubject,
    onDeleteSubject,
    editingSubjectId,
    onCancelEditSubject,
    editSubjectForm,
    setEditSubjectForm,
    onSaveEditSubject,
    materialCreateDialogOpen,
    setMaterialCreateDialogOpen,
    materialCreateFilterGroupId,
    setMaterialCreateFilterGroupId,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    createSubjectsByGroup,
    materialForm,
    setMaterialForm,
    materialCreateUploading,
    setMaterialCreateUploading,
    materialCreateStaged,
    setMaterialCreateStaged,
    materialCreateFileKey,
    isPdfFile,
    showError,
    uploadMaterialFile,
    buildStoredMediaPath,
    resolveMediaUrl,
    onCreateBilingualMaterial,
    filteredMaterials,
    materialListFilterGroupId,
    setMaterialListFilterGroupId,
    listSubjectsByGroup,
    selectedSubject,
    loadMaterials,
    materialSearch,
    setMaterialSearch,
    paginatedMaterials,
    onStartEditMaterial,
    onDeleteMaterial,
    editingMaterialId,
    onCancelEditMaterial,
    editMaterialForm,
    setEditMaterialForm,
    editMaterialUploading,
    setEditMaterialUploading,
    editMaterialPickedFileName,
    setEditMaterialPickedFileName,
    onSaveEditMaterial,
    adminMaterialsPage,
    setAdminMaterialsListPage,
  } = props;

  return (
                <AdminMaterialsTabShell
                  lang={lang}
                  materialsSubTab={materialsSubTab}
                  setMaterialsSubTab={setMaterialsSubTab}
                >

                  {/* Subject Management */}
                  {(materialsSubTab === 'topic_groups' || materialsSubTab === 'subjects') && (
                    <div className="rounded-none border border-[#dbe3ee] bg-white p-3">
                      <div className="mb-1">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
                          {getMaterialsHierarchyTitle(lang, materialsSubTab)}
                        </h3>
                      </div>
                      {materialsSubTab === 'topic_groups' && (
                      <div className="mb-0 space-y-2">
                        <p className="text-sm font-semibold text-[#7a2038]">
                          {lang === 'vi'
                            ? 'Loại chủ đề tài liệu - tạo mới ở đây'
                            : 'Grupo de tema de material - crear nuevo aquí'}
                        </p>
                        <Button
                          type="button"
                          onClick={() => setMaterialTopicGroupCreateDialogOpen(true)}
                          className="h-9 w-full justify-center bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm loại chủ đề' : 'Agregar grupo de tema'}
                        </Button>
                        <Dialog open={materialTopicGroupCreateDialogOpen} onOpenChange={setMaterialTopicGroupCreateDialogOpen}>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="text-[#6b1b31]">
                                {lang === 'vi' ? 'Thêm loại chủ đề tài liệu' : 'Agregar grupo de tema de material'}
                              </DialogTitle>
                            </DialogHeader>
                        <form onSubmit={onCreateMaterialTopicGroup} className="space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]">🇻🇳 Tiếng Việt</p>
                              <Input
                                placeholder="Tên VI"
                                value={newMaterialTopicGroup.name_vi}
                                onChange={(e) =>
                                  setNewMaterialTopicGroup((prev) => ({ ...prev, name_vi: e.target.value }))
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Input
                                placeholder="Mô tả VI"
                                value={newMaterialTopicGroup.description_vi}
                                onChange={(e) =>
                                  setNewMaterialTopicGroup((prev) => ({
                                    ...prev,
                                    description_vi: e.target.value,
                                  }))
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]">🇪🇸 Español</p>
                              <Input
                                placeholder="Nombre ES"
                                value={newMaterialTopicGroup.name_es}
                                onChange={(e) =>
                                  setNewMaterialTopicGroup((prev) => ({ ...prev, name_es: e.target.value }))
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Input
                                placeholder="Descripción ES"
                                value={newMaterialTopicGroup.description_es}
                                onChange={(e) =>
                                  setNewMaterialTopicGroup((prev) => ({
                                    ...prev,
                                    description_es: e.target.value,
                                  }))
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                          </div>
                          <Button type="submit" className="h-10 rounded-md bg-[#7a2038] hover:bg-[#5a1428] text-white">
                            {lang === 'vi' ? 'Thêm loại chủ đề' : 'Agregar grupo de tema'}
                          </Button>
                        </form>
                          </DialogContent>
                        </Dialog>
                        <div className="mb-2">
                          <Input
                            value={materialTopicGroupSearch}
                            onChange={(e) => setMaterialTopicGroupSearch(e.target.value)}
                            placeholder={
                              lang === 'vi'
                                ? 'Tìm loại chủ đề theo mã, tên, mô tả...'
                                : 'Buscar grupo por código, nombre, descripción...'
                            }
                            className="h-9 border-[#d2d2d2] bg-white"
                          />
                        </div>
                        <div className="overflow-hidden rounded-md border border-[#e5d9de] divide-y divide-[#ece2e6] bg-white">
                          {filteredMaterialTopicGroups.map((groupItem) => (
                            <div
                              key={groupItem.id}
                              className="group rounded-none border-0 bg-white p-2 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-bold text-[#5a1428]">
                                    {lang === 'vi' ? groupItem.name_vi : groupItem.name_es}
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi'
                                      ? groupItem.description_vi || '-'
                                      : groupItem.description_es || '-'}
                                  </div>
                                </div>
                                <div className="admin-row-actions flex gap-1">
                                  <AdminActionIconButton onClick={() => onStartEditMaterialTopicGroup(groupItem)} title={lang === 'vi' ? 'Sửa' : 'Editar'} kind="edit" className="h-8 w-8 rounded-md px-0" icon={<Edit className="h-3.5 w-3.5" />} />
                                  <AdminActionIconButton onClick={() => onDeleteMaterialTopicGroup(groupItem)} title={lang === 'vi' ? 'Xóa' : 'Eliminar'} kind="delete" className="h-8 w-8 rounded-md px-0" icon={<Trash2 className="h-3.5 w-3.5" />} />
                                </div>
                              </div>
                              {editingMaterialTopicGroupId === groupItem.id && (
                                <Dialog open={editingMaterialTopicGroupId === groupItem.id} onOpenChange={(open) => !open && setEditingMaterialTopicGroupId(null)}>
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#6b1b31]">
                                        {lang === 'vi' ? 'Sửa loại chủ đề tài liệu' : 'Editar grupo de tema'}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <Input value={editMaterialTopicGroupForm.code} onChange={(e) => setEditMaterialTopicGroupForm((p) => ({ ...p, code: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]">🇻🇳 Tiếng Việt</p>
                                          <Input value={editMaterialTopicGroupForm.name_vi} onChange={(e) => setEditMaterialTopicGroupForm((p) => ({ ...p, name_vi: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input value={editMaterialTopicGroupForm.description_vi} onChange={(e) => setEditMaterialTopicGroupForm((p) => ({ ...p, description_vi: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]">🇪🇸 Español</p>
                                          <Input value={editMaterialTopicGroupForm.name_es} onChange={(e) => setEditMaterialTopicGroupForm((p) => ({ ...p, name_es: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input value={editMaterialTopicGroupForm.description_es} onChange={(e) => setEditMaterialTopicGroupForm((p) => ({ ...p, description_es: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={() => onSaveEditMaterialTopicGroup(groupItem)} className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white">{lang === 'vi' ? 'Lưu' : 'Guardar'}</Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingMaterialTopicGroupId(null)} className="h-9 border-[#d2d2d2] bg-white">{lang === 'vi' ? 'Hủy' : 'Cancelar'}</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      )}
                      {materialsSubTab === 'subjects' && (
                      <>
                      <div className="mb-2 max-w-sm">
                        <Label className="text-xs text-[#5b5b5b]">
                          {lang === 'vi' ? 'Lọc theo loại chủ đề' : 'Filtrar por grupo de tema'}
                        </Label>
                        <Select
                          value={materialSubjectFilterGroupId}
                          onValueChange={setMaterialSubjectFilterGroupId}
                        >
                          <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {lang === 'vi' ? 'Tất cả loại chủ đề' : 'Todos los grupos'}
                            </SelectItem>
                            {materialTopicGroups.map((g) => (
                              <SelectItem key={g.id} value={String(g.id)}>
                                {g.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-2 space-y-1">
                        <p className="text-sm font-semibold text-[#7a2038]">
                          {lang === 'vi'
                            ? 'Chủ đề tài liệu - tạo mới ở đây'
                            : 'Tema de material - crear nuevo aquí'}
                        </p>
                        <Button
                          type="button"
                          onClick={() => setMaterialSubjectCreateDialogOpen(true)}
                          className="h-9 w-full justify-center bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm chủ đề' : 'Agregar tema'}
                        </Button>
                      </div>
                      <Dialog open={materialSubjectCreateDialogOpen} onOpenChange={setMaterialSubjectCreateDialogOpen}>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#6b1b31]">
                              {lang === 'vi' ? 'Thêm chủ đề tài liệu' : 'Agregar tema de material'}
                            </DialogTitle>
                          </DialogHeader>
                      <form
                        onSubmit={onCreateSubject}
                        className="mb-2 space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3"
                      >
                        <Select
                          value={String(subjectForm.material_topic_group_id || 1)}
                          onValueChange={(v) =>
                            setSubjectForm({ ...subjectForm, material_topic_group_id: Number(v) })
                          }
                        >
                          <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                            <SelectValue
                              placeholder={lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {materialTopicGroups.map((g) => (
                              <SelectItem key={g.id} value={String(g.id)}>
                                {g.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]">🇻🇳 Tiếng Việt</p>
                            <Input
                              placeholder="Tên VI"
                              value={subjectForm.name_vi}
                              onChange={(e) =>
                                setSubjectForm({ ...subjectForm, name_vi: e.target.value })
                              }
                              required
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder="Mô tả VI"
                              value={subjectForm.description_vi}
                              onChange={(e) =>
                                setSubjectForm({ ...subjectForm, description_vi: e.target.value })
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]">🇪🇸 Español</p>
                            <Input
                              placeholder="Nombre ES"
                              value={subjectForm.name_es}
                              onChange={(e) =>
                                setSubjectForm({ ...subjectForm, name_es: e.target.value })
                              }
                              required
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder="Descripción ES"
                              value={subjectForm.description_es}
                              onChange={(e) =>
                                setSubjectForm({ ...subjectForm, description_es: e.target.value })
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm chủ đề' : 'Agregar tema'}
                        </Button>
                      </form>
                        </DialogContent>
                      </Dialog>

                      <div className="mb-2">
                        <Input
                          value={materialSubjectSearch}
                          onChange={(e) => setMaterialSubjectSearch(e.target.value)}
                          placeholder={
                            lang === 'vi'
                              ? 'Tìm chủ đề theo mã, tên, mô tả...'
                              : 'Buscar tema por código, nombre, descripción...'
                          }
                          className="h-9 border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="space-y-0 divide-y divide-[#ece2e6] overflow-hidden rounded-md border border-[#e5d9de] bg-white">
                        {filteredAdminSubjects.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 border-0 bg-white rounded-none"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-bold text-[#5a1428]">
                                  {lang === 'vi' ? item.name_vi : item.name_es}
                                </div>
                                <div className="text-[11px] text-[#7a2038]">
                                  {lang === 'vi'
                                    ? item.material_topic_group_name_vi || '-'
                                    : item.material_topic_group_name_es || '-'}
                                </div>
                                <div className="text-xs text-[#5b5b5b]">
                                  {lang === 'vi'
                                    ? item.description_vi || '-'
                                    : item.description_es || '-'}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <AdminActionIconButton onClick={() => onStartEditSubject(item)} title={lang === 'vi' ? 'Sửa chủ đề' : 'Editar tema'} kind="edit" icon={<Edit className="h-3.5 w-3.5" />} />
                                <AdminActionIconButton onClick={() => onDeleteSubject(item)} title={lang === 'vi' ? 'Xóa chủ đề' : 'Eliminar tema'} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                              </div>
                            </div>
                            {editingSubjectId === item.id && (
                              <Dialog open={editingSubjectId === item.id} onOpenChange={(open) => !open && onCancelEditSubject()}>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-[#6b1b31]">
                                      {lang === 'vi' ? 'Sửa chủ đề tài liệu' : 'Editar tema de material'}
                                    </DialogTitle>
                                  </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                                <Select
                                  value={String(editSubjectForm.material_topic_group_id || 1)}
                                  onValueChange={(v) =>
                                    setEditSubjectForm({
                                      ...editSubjectForm,
                                      material_topic_group_id: Number(v),
                                    })
                                  }
                                >
                                  <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {materialTopicGroups.map((g) => (
                                      <SelectItem key={g.id} value={String(g.id)}>
                                        {g.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={editSubjectForm.name_vi}
                                  onChange={(e) =>
                                    setEditSubjectForm({
                                      ...editSubjectForm,
                                      name_vi: e.target.value,
                                    })
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editSubjectForm.name_es}
                                  onChange={(e) =>
                                    setEditSubjectForm({
                                      ...editSubjectForm,
                                      name_es: e.target.value,
                                    })
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editSubjectForm.description_vi}
                                  onChange={(e) =>
                                    setEditSubjectForm({
                                      ...editSubjectForm,
                                      description_vi: e.target.value,
                                    })
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    value={editSubjectForm.description_es}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        description_es: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => onSaveEditSubject(item)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                  >
                                    {lang === 'vi' ? 'Lưu' : 'Guardar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onCancelEditSubject}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  >
                                    {lang === 'vi' ? 'Hủy' : 'Cancelar'}
                                  </Button>
                                </div>
                              </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ))}
                      </div>
                      </>
                      )}
                    </div>
                  )}

                  {/* Add Material Form */}
                  {materialsSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
                          {lang === 'vi' ? 'Thêm tài liệu song ngữ' : 'Agregar material bilingüe'}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => setMaterialCreateDialogOpen(true)}
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm mới' : 'Agregar nuevo'}
                        </Button>
                      </div>
                      <Dialog open={materialCreateDialogOpen} onOpenChange={setMaterialCreateDialogOpen}>
                        <DialogContent className="max-w-6xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#6b1b31]">
                              {lang === 'vi' ? 'Thêm tài liệu song ngữ' : 'Agregar material bilingüe'}
                            </DialogTitle>
                          </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema'}
                          </Label>
                          <Select
                            value={materialCreateFilterGroupId}
                            onValueChange={(v) => {
                              setMaterialCreateFilterGroupId(v);
                              const gid = Number(v);
                              const scoped =
                                v === 'all' || !Number.isFinite(gid) || gid <= 0
                                  ? subjects
                                  : subjects.filter(
                                      (item: any) => Number(item.material_topic_group_id) === gid
                                    );
                              if (
                                scoped.length &&
                                !scoped.some((s: any) => Number(s.id) === Number(selectedSubjectId))
                              ) {
                                setSelectedSubjectId(Number(scoped[0].id));
                              }
                            }}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {lang === 'vi' ? 'Tất cả loại chủ đề' : 'Todos los grupos'}
                              </SelectItem>
                              {materialTopicGroups.map((g) => (
                                <SelectItem key={g.id} value={String(g.id)}>
                                  {g.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Chủ đề' : 'Tema'}
                          </Label>
                          <Select
                            value={selectedSubjectId != null ? String(selectedSubjectId) : ''}
                            onValueChange={(v) => setSelectedSubjectId(Number(v))}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue
                                placeholder={lang === 'vi' ? 'Chọn chủ đề' : 'Seleccionar tema'}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {createSubjectsByGroup.map((s: any) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <form
                        onSubmit={onCreateBilingualMaterial}
                        className="grid grid-cols-1 gap-2 md:grid-cols-2"
                      >
                        <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                          <h4 className="font-bold text-[#5a1428] mb-2 text-sm">🇻🇳 Tiếng Việt</h4>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">Tiêu đề</Label>
                              <Input
                                value={materialForm.title_vi}
                                onChange={(e) =>
                                  setMaterialForm({ ...materialForm, title_vi: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">Mô tả</Label>
                              <Textarea
                                value={materialForm.description_vi}
                                onChange={(e) =>
                                  setMaterialForm({
                                    ...materialForm,
                                    description_vi: e.target.value,
                                  })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">
                                File{' '}
                                <span className="text-[#7a2038] font-semibold">
                                  ({lang === 'vi' ? 'chỉ PDF' : 'solo PDF'})
                                </span>
                              </Label>
                              <Input
                                key={`create-vi-${materialCreateFileKey}`}
                                type="file"
                                accept="application/pdf,.pdf"
                                disabled={materialCreateUploading.vi}
                                onChange={async (e) => {
                                  const f = e.target.files?.[0] || null;
                                  if (!f) {
                                    setMaterialCreateStaged((s) => ({ ...s, vi: null }));
                                    return;
                                  }
                                  if (!isPdfFile(f)) {
                                    showError(
                                      lang === 'vi'
                                        ? 'Chỉ chấp nhận file PDF (.pdf)'
                                        : 'Solo se aceptan archivos PDF (.pdf)'
                                    );
                                    e.target.value = '';
                                    return;
                                  }
                                  setMaterialCreateUploading((u) => ({ ...u, vi: true }));
                                  try {
                                    const uploaded = await uploadMaterialFile(f, 'vi');
                                    setMaterialCreateStaged((s) => ({
                                      ...s,
                                      vi: {
                                        fileName: f.name,
                                        path: buildStoredMediaPath(uploaded),
                                        sizeMb: uploaded.size
                                          ? Number((uploaded.size / (1024 * 1024)).toFixed(2))
                                          : null,
                                        pageCount:
                                          uploaded.page_count != null &&
                                          Number.isFinite(Number(uploaded.page_count))
                                            ? Math.floor(Number(uploaded.page_count))
                                            : null,
                                      },
                                    }));
                                  } catch (err) {
                                    showError(
                                      err instanceof Error ? err.message : 'Upload error'
                                    );
                                    setMaterialCreateStaged((s) => ({ ...s, vi: null }));
                                  } finally {
                                    setMaterialCreateUploading((u) => ({ ...u, vi: false }));
                                  }
                                }}
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              {materialCreateUploading.vi && (
                                <div className="text-xs text-[#5b5b5b] mt-1">
                                  {lang === 'vi' ? 'Đang tải lên...' : 'Subiendo...'}
                                </div>
                              )}
                              {materialCreateStaged.vi && !materialCreateUploading.vi && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs font-medium text-[#5a1428] break-all">
                                    {lang === 'vi' ? 'File PDF:' : 'PDF:'}{' '}
                                    {materialCreateStaged.vi.fileName}
                                  </div>
                                  <div>
                                    <span className="text-xs text-[#5b5b5b]">URL (VI)</span>
                                    <a
                                      href={resolveMediaUrl(materialCreateStaged.vi.path)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-[#7a2038] underline break-all block"
                                    >
                                      {materialCreateStaged.vi.path}
                                    </a>
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Dung lượng' : 'Tamaño'}:{' '}
                                    {materialCreateStaged.vi.sizeMb ?? '—'} MB
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Số trang PDF' : 'Páginas PDF'}:{' '}
                                    {materialCreateStaged.vi.pageCount != null
                                      ? materialCreateStaged.vi.pageCount
                                      : '—'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                          <h4 className="font-bold text-[#5a1428] mb-2 text-sm">🇪🇸 Español</h4>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">Título</Label>
                              <Input
                                value={materialForm.title_es}
                                onChange={(e) =>
                                  setMaterialForm({ ...materialForm, title_es: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">Descripción</Label>
                              <Textarea
                                value={materialForm.description_es}
                                onChange={(e) =>
                                  setMaterialForm({
                                    ...materialForm,
                                    description_es: e.target.value,
                                  })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">
                                Archivo{' '}
                                <span className="text-[#7a2038] font-semibold">
                                  ({lang === 'vi' ? 'chỉ PDF' : 'solo PDF'})
                                </span>
                              </Label>
                              <Input
                                key={`create-es-${materialCreateFileKey}`}
                                type="file"
                                accept="application/pdf,.pdf"
                                disabled={materialCreateUploading.es}
                                onChange={async (e) => {
                                  const f = e.target.files?.[0] || null;
                                  if (!f) {
                                    setMaterialCreateStaged((s) => ({ ...s, es: null }));
                                    return;
                                  }
                                  if (!isPdfFile(f)) {
                                    showError(
                                      lang === 'vi'
                                        ? 'Chỉ chấp nhận file PDF (.pdf)'
                                        : 'Solo se aceptan archivos PDF (.pdf)'
                                    );
                                    e.target.value = '';
                                    return;
                                  }
                                  setMaterialCreateUploading((u) => ({ ...u, es: true }));
                                  try {
                                    const uploaded = await uploadMaterialFile(f, 'es');
                                    setMaterialCreateStaged((s) => ({
                                      ...s,
                                      es: {
                                        fileName: f.name,
                                        path: buildStoredMediaPath(uploaded),
                                        sizeMb: uploaded.size
                                          ? Number((uploaded.size / (1024 * 1024)).toFixed(2))
                                          : null,
                                        pageCount:
                                          uploaded.page_count != null &&
                                          Number.isFinite(Number(uploaded.page_count))
                                            ? Math.floor(Number(uploaded.page_count))
                                            : null,
                                      },
                                    }));
                                  } catch (err) {
                                    showError(
                                      err instanceof Error ? err.message : 'Upload error'
                                    );
                                    setMaterialCreateStaged((s) => ({ ...s, es: null }));
                                  } finally {
                                    setMaterialCreateUploading((u) => ({ ...u, es: false }));
                                  }
                                }}
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              {materialCreateUploading.es && (
                                <div className="text-xs text-[#5b5b5b] mt-1">
                                  {lang === 'vi' ? 'Đang tải lên...' : 'Subiendo...'}
                                </div>
                              )}
                              {materialCreateStaged.es && !materialCreateUploading.es && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs font-medium text-[#5a1428] break-all">
                                    {lang === 'vi' ? 'File PDF:' : 'PDF:'}{' '}
                                    {materialCreateStaged.es.fileName}
                                  </div>
                                  <div>
                                    <span className="text-xs text-[#5b5b5b]">URL (ES)</span>
                                    <a
                                      href={resolveMediaUrl(materialCreateStaged.es.path)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-[#7a2038] underline break-all block"
                                    >
                                      {materialCreateStaged.es.path}
                                    </a>
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Dung lượng' : 'Tamaño'}:{' '}
                                    {materialCreateStaged.es.sizeMb ?? '—'} MB
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Số trang PDF' : 'Páginas PDF'}:{' '}
                                    {materialCreateStaged.es.pageCount != null
                                      ? materialCreateStaged.es.pageCount
                                      : '—'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Button
                            type="submit"
                            disabled={
                              materialCreateUploading.vi ||
                              materialCreateUploading.es ||
                              !materialCreateStaged.vi ||
                              !materialCreateStaged.es
                            }
                            className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                          >
                            {lang === 'vi' ? 'Thêm tài liệu' : 'Agregar material'}
                          </Button>
                        </div>
                      </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Materials List */}
                  {materialsSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <h3 className="mb-2 font-bold text-[#5a1428] text-base md:text-base">
                        {lang === 'vi' ? 'Danh sách tài liệu' : 'Lista del temario'} (
                        {filteredMaterials.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema'}
                          </Label>
                          <Select
                            value={materialListFilterGroupId}
                            onValueChange={(v) => {
                              setMaterialListFilterGroupId(v);
                              const gid = Number(v);
                              const scoped =
                                v === 'all' || !Number.isFinite(gid) || gid <= 0
                                  ? subjects
                                  : subjects.filter(
                                      (item: any) => Number(item.material_topic_group_id) === gid
                                    );
                              if (scoped.length) {
                                const nextSubjectId = scoped.some(
                                  (s: any) => Number(s.id) === Number(selectedSubjectId)
                                )
                                  ? Number(selectedSubjectId)
                                  : Number(scoped[0].id);
                                setSelectedSubjectId(nextSubjectId);
                                void loadMaterials(nextSubjectId);
                              }
                            }}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {lang === 'vi' ? 'Tất cả loại chủ đề' : 'Todos los grupos'}
                              </SelectItem>
                              {materialTopicGroups.map((g) => (
                                <SelectItem key={g.id} value={String(g.id)}>
                                  {g.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Chủ đề tài liệu' : 'Tema de material'}
                          </Label>
                          <Select
                            value={selectedSubjectId != null ? String(selectedSubjectId) : ''}
                            onValueChange={(v) => {
                              const nextSubjectId = Number(v);
                              setSelectedSubjectId(nextSubjectId);
                              void loadMaterials(nextSubjectId);
                            }}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue
                                placeholder={lang === 'vi' ? 'Chọn chủ đề' : 'Seleccionar tema'}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {listSubjectsByGroup.map((s: any) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-xs text-[#5b5b5b] md:self-end">
                          {lang === 'vi' ? 'Đang hiển thị theo chủ đề:' : 'Mostrando por tema:'}{' '}
                          <span className="font-semibold text-[#5a1428]">
                            {selectedSubject?.name || '-'}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Input
                          value={materialSearch}
                          onChange={(e) => setMaterialSearch(e.target.value)}
                          placeholder={
                            lang === 'vi'
                              ? 'Tìm theo tiêu đề, mô tả VI/ES...'
                              : 'Buscar por título, descripción VI/ES...'
                          }
                          className="h-9 border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="space-y-0 divide-y divide-[#ece2e6] border border-[#e9dfe3]">
                        {paginatedMaterials.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 border-0 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#5a1428]">
                                {lang === 'vi' ? item.title_vi || '-' : item.title_es || '-'}
                              </div>
                              <div className="text-xs text-[#5b5b5b]">
                                {lang === 'vi'
                                  ? item.description_vi || '-'
                                  : item.description_es || '-'}{' '}
                                {lang === 'vi'
                                  ? item.file_size_mb_vi && `(${item.file_size_mb_vi}MB)`
                                  : item.file_size_mb_es && `(${item.file_size_mb_es}MB)`}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                <a
                                  href={resolveMediaUrl(
                                    lang === 'vi' ? item.file_path_vi : item.file_path_es
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                              <AdminActionIconButton onClick={() => onStartEditMaterial(item)} title={lang === 'vi' ? 'Chỉnh sửa tài liệu' : 'Editar material'} kind="edit" className="h-8 w-8 px-0" icon={<Edit className="h-3.5 w-3.5 shrink-0" />} />
                              <AdminActionIconButton onClick={() => onDeleteMaterial(item)} title={lang === 'vi' ? 'Xóa tài liệu' : 'Eliminar material'} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                            {editingMaterialId === item.id && (
                            <Dialog open={editingMaterialId === item.id} onOpenChange={(open) => !open && onCancelEditMaterial()}>
                              <DialogContent className="max-w-6xl">
                                <DialogHeader>
                                  <DialogTitle className="text-[#6b1b31]">
                                    {lang === 'vi' ? 'Sửa tài liệu' : 'Editar material'}
                                  </DialogTitle>
                                </DialogHeader>
                              <div className="w-full rounded-none border border-[#e9dfe3] bg-[#faf7f8] p-2 md:p-2">
                                <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                                  <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                                  <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                                    {lang === 'vi'
                                      ? 'Chỉnh sửa tài liệu — tiêu đề, mô tả & file PDF'
                                      : 'Editar material — título, descripción y PDF'}
                                  </span>
                                </div>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Chủ đề tài liệu' : 'Tema de material'}
                                  </Label>
                                  <Select
                                    value={editMaterialForm.subject_id}
                                    onValueChange={(v) =>
                                      setEditMaterialForm((prev) => ({ ...prev, subject_id: v }))
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue
                                        placeholder={
                                          lang === 'vi' ? 'Chọn chủ đề' : 'Seleccionar tema'
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {subjects.map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                          {s.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">Tiêu đề (VI)</Label>
                                  <Input
                                    value={editMaterialForm.title_vi}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        title_vi: e.target.value,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">Título (ES)</Label>
                                  <Input
                                    value={editMaterialForm.title_es}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        title_es: e.target.value,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">Mô tả (VI)</Label>
                                  <Textarea
                                    value={editMaterialForm.description_vi}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        description_vi: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">Descripción (ES)</Label>
                                  <Textarea
                                    value={editMaterialForm.description_es}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        description_es: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'File mới (VI)' : 'Archivo nuevo (VI)'}{' '}
                                    <span className="text-[#7a2038] font-semibold">
                                      ({lang === 'vi' ? 'chỉ PDF' : 'solo PDF'})
                                    </span>
                                  </Label>
                                  <Input
                                    key={`edit-mat-vi-${editingMaterialId}`}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    disabled={editMaterialUploading.vi}
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0] || null;
                                      if (!f) return;
                                      if (!isPdfFile(f)) {
                                        showError(
                                          lang === 'vi'
                                            ? 'Chỉ chấp nhận file PDF (.pdf)'
                                            : 'Solo se aceptan archivos PDF (.pdf)'
                                        );
                                        e.target.value = '';
                                        return;
                                      }
                                      setEditMaterialUploading((u) => ({ ...u, vi: true }));
                                      try {
                                        const uploaded = await uploadMaterialFile(f, 'vi');
                                        setEditMaterialPickedFileName((p) => ({ ...p, vi: f.name }));
                                        setEditMaterialForm((prev) => ({
                                          ...prev,
                                          file_path_vi: buildStoredMediaPath(uploaded),
                                          file_size_mb_vi: uploaded.size
                                            ? String(
                                                Number(
                                                  (uploaded.size / (1024 * 1024)).toFixed(2)
                                                )
                                              )
                                            : '',
                                          page_count_vi:
                                            uploaded.page_count != null &&
                                            Number.isFinite(Number(uploaded.page_count))
                                              ? String(Math.floor(Number(uploaded.page_count)))
                                              : '',
                                        }));
                                      } catch (err) {
                                        showError(
                                          err instanceof Error ? err.message : 'Upload error'
                                        );
                                      } finally {
                                        setEditMaterialUploading((u) => ({ ...u, vi: false }));
                                      }
                                    }}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                  {editMaterialPickedFileName.vi ? (
                                    <div className="text-xs font-medium text-[#5a1428] mt-1 break-all">
                                      {lang === 'vi' ? 'File PDF:' : 'PDF:'}{' '}
                                      {editMaterialPickedFileName.vi}
                                    </div>
                                  ) : null}
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {editMaterialUploading.vi
                                      ? lang === 'vi'
                                        ? 'Đang tải lên...'
                                        : 'Subiendo...'
                                      : lang === 'vi'
                                        ? 'Chọn PDF khác để thay thế — URL, dung lượng và số trang cập nhật tự động.'
                                        : 'Elija otro PDF — URL, tamaño y páginas se actualizan solos.'}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'File mới (ES)' : 'Archivo nuevo (ES)'}{' '}
                                    <span className="text-[#7a2038] font-semibold">
                                      ({lang === 'vi' ? 'chỉ PDF' : 'solo PDF'})
                                    </span>
                                  </Label>
                                  <Input
                                    key={`edit-mat-es-${editingMaterialId}`}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    disabled={editMaterialUploading.es}
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0] || null;
                                      if (!f) return;
                                      if (!isPdfFile(f)) {
                                        showError(
                                          lang === 'vi'
                                            ? 'Chỉ chấp nhận file PDF (.pdf)'
                                            : 'Solo se aceptan archivos PDF (.pdf)'
                                        );
                                        e.target.value = '';
                                        return;
                                      }
                                      setEditMaterialUploading((u) => ({ ...u, es: true }));
                                      try {
                                        const uploaded = await uploadMaterialFile(f, 'es');
                                        setEditMaterialPickedFileName((p) => ({ ...p, es: f.name }));
                                        setEditMaterialForm((prev) => ({
                                          ...prev,
                                          file_path_es: buildStoredMediaPath(uploaded),
                                          file_size_mb_es: uploaded.size
                                            ? String(
                                                Number(
                                                  (uploaded.size / (1024 * 1024)).toFixed(2)
                                                )
                                              )
                                            : '',
                                          page_count_es:
                                            uploaded.page_count != null &&
                                            Number.isFinite(Number(uploaded.page_count))
                                              ? String(Math.floor(Number(uploaded.page_count)))
                                              : '',
                                        }));
                                      } catch (err) {
                                        showError(
                                          err instanceof Error ? err.message : 'Upload error'
                                        );
                                      } finally {
                                        setEditMaterialUploading((u) => ({ ...u, es: false }));
                                      }
                                    }}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                  {editMaterialPickedFileName.es ? (
                                    <div className="text-xs font-medium text-[#5a1428] mt-1 break-all">
                                      {lang === 'vi' ? 'File PDF:' : 'PDF:'}{' '}
                                      {editMaterialPickedFileName.es}
                                    </div>
                                  ) : null}
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {editMaterialUploading.es
                                      ? lang === 'vi'
                                        ? 'Đang tải lên...'
                                        : 'Subiendo...'
                                      : lang === 'vi'
                                        ? 'Chọn PDF khác để thay thế — URL, dung lượng và số trang cập nhật tự động.'
                                        : 'Elija otro PDF — URL, tamaño y páginas se actualizan solos.'}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">URL (VI)</Label>
                                  <a
                                    href={resolveMediaUrl(editMaterialForm.file_path_vi)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-[#7a2038] underline break-all"
                                  >
                                    {editMaterialForm.file_path_vi || '-'}
                                  </a>
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {lang === 'vi' ? 'Dung lượng' : 'Tamaño'}:{' '}
                                    {editMaterialForm.file_size_mb_vi || '-'} MB
                                  </div>
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {lang === 'vi' ? 'Số trang PDF' : 'Páginas PDF'}:{' '}
                                    {editMaterialForm.page_count_vi !== ''
                                      ? editMaterialForm.page_count_vi
                                      : '—'}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">URL (ES)</Label>
                                  <a
                                    href={resolveMediaUrl(editMaterialForm.file_path_es)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-[#7a2038] underline break-all"
                                  >
                                    {editMaterialForm.file_path_es || '-'}
                                  </a>
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {lang === 'vi' ? 'Dung lượng' : 'Tamaño'}:{' '}
                                    {editMaterialForm.file_size_mb_es || '-'} MB
                                  </div>
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {lang === 'vi' ? 'Số trang PDF' : 'Páginas PDF'}:{' '}
                                    {editMaterialForm.page_count_es !== ''
                                      ? editMaterialForm.page_count_es
                                      : '—'}
                                  </div>
                                </div>
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    disabled={editMaterialUploading.vi || editMaterialUploading.es}
                                    onClick={() => onSaveEditMaterial(item)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                  >
                                    {lang === 'vi' ? 'Lưu' : 'Guardar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onCancelEditMaterial}
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
                        ))}
                        <AdminListPaginationControls
                          lang={lang}
                          page={adminMaterialsPage}
                          pageSize={ADMIN_LIST_PAGE_SIZE}
                          total={filteredMaterials.length}
                          onPageChange={setAdminMaterialsListPage}
                        />
                      </div>
                    </div>
                  )}
                </AdminMaterialsTabShell>
  );
}
