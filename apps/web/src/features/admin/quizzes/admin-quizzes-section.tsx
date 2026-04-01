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
import { getQuizzesHierarchyTitle } from '@/features/admin/admin.section-titles';
import {
  AdminActionIconButton,
  AdminListPaginationControls,
} from '@/features/admin/admin.shared-components';
import { AdminQuizzesTabShell } from '@/features/admin/quizzes/admin-quizzes-tab';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

export function AdminQuizzesSection(props: any) {
  const {
    adminQuizzesPage,
    createQuizCategories,
    creatingQuiz,
    currentEditQuestion,
    currentEditQuestionImageFile,
    currentEditQuestionImagePreview,
    currentEditQuestionIndex,
    currentQuestionDraft,
    currentQuestionImageFile,
    currentQuestionImagePreview,
    currentQuestionIndex,
    editingQuizCategoryId,
    editingQuizId,
    editingQuizTopicGroupId,
    editQuizCategories,
    editQuizCategoryForm,
    editQuizForm,
    editQuizModalStep,
    editQuizQuestions,
    editQuizTopicGroupForm,
    filteredAdminQuizzes,
    filteredQuizCategories,
    filteredQuizTopicGroups,
    getQuizDisplayDescription,
    getQuizDisplayTitle,
    getQuizTopicGroupLabel,
    lang,
    listQuizCategoriesByGroup,
    loadingEditQuizDetail,
    newQuizCategory,
    newQuizTopicGroup,
    onAddEditQuestion,
    onCancelEditQuiz,
    onChangeQuestionCount,
    onCreateQuiz,
    onCreateQuizCategory,
    onCreateQuizTopicGroup,
    onDeleteQuiz,
    onDeleteQuizCategory,
    onDeleteQuizTopicGroup,
    onSaveEditQuiz,
    onSaveEditQuizCategory,
    onSaveEditQuizTopicGroup,
    onStartEditQuiz,
    onStartEditQuizCategory,
    onStartEditQuizTopicGroup,
    onToggleQuiz,
    paginatedAdminQuizzes,
    questionCount,
    questionDrafts,
    quizCategoriesAdmin,
    quizCategoryCreateDialogOpen,
    quizCategoryFilterGroupId,
    quizCategorySearch,
    quizCreateDialogOpen,
    quizCreateModalStep,
    quizForm,
    quizListFilterCategoryId,
    quizListFilterGroupId,
    quizSearch,
    quizTopicGroupCreateDialogOpen,
    quizTopicGroupsAdmin,
    quizTopicGroupSearch,
    quizzesHierarchyTab,
    quizzesSubTab,
    resolveMediaUrl,
    savingEditQuizDetail,
    setAdminQuizzesListPage,
    setCurrentEditQuestionIndex,
    setCurrentQuestionIndex,
    setEditCorrectAnswer,
    setEditingQuizCategoryId,
    setEditingQuizTopicGroupId,
    setEditQuizCategoryForm,
    setEditQuizForm,
    setEditQuizModalStep,
    setEditQuizTopicGroupForm,
    setNewQuizCategory,
    setNewQuizTopicGroup,
    setQuizCategoryCreateDialogOpen,
    setQuizCategoryFilterGroupId,
    setQuizCategorySearch,
    setQuizCreateDialogOpen,
    setQuizCreateModalStep,
    setQuizForm,
    setQuizListFilterCategoryId,
    setQuizListFilterGroupId,
    setQuizSearch,
    setQuizTopicGroupCreateDialogOpen,
    setQuizTopicGroupSearch,
    setQuizzesHierarchyTab,
    setQuizzesSubTab,
    updateCurrentQuestionField,
    updateCurrentQuestionImage,
    updateEditAnswerField,
    updateEditQuestionField,
    updateEditQuestionImage,
  } = props;

  return (
                <AdminQuizzesTabShell
                  lang={lang}
                  quizzesSubTab={quizzesSubTab}
                  quizzesHierarchyTab={quizzesHierarchyTab}
                  setQuizzesSubTab={setQuizzesSubTab}
                  setQuizzesHierarchyTab={setQuizzesHierarchyTab}
                >

                  {quizzesSubTab === 'types' && (
                    <div className="rounded-none border border-[#dbe3ee] bg-white p-3">
                      <div className="mb-1">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
                          {getQuizzesHierarchyTitle(lang, quizzesHierarchyTab)}
                        </h3>
                      </div>
                      {quizzesHierarchyTab === 'topic_groups' && (
                      <div className="mb-0 space-y-2">
                        <p className="text-sm font-semibold text-[#7a2038]">
                          {lang === 'vi'
                            ? 'Loại chủ đề bài thi - tạo mới ở đây'
                            : 'Grupo de tema de examen - crear nuevo aquí'}
                        </p>
                        <Button
                          type="button"
                          onClick={() => setQuizTopicGroupCreateDialogOpen(true)}
                          className="h-9 w-full justify-center bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm loại chủ đề' : 'Agregar grupo de tema'}
                        </Button>
                        <Dialog open={quizTopicGroupCreateDialogOpen} onOpenChange={setQuizTopicGroupCreateDialogOpen}>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="text-[#6b1b31]">
                                {lang === 'vi' ? 'Thêm loại chủ đề bài thi' : 'Agregar grupo de tema de examen'}
                              </DialogTitle>
                            </DialogHeader>
                        <form onSubmit={onCreateQuizTopicGroup} className="space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]">🇻🇳 Tiếng Việt</p>
                              <Input placeholder="Tên VI" value={newQuizTopicGroup.name_vi} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, name_vi: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                              <Input placeholder="Mô tả VI" value={newQuizTopicGroup.description_vi} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, description_vi: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                            </div>
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]">🇪🇸 Español</p>
                              <Input placeholder="Nombre ES" value={newQuizTopicGroup.name_es} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, name_es: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                              <Input placeholder="Descripción ES" value={newQuizTopicGroup.description_es} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, description_es: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                            </div>
                          </div>
                          <Button type="submit" className="h-10 rounded-md bg-[#7a2038] hover:bg-[#5a1428] text-white">{lang === 'vi' ? 'Thêm loại chủ đề' : 'Agregar grupo de tema'}</Button>
                        </form>
                          </DialogContent>
                        </Dialog>
                        <div className="mb-2">
                          <Input
                            value={quizTopicGroupSearch}
                            onChange={(e) => setQuizTopicGroupSearch(e.target.value)}
                            placeholder={
                              lang === 'vi'
                                ? 'Tìm loại chủ đề theo mã, tên, mô tả...'
                                : 'Buscar grupo por código, nombre, descripción...'
                            }
                            className="h-9 border-[#d2d2d2] bg-white"
                          />
                        </div>
                        <div className="overflow-hidden rounded-md border border-[#e5d9de] divide-y divide-[#ece2e6] bg-white">
                          {filteredQuizTopicGroups.map((groupItem) => (
                            <div key={groupItem.id} className="group rounded-none border-0 bg-white p-2 text-xs">
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
                                  <AdminActionIconButton onClick={() => onStartEditQuizTopicGroup(groupItem)} title={lang === 'vi' ? 'Sửa' : 'Editar'} kind="edit" className="h-8 w-8 rounded-md px-0" icon={<Edit className="h-3.5 w-3.5" />} />
                                  <AdminActionIconButton onClick={() => onDeleteQuizTopicGroup(groupItem)} title={lang === 'vi' ? 'Xóa' : 'Eliminar'} kind="delete" className="h-8 w-8 rounded-md px-0" icon={<Trash2 className="h-3.5 w-3.5" />} />
                                </div>
                              </div>
                              {editingQuizTopicGroupId === groupItem.id && (
                                <Dialog open={editingQuizTopicGroupId === groupItem.id} onOpenChange={(open) => !open && setEditingQuizTopicGroupId(null)}>
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#6b1b31]">
                                        {lang === 'vi' ? 'Sửa loại chủ đề bài thi' : 'Editar grupo de examen'}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <Input value={editQuizTopicGroupForm.code} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, code: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]">🇻🇳 Tiếng Việt</p>
                                          <Input value={editQuizTopicGroupForm.name_vi} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, name_vi: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input value={editQuizTopicGroupForm.description_vi} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, description_vi: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]">🇪🇸 Español</p>
                                          <Input value={editQuizTopicGroupForm.name_es} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, name_es: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input value={editQuizTopicGroupForm.description_es} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, description_es: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={() => onSaveEditQuizTopicGroup(groupItem)} className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white">{lang === 'vi' ? 'Lưu' : 'Guardar'}</Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingQuizTopicGroupId(null)} className="h-9 border-[#d2d2d2] bg-white">{lang === 'vi' ? 'Hủy' : 'Cancelar'}</Button>
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
                      {quizzesHierarchyTab === 'types' && (
                      <>
                      <div className="mb-2 max-w-sm">
                        <Label className="text-xs text-[#5b5b5b]">
                          {lang === 'vi' ? 'Lọc theo loại chủ đề' : 'Filtrar por grupo de tema'}
                        </Label>
                        <Select
                          value={quizCategoryFilterGroupId}
                          onValueChange={setQuizCategoryFilterGroupId}
                        >
                          <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {lang === 'vi' ? 'Tất cả loại chủ đề' : 'Todos los grupos'}
                            </SelectItem>
                            {quizTopicGroupsAdmin.map((groupItem) => (
                              <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                {getQuizTopicGroupLabel(groupItem)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-2 space-y-1">
                        <p className="text-sm font-semibold text-[#7a2038]">
                          {lang === 'vi'
                            ? 'Chủ đề bài thi - tạo mới ở đây'
                            : 'Tema de examen - crear nuevo aquí'}
                        </p>
                        <Button
                          type="button"
                          onClick={() => setQuizCategoryCreateDialogOpen(true)}
                          className="h-9 w-full justify-center bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm chủ đề bài thi' : 'Agregar tema de examen'}
                        </Button>
                      </div>
                      <Dialog open={quizCategoryCreateDialogOpen} onOpenChange={setQuizCategoryCreateDialogOpen}>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#6b1b31]">
                              {lang === 'vi' ? 'Thêm chủ đề bài thi' : 'Agregar tema de examen'}
                            </DialogTitle>
                          </DialogHeader>
                      <form
                        onSubmit={onCreateQuizCategory}
                        className="mb-2 space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3"
                      >
                        <select
                          value={newQuizCategory.quiz_topic_group_id}
                          onChange={(e) =>
                            setNewQuizCategory((prev) => ({
                              ...prev,
                              quiz_topic_group_id: e.target.value,
                            }))
                          }
                          className="h-9 rounded-md border border-[#d2d2d2] bg-white px-2 text-sm"
                        >
                          <option value="">
                            {lang === 'vi' ? 'Chọn loại chủ đề' : 'Selecciona grupo de tema'}
                          </option>
                          {quizTopicGroupsAdmin.map((groupItem) => (
                            <option key={groupItem.id} value={String(groupItem.id)}>
                              {getQuizTopicGroupLabel(groupItem)}
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]">🇻🇳 Tiếng Việt</p>
                            <Input
                              placeholder="Tên VI"
                              value={newQuizCategory.name_vi}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, name_vi: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder="Mô tả VI"
                              value={newQuizCategory.description_vi}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, description_vi: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]">🇪🇸 Español</p>
                            <Input
                              placeholder="Nombre ES"
                              value={newQuizCategory.name_es}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, name_es: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder="Descripción ES"
                              value={newQuizCategory.description_es}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, description_es: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm chủ đề bài thi' : 'Agregar tema de examen'}
                        </Button>
                      </form>
                        </DialogContent>
                      </Dialog>
                      <div className="mb-2">
                        <Input
                          value={quizCategorySearch}
                          onChange={(e) => setQuizCategorySearch(e.target.value)}
                          placeholder={
                            lang === 'vi'
                              ? 'Tìm chủ đề theo mã, tên, mô tả...'
                              : 'Buscar tema por código, nombre, descripción...'
                          }
                          className="h-9 border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="space-y-0 divide-y divide-[#ece2e6] overflow-hidden rounded-md border border-[#e5d9de] bg-white">
                        {filteredQuizCategories.map((categoryItem) => (
                          <div
                            key={categoryItem.id}
                            className="flex items-center justify-between gap-2 border-0 bg-white p-2 rounded-none"
                          >
                            {editingQuizCategoryId === categoryItem.id ? (
                              <div className="w-full rounded-none border border-[#e9dfe3] bg-[#faf7f8] p-2">
                                <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                                  <Edit className="h-3.5 w-3.5 text-[#7a2038]" aria-hidden />
                                  <span className="text-[11px] font-bold uppercase text-[#6b1b31]">
                                    {lang === 'vi'
                                      ? 'Sửa chủ đề bài thi'
                                      : 'Editar tema de examen'}
                                  </span>
                                </div>
                              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
                                <select
                                  value={editQuizCategoryForm.quiz_topic_group_id}
                                  onChange={(e) =>
                                    setEditQuizCategoryForm((prev) => ({
                                      ...prev,
                                      quiz_topic_group_id: e.target.value,
                                    }))
                                  }
                                  className="h-9 rounded-none border border-[#d2d2d2] bg-white px-2 text-sm"
                                >
                                  <option value="">
                                    {lang === 'vi' ? 'Chọn loại chủ đề' : 'Selecciona grupo de tema'}
                                  </option>
                                  {quizTopicGroupsAdmin.map((groupItem) => (
                                    <option key={groupItem.id} value={String(groupItem.id)}>
                                      {getQuizTopicGroupLabel(groupItem)}
                                    </option>
                                  ))}
                                </select>
                                <Input
                                  value={editQuizCategoryForm.name_vi}
                                  onChange={(e) =>
                                    setEditQuizCategoryForm((prev) => ({
                                      ...prev,
                                      name_vi: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editQuizCategoryForm.name_es}
                                  onChange={(e) =>
                                    setEditQuizCategoryForm((prev) => ({
                                      ...prev,
                                      name_es: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editQuizCategoryForm.description_vi}
                                  onChange={(e) =>
                                    setEditQuizCategoryForm((prev) => ({
                                      ...prev,
                                      description_vi: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editQuizCategoryForm.description_es}
                                  onChange={(e) =>
                                    setEditQuizCategoryForm((prev) => ({
                                      ...prev,
                                      description_es: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => onSaveEditQuizCategory(categoryItem)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                  >
                                    {lang === 'vi' ? 'Lưu' : 'Guardar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingQuizCategoryId(null)}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  >
                                    {lang === 'vi' ? 'Hủy' : 'Cancelar'}
                                  </Button>
                                </div>
                              </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className="font-semibold text-[#5a1428]">
                                    {lang === 'vi' ? categoryItem.name_vi : categoryItem.name_es}
                                  </div>
                                  <div className="text-xs text-[#7a2038]">
                                    {lang === 'vi'
                                      ? categoryItem.quiz_topic_group_name_vi || '-'
                                      : categoryItem.quiz_topic_group_name_es || '-'}
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi'
                                      ? categoryItem.description_vi || '-'
                                      : categoryItem.description_es || '-'}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <AdminActionIconButton onClick={() => onStartEditQuizCategory(categoryItem)} title={lang === 'vi' ? 'Sửa chủ đề bài thi' : 'Editar tema de examen'} kind="edit" icon={<Edit className="h-3.5 w-3.5" />} />
                                  <AdminActionIconButton onClick={() => onDeleteQuizCategory(categoryItem)} title={lang === 'vi' ? 'Xóa chủ đề bài thi' : 'Eliminar tema de examen'} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      </>
                      )}
                    </div>
                  )}

                  {/* Create Quiz Form */}
                  {quizzesSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-base">
                          {lang === 'vi' ? 'Tạo đề thi mới' : 'Crear examen'}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => {
                            setQuizCreateModalStep('meta');
                            setQuizCreateDialogOpen(true);
                          }}
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm mới' : 'Agregar nuevo'}
                        </Button>
                      </div>
                      <Dialog open={quizCreateDialogOpen} onOpenChange={setQuizCreateDialogOpen}>
                        <DialogContent className="max-w-6xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#6b1b31]">
                              {lang === 'vi' ? 'Tạo đề thi mới' : 'Crear examen'}
                            </DialogTitle>
                          </DialogHeader>
                      <div className="w-full rounded-none border border-[#e9dfe3] bg-[#faf7f8] p-2 md:p-2">
                        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                          <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                          <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                            {lang === 'vi'
                              ? 'Tạo bài thi mới — thông tin & câu hỏi'
                              : 'Crear examen nuevo — datos y preguntas'}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#7a2038]">
                            {quizCreateModalStep === 'meta'
                              ? lang === 'vi'
                                ? 'Bước 1/2: Thông tin đề'
                                : 'Paso 1/2: Datos del examen'
                              : lang === 'vi'
                                ? 'Bước 2/2: Câu hỏi & trả lời'
                                : 'Paso 2/2: Preguntas y respuestas'}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setQuizCreateModalStep('meta')}
                              className={`h-7 border-[#d2d2d2] px-2 text-xs ${quizCreateModalStep === 'meta' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                            >
                              {lang === 'vi' ? 'Thông tin' : 'Datos'}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setQuizCreateModalStep('questions')}
                              className={`h-7 border-[#d2d2d2] px-2 text-xs ${quizCreateModalStep === 'questions' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                            >
                              {lang === 'vi' ? 'Câu hỏi' : 'Preguntas'}
                            </Button>
                          </div>
                        </div>
                      <form onSubmit={onCreateQuiz} className="space-y-2">
                        {quizCreateModalStep === 'meta' && (
                          <>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema'}
                            </Label>
                            <Select
                              value={quizForm.quiz_topic_group_id}
                              onValueChange={(v) =>
                                setQuizForm((prev) => ({
                                  ...prev,
                                  quiz_topic_group_id: v,
                                  category_id: '',
                                }))
                              }
                            >
                              <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                <SelectValue placeholder={lang === 'vi' ? 'Chọn loại chủ đề' : 'Seleccionar grupo'} />
                              </SelectTrigger>
                              <SelectContent>
                                {quizTopicGroupsAdmin.map((groupItem) => (
                                  <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                    {lang === 'vi' ? groupItem.name_vi : groupItem.name_es}
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
                              value={quizForm.category_id}
                              onValueChange={(v) => setQuizForm((prev) => ({ ...prev, category_id: v }))}
                            >
                              <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                <SelectValue placeholder={lang === 'vi' ? 'Chọn chủ đề' : 'Seleccionar tema'} />
                              </SelectTrigger>
                              <SelectContent>
                                {createQuizCategories.map((categoryItem) => (
                                  <SelectItem key={categoryItem.id} value={String(categoryItem.id)}>
                                    {lang === 'vi' ? categoryItem.name_vi : categoryItem.name_es}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Điểm đạt' : 'Mínimo'}
                            </Label>
                            <Input
                              value="10"
                              disabled
                              className="border-[#d2d2d2] bg-[#f2f2f2] h-9"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                            <h4 className="font-bold text-[#5a1428] mb-2 text-sm">🇻🇳 Tiếng Việt</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder="Tiêu đề"
                                value={quizForm.title_vi}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, title_vi: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Textarea
                                placeholder="Mô tả"
                                value={quizForm.description_vi}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, description_vi: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                              <Textarea
                                placeholder="Hướng dẫn"
                                value={quizForm.instructions_vi}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, instructions_vi: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                          </div>
                          <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                            <h4 className="font-bold text-[#5a1428] mb-2 text-sm">🇪🇸 Español</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder="Título"
                                value={quizForm.title_es}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, title_es: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Textarea
                                placeholder="Descripción"
                                value={quizForm.description_es}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, description_es: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                              <Textarea
                                placeholder="Instrucciones"
                                value={quizForm.instructions_es}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, instructions_es: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                          </div>
                        </div>
                          </>
                        )}

                        {/* Question Builder */}
                        {quizCreateModalStep === 'questions' && (
                        <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h4 className="font-bold text-[#5a1428] text-sm">
                              📝 {lang === 'vi' ? 'Câu hỏi' : 'Preguntas'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#5b5b5b]">
                                {lang === 'vi' ? 'Tổng số' : 'Total'}:
                              </span>
                              <Input
                                type="number"
                                min={1}
                                max={60}
                                value={questionCount}
                                onChange={(e) => onChangeQuestionCount(e.target.value)}
                                className="w-20 h-8 border-[#d2d2d2] bg-white"
                              />
                              <span className="text-xs text-[#5b5b5b]">
                                {lang === 'vi' ? 'Câu' : 'Preg'} {currentQuestionIndex + 1}/
                                {questionCount}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {questionDrafts.slice(0, questionCount).map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`h-7 w-7 text-xs font-bold rounded-sm border transition-colors ${idx === currentQuestionIndex ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]' : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-2 rounded-none">
                              <h5 className="font-semibold text-[#5a1428] mb-2 text-sm">
                                🇻🇳 Tiếng Việt
                              </h5>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Nội dung câu hỏi"
                                  value={currentQuestionDraft.question_text_vi}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('question_text_vi', e.target.value)
                                  }
                                  rows={2}
                                  required
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <Textarea
                                  placeholder="Giải thích"
                                  value={currentQuestionDraft.explanation_vi}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('explanation_vi', e.target.value)
                                  }
                                  rows={2}
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <div className="space-y-2.5 pt-1">
                                  <Input
                                    placeholder="Trả lời A"
                                    value={currentQuestionDraft.answer_vi_1}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_1', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder="Trả lời B"
                                    value={currentQuestionDraft.answer_vi_2}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_2', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder="Trả lời C"
                                    value={currentQuestionDraft.answer_vi_3}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_3', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-2 rounded-none">
                              <h5 className="font-semibold text-[#5a1428] mb-2 text-sm">
                                🇪🇸 Español
                              </h5>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Texto de pregunta"
                                  value={currentQuestionDraft.question_text_es}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('question_text_es', e.target.value)
                                  }
                                  rows={2}
                                  required
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <Textarea
                                  placeholder="Explicación"
                                  value={currentQuestionDraft.explanation_es}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('explanation_es', e.target.value)
                                  }
                                  rows={2}
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <div className="space-y-2.5 pt-1">
                                  <Input
                                    placeholder="Respuesta A"
                                    value={currentQuestionDraft.answer_es_1}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_es_1', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder="Respuesta B"
                                    value={currentQuestionDraft.answer_es_2}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_es_2', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder="Respuesta C"
                                    value={currentQuestionDraft.answer_es_3}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_es_3', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">
                                {lang === 'vi' ? 'Trả lời đúng' : 'Correcta'}
                              </Label>
                              <Select
                                value={currentQuestionDraft.correct_index}
                                onValueChange={(v) =>
                                  updateCurrentQuestionField('correct_index', v)
                                }
                              >
                                <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">A</SelectItem>
                                  <SelectItem value="2">B</SelectItem>
                                  <SelectItem value="3">C</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">
                                {lang === 'vi' ? 'Hình ảnh' : 'Imagen'}
                              </Label>
                              {currentQuestionImagePreview && (
                                <div className="mb-2 rounded-sm border border-[#d2d2d2] bg-white p-2">
                                  <img
                                    src={currentQuestionImagePreview}
                                    alt={lang === 'vi' ? 'Xem trước ảnh câu hỏi' : 'Vista previa de imagen'}
                                    className="h-36 w-full rounded-sm object-contain bg-[#f9f9f9]"
                                  />
                                </div>
                              )}
                              <Input
                                key={`img-${currentQuestionIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  updateCurrentQuestionImage(e.target.files?.[0] || null)
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              {currentQuestionImageFile && (
                                <span className="text-xs text-[#5b5b5b]">
                                  {currentQuestionImageFile.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setQuizCreateModalStep('meta')}
                            disabled={quizCreateModalStep === 'meta'}
                            className="h-9 border-[#d2d2d2] bg-white"
                          >
                            {lang === 'vi' ? 'Quay lại' : 'Atrás'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setQuizCreateModalStep('questions')}
                            disabled={quizCreateModalStep === 'questions'}
                            className="h-9 border-[#d2d2d2] bg-white"
                          >
                            {lang === 'vi' ? 'Tiếp theo' : 'Siguiente'}
                          </Button>
                          {quizCreateModalStep === 'questions' && (
                            <Button
                              type="submit"
                              disabled={creatingQuiz}
                              className="h-10 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                            >
                              {creatingQuiz ? '⏳...' : lang === 'vi' ? 'Tạo đề thi' : 'Crear examen'}
                            </Button>
                          )}
                        </div>
                      </form>
                      </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Quizzes List */}
                  {quizzesSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <h3 className="mb-2 font-bold text-[#5a1428] text-base md:text-base">
                        {lang === 'vi' ? 'Danh sách đề thi' : 'Lista de exámenes'} (
                        {filteredAdminQuizzes.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema'}
                          </Label>
                          <Select
                            value={quizListFilterGroupId}
                            onValueChange={(v) => {
                              setQuizListFilterGroupId(v);
                              const gid = Number(v);
                              const scoped =
                                v === 'all' || !Number.isFinite(gid) || gid <= 0
                                  ? quizCategoriesAdmin
                                  : quizCategoriesAdmin.filter(
                                      (item) => Number(item.quiz_topic_group_id) === gid
                                    );
                              if (
                                quizListFilterCategoryId !== 'all' &&
                                !scoped.some(
                                  (item) => Number(item.id) === Number(quizListFilterCategoryId)
                                )
                              ) {
                                setQuizListFilterCategoryId('all');
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
                              {quizTopicGroupsAdmin.map((groupItem) => (
                                <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                  {getQuizTopicGroupLabel(groupItem)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Chủ đề bài thi' : 'Tema de examen'}
                          </Label>
                          <Select
                            value={quizListFilterCategoryId}
                            onValueChange={setQuizListFilterCategoryId}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {lang === 'vi' ? 'Tất cả chủ đề' : 'Todos los temas'}
                              </SelectItem>
                              {listQuizCategoriesByGroup.map((categoryItem) => (
                                <SelectItem key={categoryItem.id} value={String(categoryItem.id)}>
                                  {lang === 'vi' ? categoryItem.name_vi : categoryItem.name_es}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Tìm kiếm đề thi' : 'Buscar examen'}
                          </Label>
                          <Input
                            value={quizSearch}
                            onChange={(e) => setQuizSearch(e.target.value)}
                            placeholder={
                              lang === 'vi'
                                ? 'Tìm theo tên đề, loại đề, mã...'
                                : 'Buscar por título, tipo o código...'
                            }
                            className="h-9 border-[#d2d2d2] bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-0 divide-y divide-[#ece2e6] border border-[#e9dfe3]">
                        {paginatedAdminQuizzes.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 border-0 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#5a1428]">
                                {getQuizDisplayTitle(item)}
                              </div>
                              <div className="text-xs text-[#5b5b5b] mt-0.5">
                                {getQuizDisplayDescription(item)}
                              </div>
                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-[#5b5b5b]">{item.code}</span>
                                <span className="text-xs text-[#5b5b5b]">
                                  {item.total_questions} {lang === 'vi' ? 'câu' : 'preg'}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded border ${item.is_active ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-100 text-gray-600'}`}
                                >
                                  {item.is_active ? (
                                    <Eye className="h-3 w-3 inline" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 inline" />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <AdminActionIconButton
                                onClick={() => onStartEditQuiz(item)}
                                title={lang === 'vi' ? 'Chỉnh sửa đề thi' : 'Editar examen'}
                                kind="edit"
                                className="h-8 w-8 px-0"
                                icon={<Edit className="h-3.5 w-3.5 shrink-0" />}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleQuiz(item)}
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                {item.is_active ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <AdminActionIconButton onClick={() => onDeleteQuiz(item)} title={lang === 'vi' ? 'Xóa đề thi' : 'Eliminar examen'} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                            {editingQuizId === item.id && (
                              <Dialog open={editingQuizId === item.id} onOpenChange={(open) => !open && onCancelEditQuiz()}>
                                <DialogContent className="max-w-6xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-[#6b1b31]">
                                      {lang === 'vi' ? 'Sửa bài thi' : 'Editar examen'}
                                    </DialogTitle>
                                  </DialogHeader>
                              <div className="w-full rounded-none border border-[#e9dfe3] bg-[#faf7f8] p-2 md:p-2">
                                <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                                  <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                                  <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                                    {lang === 'vi'
                                      ? 'Chỉnh sửa bài thi — thông tin & câu hỏi bên dưới'
                                      : 'Editar examen — datos y preguntas'}
                                  </span>
                                </div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-[#7a2038]">
                                    {editQuizModalStep === 'meta'
                                      ? lang === 'vi'
                                        ? 'Bước 1/2: Thông tin đề'
                                        : 'Paso 1/2: Datos del examen'
                                      : lang === 'vi'
                                        ? 'Bước 2/2: Câu hỏi & trả lời'
                                        : 'Paso 2/2: Preguntas y respuestas'}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditQuizModalStep('meta')}
                                      className={`h-7 border-[#d2d2d2] px-2 text-xs ${editQuizModalStep === 'meta' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                                    >
                                      {lang === 'vi' ? 'Thông tin' : 'Datos'}
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditQuizModalStep('questions')}
                                      className={`h-7 border-[#d2d2d2] px-2 text-xs ${editQuizModalStep === 'questions' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                                    >
                                      {lang === 'vi' ? 'Câu hỏi' : 'Preguntas'}
                                    </Button>
                                  </div>
                                </div>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {editQuizModalStep === 'meta' && (
                                  <>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema'}
                                  </Label>
                                  <Select
                                    value={editQuizForm.quiz_topic_group_id}
                                    onValueChange={(v) =>
                                      setEditQuizForm((prev) => ({
                                        ...prev,
                                        quiz_topic_group_id: v,
                                        category_id: '',
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue placeholder={lang === 'vi' ? 'Chọn loại chủ đề' : 'Seleccionar grupo'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {quizTopicGroupsAdmin.map((groupItem) => (
                                        <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                          {lang === 'vi' ? groupItem.name_vi : groupItem.name_es}
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
                                    value={editQuizForm.category_id}
                                    onValueChange={(v) =>
                                      setEditQuizForm((prev) => ({ ...prev, category_id: v }))
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue placeholder={lang === 'vi' ? 'Chọn chủ đề' : 'Seleccionar tema'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {editQuizCategories.map((categoryItem) => (
                                        <SelectItem key={categoryItem.id} value={String(categoryItem.id)}>
                                          {lang === 'vi' ? categoryItem.name_vi : categoryItem.name_es}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Điểm đạt' : 'Mínimo'}
                                  </Label>
                                  <Input
                                    value="10"
                                    disabled
                                    className="h-9 border-[#d2d2d2] bg-[#f2f2f2]"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Tiêu đề VI' : 'Título VI'}
                                  </Label>
                                  <Input
                                    value={editQuizForm.title_vi}
                                    onChange={(e) =>
                                      setEditQuizForm({ ...editQuizForm, title_vi: e.target.value })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Tiêu đề ES' : 'Título ES'}
                                  </Label>
                                  <Input
                                    value={editQuizForm.title_es}
                                    onChange={(e) =>
                                      setEditQuizForm({ ...editQuizForm, title_es: e.target.value })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Mô tả VI' : 'Descripción VI'}
                                  </Label>
                                  <Textarea
                                    value={editQuizForm.description_vi}
                                    onChange={(e) =>
                                      setEditQuizForm({
                                        ...editQuizForm,
                                        description_vi: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Mô tả ES' : 'Descripción ES'}
                                  </Label>
                                  <Textarea
                                    value={editQuizForm.description_es}
                                    onChange={(e) =>
                                      setEditQuizForm({
                                        ...editQuizForm,
                                        description_es: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Hướng dẫn VI' : 'Instrucciones VI'}
                                  </Label>
                                  <Textarea
                                    value={editQuizForm.instructions_vi}
                                    onChange={(e) =>
                                      setEditQuizForm({
                                        ...editQuizForm,
                                        instructions_vi: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Hướng dẫn ES' : 'Instrucciones ES'}
                                  </Label>
                                  <Textarea
                                    value={editQuizForm.instructions_es}
                                    onChange={(e) =>
                                      setEditQuizForm({
                                        ...editQuizForm,
                                        instructions_es: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Trạng thái' : 'Estado'}
                                  </Label>
                                  <Select
                                    value={editQuizForm.is_active ? 'active' : 'hidden'}
                                    onValueChange={(v) =>
                                      setEditQuizForm({
                                        ...editQuizForm,
                                        is_active: v === 'active',
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        {lang === 'vi' ? 'Hiển thị' : 'Activo'}
                                      </SelectItem>
                                      <SelectItem value="hidden">
                                        {lang === 'vi' ? 'Ẩn' : 'Oculto'}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                  </>
                                )}
                                {editQuizModalStep === 'questions' && (
                                <div className="md:col-span-2 border border-[#d2d2d2] bg-white rounded-sm p-3 space-y-3">
                                  {loadingEditQuizDetail ? (
                                    <div className="text-xs text-[#5b5b5b]">
                                      {lang === 'vi'
                                        ? 'Đang tải chi tiết đề thi...'
                                        : 'Cargando detalle del examen...'}
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-[#5a1428]">
                                          {lang === 'vi'
                                            ? `Danh sách câu hỏi (${editQuizQuestions.length})`
                                            : `Lista de preguntas (${editQuizQuestions.length})`}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={onAddEditQuestion}
                                          className="h-7 border-[#d2d2d2] bg-white px-2 text-xs"
                                        >
                                          {lang === 'vi' ? 'Thêm câu' : 'Agregar pregunta'}
                                        </Button>
                                      </div>

                                      {editQuizQuestions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {editQuizQuestions.map((_, idx) => (
                                            <button
                                              key={`edit-q-${idx}`}
                                              type="button"
                                              onClick={() => setCurrentEditQuestionIndex(idx)}
                                              title={`${lang === 'vi' ? 'Câu' : 'Pregunta'} ${idx + 1}`}
                                              className={`h-8 w-8 rounded-sm border text-xs font-bold transition-colors ${idx === currentEditQuestionIndex ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]' : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'}`}
                                            >
                                              {idx + 1}
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                      {editQuizQuestions.length === 0 && (
                                        <div className="rounded-sm border border-dashed border-[#e1c8d0] bg-[#fff9fb] px-3 py-2 text-xs text-[#7a2038]">
                                          {lang === 'vi'
                                            ? 'Đề thi này chưa có câu hỏi. Bấm "Thêm câu" để bắt đầu.'
                                            : 'Este examen aun no tiene preguntas. Pulse "Agregar pregunta".'}
                                        </div>
                                      )}

                                      {currentEditQuestion && (
                                        <div
                                          key={`edit-question-${currentEditQuestion.id ?? currentEditQuestionIndex}`}
                                          className="border border-[#d2d2d2] rounded-sm p-2 bg-[#fcfcfc]"
                                        >
                                          <div className="text-xs font-bold text-[#7a2038] mb-1">
                                            {lang === 'vi' ? 'Câu' : 'Pregunta'} {currentEditQuestionIndex + 1}
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div className="space-y-1.5 rounded-sm border border-[#edd5dc] bg-[#fff9fb] p-2">
                                              <div className="space-y-0.5">
                                                <Label className="block text-xs font-bold text-[#7a2038]">
                                                  🇻🇳 Tiếng Việt
                                                </Label>
                                                <Label className="block text-[11px] text-[#5b5b5b]">
                                                  {lang === 'vi' ? 'Câu hỏi VI' : 'Pregunta VI'}
                                                </Label>
                                              </div>
                                              <Textarea
                                                value={currentEditQuestion.question_text_vi}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_vi',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Label className="text-[11px] text-[#5b5b5b]">
                                                {lang === 'vi' ? 'Giải thích VI' : 'Explicación VI'}
                                              </Label>
                                              <Textarea
                                                value={currentEditQuestion.explanation_vi}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_vi',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                placeholder={
                                                  lang === 'vi' ? 'Giải thích VI' : 'Explicación VI'
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>

                                            <div className="space-y-1.5 rounded-sm border border-[#edd5dc] bg-[#fff9fb] p-2">
                                              <div className="space-y-0.5">
                                                <Label className="block text-xs font-bold text-[#7a2038]">
                                                  🇪🇸 Español
                                                </Label>
                                                <Label className="block text-[11px] text-[#5b5b5b]">
                                                  {lang === 'vi' ? 'Câu hỏi ES' : 'Pregunta ES'}
                                                </Label>
                                              </div>
                                              <Textarea
                                                value={currentEditQuestion.question_text_es}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_es',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Label className="text-[11px] text-[#5b5b5b]">
                                                {lang === 'vi' ? 'Giải thích ES' : 'Explicación ES'}
                                              </Label>
                                              <Textarea
                                                value={currentEditQuestion.explanation_es}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_es',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                placeholder={
                                                  lang === 'vi' ? 'Giải thích ES' : 'Explicación ES'
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>
                                          </div>

                                          <div className="mt-2 space-y-1.5">
                                            <div className="hidden md:grid md:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 text-[11px] font-semibold text-[#7a2038]">
                                              <div>{lang === 'vi' ? 'Trả lời' : 'Resp.'}</div>
                                              <div>
                                                {lang === 'vi' ? 'Nội dung trả lời VI' : 'Texto respuesta VI'}
                                              </div>
                                              <div>
                                                {lang === 'vi' ? 'Nội dung trả lời ES' : 'Texto respuesta ES'}
                                              </div>
                                              <div className="text-right">
                                                {lang === 'vi' ? 'Đúng' : 'Ok'}
                                              </div>
                                            </div>
                                            {(currentEditQuestion.answers || []).map(
                                              (answer: any, answerIndex: number) => (
                                                <div
                                                  key={`edit-answer-${currentEditQuestionIndex}-${answer.id ?? answerIndex}`}
                                                  className="rounded-sm border border-[#ead9de] bg-white p-2 md:grid md:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_44px] md:gap-2 md:border-0 md:bg-transparent md:p-0 space-y-2 md:space-y-0"
                                                >
                                                  <div className="text-xs font-semibold text-[#7a2038] flex items-center md:min-h-9">
                                                    {String.fromCharCode(65 + answerIndex)}
                                                  </div>
                                                  <div className="space-y-1 md:space-y-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {lang === 'vi' ? 'Nội dung trả lời VI' : 'Texto respuesta VI'}
                                                    </Label>
                                                  <Input
                                                    value={answer.answer_text_vi}
                                                    onChange={(e) =>
                                                      updateEditAnswerField(
                                                        currentEditQuestionIndex,
                                                        answerIndex,
                                                        'answer_text_vi',
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder={`${lang === 'vi' ? 'Trả lời' : 'Respuesta'} ${String.fromCharCode(65 + answerIndex)} (VI)`}
                                                    className="h-9 border-[#d2d2d2] bg-white"
                                                  />
                                                  </div>
                                                  <div className="space-y-1 md:space-y-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {lang === 'vi' ? 'Nội dung trả lời ES' : 'Texto respuesta ES'}
                                                    </Label>
                                                  <Input
                                                    value={answer.answer_text_es}
                                                    onChange={(e) =>
                                                      updateEditAnswerField(
                                                        currentEditQuestionIndex,
                                                        answerIndex,
                                                        'answer_text_es',
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder={`${lang === 'vi' ? 'Trả lời' : 'Respuesta'} ${String.fromCharCode(65 + answerIndex)} (ES)`}
                                                    className="h-9 border-[#d2d2d2] bg-white"
                                                  />
                                                  </div>
                                                  <div className="flex items-center justify-end gap-2 md:gap-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {lang === 'vi' ? 'Đánh dấu đúng' : 'Marcar correcta'}
                                                    </Label>
                                                    <input
                                                      type="radio"
                                                      checked={answer.is_correct}
                                                      onChange={() =>
                                                        setEditCorrectAnswer(
                                                          currentEditQuestionIndex,
                                                          answerIndex
                                                        )
                                                      }
                                                      className="h-4 w-4 accent-[#7a2038]"
                                                    />
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>

                                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div>
                                              <Label className="text-xs text-[#5b5b5b]">
                                                {lang === 'vi' ? 'Ảnh câu hỏi' : 'Imagen de pregunta'}
                                              </Label>
                                              {currentEditQuestionImagePreview && (
                                                <div className="mb-2 rounded-sm border border-[#d2d2d2] bg-white p-2">
                                                  <img
                                                    src={currentEditQuestionImagePreview}
                                                    alt={
                                                      lang === 'vi'
                                                        ? 'Xem trước ảnh mới'
                                                        : 'Vista previa de nueva imagen'
                                                    }
                                                    className="h-28 w-full rounded-sm object-contain bg-[#f9f9f9]"
                                                  />
                                                </div>
                                              )}
                                              {currentEditQuestion.image_url && (
                                                <div className="mb-2 rounded-sm border border-[#d2d2d2] bg-white p-2">
                                                  <img
                                                    src={resolveMediaUrl(currentEditQuestion.image_url)}
                                                    alt={lang === 'vi' ? 'Ảnh câu hỏi' : 'Imagen de pregunta'}
                                                    className="h-28 w-full rounded-sm object-contain bg-[#f9f9f9]"
                                                  />
                                                </div>
                                              )}
                                              <Input
                                                key={`edit-img-${currentEditQuestionIndex}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                  updateEditQuestionImage(
                                                    currentEditQuestionIndex,
                                                    e.target.files?.[0] || null
                                                  )
                                                }
                                                className="h-9 border-[#d2d2d2] bg-white"
                                              />
                                              {currentEditQuestionImageFile && (
                                                <div className="mt-1 text-xs text-[#5b5b5b]">
                                                  {currentEditQuestionImageFile.name}
                                                </div>
                                              )}
                                              {currentEditQuestion.image_url && (
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    updateEditQuestionField(
                                                      currentEditQuestionIndex,
                                                      'image_url',
                                                      ''
                                                    )
                                                  }
                                                  className="mt-2 h-8 border-[#d2d2d2] bg-white"
                                                >
                                                  {lang === 'vi' ? 'Xóa ảnh' : 'Quitar imagen'}
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                )}
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditQuizModalStep('questions')}
                                    disabled={editQuizModalStep === 'questions'}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  >
                                    {lang === 'vi' ? 'Tiếp theo' : 'Siguiente'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => onSaveEditQuiz(item)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                    disabled={loadingEditQuizDetail || savingEditQuizDetail}
                                  >
                                    {savingEditQuizDetail
                                      ? lang === 'vi'
                                        ? 'Đang lưu...'
                                        : 'Guardando...'
                                      : lang === 'vi'
                                        ? 'Lưu'
                                        : 'Guardar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onCancelEditQuiz}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                    disabled={savingEditQuizDetail}
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
                          page={adminQuizzesPage}
                          pageSize={ADMIN_LIST_PAGE_SIZE}
                          total={filteredAdminQuizzes.length}
                          onPageChange={setAdminQuizzesListPage}
                        />
                      </div>
                    </div>
                  )}
                </AdminQuizzesTabShell>
  );
}
