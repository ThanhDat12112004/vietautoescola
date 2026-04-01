import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import {
  ADMIN_LIST_PAGE_SIZE,
  ADMIN_USER_ROLE_FILTER_OPTIONS,
  ADMIN_USER_STATUS_FILTER_OPTIONS,
} from '@/features/admin/admin.constants';
import {
  buildStoredMediaPath,
  createEmptyEditQuestionDraft,
  createEmptyQuestionDraft,
  parseMaterialPageCountFromForm,
} from '@/features/admin/admin.form.helpers';
import {
  createInitialEditMaterialForm,
  createInitialEditMaterialTopicGroupForm,
  createInitialEditQuizCategoryForm,
  createInitialEditQuizForm,
  createInitialEditQuizTopicGroupForm,
  createInitialEditQuizTypeForm,
  createInitialEditUserForm,
  createInitialMaterialForm,
  createInitialMaterialTopicGroupForm,
  createInitialPickedFileNameState,
  createInitialQuizCategoryForm,
  createInitialQuizForm,
  createInitialQuizTopicGroupForm,
  createInitialQuizTypeForm,
  createInitialSubjectForm,
  createInitialUploadState,
} from '@/features/admin/admin.initial-state';
import { formatDateTime as formatDateTimeHelper, parseDateSafe } from '@/features/admin/admin.helpers';
import { getAdminTabButtons } from '@/features/admin/admin.tab-config';
import { getQuizzesHierarchyTitle } from '@/features/admin/admin.section-titles';
import { ADMIN_REDESIGN_CSS } from '@/features/admin/admin.styles';
import { AdminMaterialsSection } from '@/features/admin/materials/admin-materials-section';
import { AdminQuizzesSection } from '@/features/admin/quizzes/admin-quizzes-section';
import { AdminUsersTab } from '@/features/admin/users/admin-users-tab';
import {
  getMaterialsSubtabs,
  getQuizzesSubtabs,
  isQuizzesSubtabActive,
  resolveMaterialsSubtabState,
  resolveQuizzesSubtabState,
} from '@/features/admin/admin.subtab-config';
import {
  AdminNoticeBanner,
  AdminPageHeader,
  AdminSidebarTabs,
} from '@/features/admin/admin.layout-components';
import {
  AdminActionIconButton,
  AdminListPaginationControls,
} from '@/features/admin/admin.shared-components';
import { fileNameFromStoredPath, formatUserRole, isPdfFile } from '@/features/admin/admin.utils';
import {
  showErrorNotice,
  showSuccessNotice,
} from '@/features/admin/admin.notice.helpers';
import {
  clampPage,
  filterAdminQuizzes,
  filterByGroupId,
  mapTopicGroupsForLanguage,
  searchByKeyword,
} from '@/features/admin/admin.selectors';
import {
  getQuizDisplayDescription as getQuizDisplayDescriptionHelper,
  getQuizDisplayTitle as getQuizDisplayTitleHelper,
  getQuizTypeDisplayName as getQuizTypeDisplayNameHelper,
  getQuizTypeFilterKey as getQuizTypeFilterKeyHelper,
  getQuizTypeLabel as getQuizTypeLabelHelper,
} from '@/features/admin/admin.quiz-display.helpers';
import { getMaterialsBySubject, getSubjects, type MaterialItem, type Subject } from '@/lib/api/materials';
import { resolveMediaUrl, uploadMaterialFile, uploadQuestionImage } from '@/lib/api/upload';
import {
  createAdminMaterialTopicGroup,
  createAdminQuizCategory,
  createAdminQuizTopicGroup,
  createAdminQuizType,
  createAdminSubject,
  createBilingualMaterial,
  createManualQuiz,
  deleteAdminMaterialTopicGroup,
  deleteAdminMaterial,
  deleteAdminQuiz,
  deleteAdminQuizCategory,
  deleteAdminQuizTopicGroup,
  deleteAdminQuizType,
  deleteAdminSubject,
  deleteAdminUser,
  getAdminMaterialTopicGroups,
  getAdminQuizCategories,
  getAdminQuizTopicGroups,
  getAdminQuizTypes,
  getAdminQuizzes,
  getAdminQuizDetail,
  getAdminSubjects,
  getAdminUserDashboard,
  getAdminUsers,
  lockAdminUser,
  unlockAdminUser,
  updateAdminMaterialTopicGroup,
  updateAdminMaterial,
  updateAdminQuiz,
  updateAdminQuizCategory,
  updateAdminQuizTopicGroup,
  updateAdminQuizDetail,
  updateAdminQuizType,
  updateAdminSubject,
  updateAdminUser,
  type AdminQuizCategory,
  type AdminQuizType,
  type AdminSubject,
  type AdminTopicGroup,
  type DashboardResponse,
} from '@/lib/api/admin';
import { useAdminUsers } from '@/features/admin/users/use-admin-users';
import { useAdminMaterials } from '@/features/admin/materials/use-admin-materials';
import { useAdminQuizzes } from '@/features/admin/quizzes/use-admin-quizzes';
import { getStoredAuth } from '@/lib/auth';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Trash2,
  Unlock,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_QUIZ_TYPE_CODE = 'general';

export default function Admin() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [notice, setNotice] = useState<{ text: string; type: 'error' | 'success' }>({
    text: '',
    type: 'error',
  });
  const [activeTab, setActiveTab] = useState<'users' | 'materials' | 'quizzes'>('users');
  const [materialsSubTab, setMaterialsSubTab] = useState<
    'topic_groups' | 'subjects' | 'manage'
  >('topic_groups');
  const [quizzesSubTab, setQuizzesSubTab] = useState<'types' | 'manage'>('types');
  const [quizzesHierarchyTab, setQuizzesHierarchyTab] = useState<'topic_groups' | 'types'>(
    'topic_groups'
  );
  const [auth, setAuth] = useState(() => getStoredAuth());

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userCreatedFrom, setUserCreatedFrom] = useState('');
  const [userCreatedTo, setUserCreatedTo] = useState('');
  const [userCreatedSort, setUserCreatedSort] = useState<'desc' | 'asc'>('desc');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>(
    'all'
  );
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [adminUsersListPage, setAdminUsersListPage] = useState(1);
  const [adminMaterialsListPage, setAdminMaterialsListPage] = useState(1);
  const [adminQuizzesListPage, setAdminQuizzesListPage] = useState(1);
  const [materialSearch, setMaterialSearch] = useState('');
  const [quizSearch, setQuizSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [viewingUserDashboard, setViewingUserDashboard] = useState<DashboardResponse | null>(null);
  const [viewingUserLoading, setViewingUserLoading] = useState(false);
  const [viewingUserError, setViewingUserError] = useState('');
  const [editUserForm, setEditUserForm] = useState(createInitialEditUserForm);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [adminSubjects, setAdminSubjects] = useState<AdminSubject[]>([]);
  const [materialTopicGroupsAdmin, setMaterialTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [newMaterialTopicGroup, setNewMaterialTopicGroup] = useState(
    createInitialMaterialTopicGroupForm
  );
  const [editingMaterialTopicGroupId, setEditingMaterialTopicGroupId] = useState<number | null>(null);
  const [editMaterialTopicGroupForm, setEditMaterialTopicGroupForm] = useState(
    createInitialEditMaterialTopicGroupForm
  );
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState(createInitialSubjectForm);
  const [editSubjectForm, setEditSubjectForm] = useState(createInitialSubjectForm);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState(createInitialEditMaterialForm);
  const [materialCreateStaged, setMaterialCreateStaged] = useState<{
    vi: {
      fileName: string;
      path: string;
      sizeMb: number | null;
      pageCount: number | null;
    } | null;
    es: {
      fileName: string;
      path: string;
      sizeMb: number | null;
      pageCount: number | null;
    } | null;
  }>({ vi: null, es: null });
  const [materialCreateUploading, setMaterialCreateUploading] = useState(createInitialUploadState);
  const [materialCreateFileKey, setMaterialCreateFileKey] = useState(0);
  const [materialCreateDialogOpen, setMaterialCreateDialogOpen] = useState(false);
  const [quizCreateDialogOpen, setQuizCreateDialogOpen] = useState(false);
  const [quizCreateModalStep, setQuizCreateModalStep] = useState<'meta' | 'questions'>('meta');
  const [materialTopicGroupCreateDialogOpen, setMaterialTopicGroupCreateDialogOpen] = useState(false);
  const [materialSubjectCreateDialogOpen, setMaterialSubjectCreateDialogOpen] = useState(false);
  const [quizTopicGroupCreateDialogOpen, setQuizTopicGroupCreateDialogOpen] = useState(false);
  const [quizCategoryCreateDialogOpen, setQuizCategoryCreateDialogOpen] = useState(false);
  const [editMaterialUploading, setEditMaterialUploading] = useState(createInitialUploadState);
  const [editMaterialPickedFileName, setEditMaterialPickedFileName] = useState(
    createInitialPickedFileNameState
  );
  const [materialForm, setMaterialForm] = useState(createInitialMaterialForm);

  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionDrafts, setQuestionDrafts] = useState([createEmptyQuestionDraft()]);
  const [questionImageFiles, setQuestionImageFiles] = useState<(File | null)[]>([null]);
  const [currentQuestionImagePreview, setCurrentQuestionImagePreview] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState(() => createInitialQuizForm(DEFAULT_QUIZ_TYPE_CODE));
  const [quizTypes, setQuizTypes] = useState<AdminQuizType[]>([]);
  const [quizCategoriesAdmin, setQuizCategoriesAdmin] = useState<AdminQuizCategory[]>([]);
  const [quizTopicGroupsAdmin, setQuizTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [newQuizTopicGroup, setNewQuizTopicGroup] = useState(createInitialQuizTopicGroupForm);
  const [editingQuizTopicGroupId, setEditingQuizTopicGroupId] = useState<number | null>(null);
  const [editQuizTopicGroupForm, setEditQuizTopicGroupForm] = useState(
    createInitialEditQuizTopicGroupForm
  );
  const [newQuizType, setNewQuizType] = useState(createInitialQuizTypeForm);
  const [editingQuizTypeId, setEditingQuizTypeId] = useState<number | null>(null);
  const [editQuizTypeValue, setEditQuizTypeValue] = useState(createInitialEditQuizTypeForm);
  const [newQuizCategory, setNewQuizCategory] = useState(createInitialQuizCategoryForm);
  const [editingQuizCategoryId, setEditingQuizCategoryId] = useState<number | null>(null);
  const [editQuizCategoryForm, setEditQuizCategoryForm] = useState(createInitialEditQuizCategoryForm);
  const [materialSubjectFilterGroupId, setMaterialSubjectFilterGroupId] = useState<string>('all');
  const [materialCreateFilterGroupId, setMaterialCreateFilterGroupId] = useState<string>('all');
  const [materialListFilterGroupId, setMaterialListFilterGroupId] = useState<string>('all');
  const [materialTopicGroupSearch, setMaterialTopicGroupSearch] = useState('');
  const [materialSubjectSearch, setMaterialSubjectSearch] = useState('');
  const [quizCategoryFilterGroupId, setQuizCategoryFilterGroupId] = useState<string>('all');
  const [quizListFilterGroupId, setQuizListFilterGroupId] = useState<string>('all');
  const [quizListFilterCategoryId, setQuizListFilterCategoryId] = useState<string>('all');
  const [quizTopicGroupSearch, setQuizTopicGroupSearch] = useState('');
  const [quizCategorySearch, setQuizCategorySearch] = useState('');
  const [adminQuizzes, setAdminQuizzes] = useState<any[]>([]);
  const [selectedQuizTypeFilter, setSelectedQuizTypeFilter] = useState<string>('all');
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editQuizForm, setEditQuizForm] = useState(() =>
    createInitialEditQuizForm(DEFAULT_QUIZ_TYPE_CODE)
  );
  const [editQuizQuestions, setEditQuizQuestions] = useState<any[]>([]);
  const [editQuizQuestionImageFiles, setEditQuizQuestionImageFiles] = useState<(File | null)[]>([]);
  const [editQuizModalStep, setEditQuizModalStep] = useState<'meta' | 'questions'>('meta');
  const [currentEditQuestionIndex, setCurrentEditQuestionIndex] = useState(0);
  const [currentEditQuestionImagePreview, setCurrentEditQuestionImagePreview] = useState('');
  const [loadingEditQuizDetail, setLoadingEditQuizDetail] = useState(false);
  const [savingEditQuizDetail, setSavingEditQuizDetail] = useState(false);

  const currentQuestionDraft = questionDrafts[currentQuestionIndex] || createEmptyQuestionDraft();
  const currentQuestionImageFile = questionImageFiles[currentQuestionIndex] || null;
  const currentEditQuestion = editQuizQuestions[currentEditQuestionIndex] || null;
  const currentEditQuestionImageFile = editQuizQuestionImageFiles[currentEditQuestionIndex] || null;

  useEffect(() => {
    if (!currentQuestionImageFile) {
      setCurrentQuestionImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(currentQuestionImageFile);
    setCurrentQuestionImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [currentQuestionImageFile]);

  useEffect(() => {
    setCurrentEditQuestionIndex((prev) => {
      if (!editQuizQuestions.length) return 0;
      return Math.min(prev, editQuizQuestions.length - 1);
    });
  }, [editQuizQuestions.length]);

  useEffect(() => {
    if (!currentEditQuestionImageFile) {
      setCurrentEditQuestionImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(currentEditQuestionImageFile);
    setCurrentEditQuestionImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [currentEditQuestionImageFile]);

  const activeQuizTypes = useMemo(() => quizTypes.filter((item) => item.is_active), [quizTypes]);

  function getQuizTypeLabel(typeItem: AdminQuizType) {
    return getQuizTypeLabelHelper(typeItem, lang);
  }

  function getQuizTopicGroupLabel(group: AdminTopicGroup) {
    return lang === 'es' ? group.name_es : group.name_vi;
  }

  function getQuizTypeFilterKey(item: any) {
    return getQuizTypeFilterKeyHelper(item, quizTypes);
  }

  function getQuizTypeDisplayName(item: any) {
    return getQuizTypeDisplayNameHelper(item, lang, quizTypes);
  }

  function getQuizDisplayTitle(item: any) {
    return getQuizDisplayTitleHelper(item, lang);
  }

  function getQuizDisplayDescription(item: any) {
    return getQuizDisplayDescriptionHelper(item, lang);
  }

  function formatDateTime(value: unknown) {
    return formatDateTimeHelper(value, lang === 'vi' ? 'vi-VN' : 'es-ES');
  }

  function ensureQuizTypeSelected() {
    if (!activeQuizTypes.length) return;
    const hasQuizFormType = activeQuizTypes.some((item) => item.code === quizForm.quiz_type);
    if (!hasQuizFormType) {
      setQuizForm((prev) => ({ ...prev, quiz_type: activeQuizTypes[0].code }));
    }
    const hasEditQuizType = activeQuizTypes.some((item) => item.code === editQuizForm.quiz_type);
    if (!hasEditQuizType) {
      setEditQuizForm((prev) => ({ ...prev, quiz_type: activeQuizTypes[0].code }));
    }
  }

  const isAdmin = useMemo(() => auth?.user?.role === 'admin', [auth]);
  const selectedSubject = useMemo(
    () => subjects.find((item) => item.id === selectedSubjectId) || null,
    [subjects, selectedSubjectId]
  );
  const materialTopicGroups = useMemo(() => {
    return mapTopicGroupsForLanguage(materialTopicGroupsAdmin, lang);
  }, [materialTopicGroupsAdmin, lang]);
  const filteredAdminSubjectsByGroup = useMemo(() => {
    return filterByGroupId(adminSubjects, materialSubjectFilterGroupId, 'material_topic_group_id');
  }, [adminSubjects, materialSubjectFilterGroupId]);
  const filteredMaterialTopicGroups = useMemo(() => {
    return searchByKeyword(materialTopicGroupsAdmin, materialTopicGroupSearch, (item) => [
      item.code,
      item.name_vi,
      item.name_es,
      item.description_vi,
      item.description_es,
    ]);
  }, [materialTopicGroupsAdmin, materialTopicGroupSearch]);
  const filteredAdminSubjects = useMemo(() => {
    return searchByKeyword(filteredAdminSubjectsByGroup, materialSubjectSearch, (item) => [
      item.code,
      item.name_vi,
      item.name_es,
      item.description_vi,
      item.description_es,
      item.material_topic_group_name_vi,
      item.material_topic_group_name_es,
    ]);
  }, [filteredAdminSubjectsByGroup, materialSubjectSearch]);
  const createSubjectsByGroup = useMemo(() => {
    return filterByGroupId(subjects as any[], materialCreateFilterGroupId, 'material_topic_group_id');
  }, [subjects, materialCreateFilterGroupId]);
  const listSubjectsByGroup = useMemo(() => {
    return filterByGroupId(subjects as any[], materialListFilterGroupId, 'material_topic_group_id');
  }, [subjects, materialListFilterGroupId]);
  const filteredQuizCategoriesByGroup = useMemo(() => {
    return filterByGroupId(quizCategoriesAdmin, quizCategoryFilterGroupId, 'quiz_topic_group_id');
  }, [quizCategoriesAdmin, quizCategoryFilterGroupId]);
  const filteredQuizTopicGroups = useMemo(() => {
    return searchByKeyword(quizTopicGroupsAdmin, quizTopicGroupSearch, (item) => [
      item.code,
      item.name_vi,
      item.name_es,
      item.description_vi,
      item.description_es,
    ]);
  }, [quizTopicGroupsAdmin, quizTopicGroupSearch]);
  const filteredQuizCategories = useMemo(() => {
    return searchByKeyword(filteredQuizCategoriesByGroup, quizCategorySearch, (item) => [
      item.name_vi,
      item.name_es,
      item.description_vi,
      item.description_es,
    ]);
  }, [filteredQuizCategoriesByGroup, quizCategorySearch]);
  const listQuizCategoriesByGroup = useMemo(() => {
    return filterByGroupId(quizCategoriesAdmin, quizListFilterGroupId, 'quiz_topic_group_id');
  }, [quizCategoriesAdmin, quizListFilterGroupId]);
  const createQuizCategories = useMemo(() => {
    return filterByGroupId(
      quizCategoriesAdmin,
      String(quizForm.quiz_topic_group_id || ''),
      'quiz_topic_group_id'
    );
  }, [quizCategoriesAdmin, quizForm.quiz_topic_group_id]);
  const editQuizCategories = useMemo(() => {
    return filterByGroupId(
      quizCategoriesAdmin,
      String(editQuizForm.quiz_topic_group_id || ''),
      'quiz_topic_group_id'
    );
  }, [quizCategoriesAdmin, editQuizForm.quiz_topic_group_id]);
  const {
    adminUserQuickStats,
    filteredUsers,
    adminUsersTotalPages,
    adminUsersPage,
    paginatedUsers,
  } = useAdminUsers({
    users,
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userRoleFilter,
    userStatusFilter,
    parseDateSafe,
    adminUsersListPage,
    setAdminUsersListPage,
    pageSize: ADMIN_LIST_PAGE_SIZE,
  });

  const { filteredMaterials, adminMaterialsTotalPages, adminMaterialsPage, paginatedMaterials } =
    useAdminMaterials({
      materials,
      materialSearch,
      selectedSubjectId,
      adminMaterialsListPage,
      setAdminMaterialsListPage,
      pageSize: ADMIN_LIST_PAGE_SIZE,
    });

  const {
    filteredAdminQuizzes,
    adminQuizzesTotalPages,
    adminQuizzesPage,
    paginatedAdminQuizzes,
  } = useAdminQuizzes({
    adminQuizzes,
    selectedQuizTypeFilter,
    quizListFilterGroupId,
    quizListFilterCategoryId,
    quizSearch,
    getQuizTypeFilterKey,
    getQuizTypeDisplayName,
    adminQuizzesListPage,
    setAdminQuizzesListPage,
    pageSize: ADMIN_LIST_PAGE_SIZE,
  });

  useEffect(() => {
    const syncAuth = () => {
      setAuth(getStoredAuth());
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  function showError(message: string) {
    showErrorNotice(setNotice, message);
  }

  function showSuccess(viText: string, esText: string) {
    showSuccessNotice(setNotice, lang, viText, esText);
  }

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/quizzes');
    }
  }, [auth, isAdmin, navigate]);

  useEffect(() => {
    if (!auth?.token || !isAdmin) return;
    loadAll();
  }, [auth?.token, isAdmin, lang]);

  useEffect(() => {
    ensureQuizTypeSelected();
  }, [activeQuizTypes]);

  useEffect(() => {
    if (!auth?.token || !selectedSubjectId || !isAdmin) return;
    loadMaterials(selectedSubjectId);
  }, [selectedSubjectId, lang, auth?.token, isAdmin]);

  async function loadAll() {
    try {
      const [
        subjectRows,
        userRows,
        quizRows,
        adminSubjectRows,
        adminQuizTypesRows,
        adminQuizCategoriesRows,
        materialTopicGroupRows,
        quizTopicGroupRows,
      ] =
        await Promise.all([
          getSubjects(lang),
          getAdminUsers(),
          getAdminQuizzes(),
          getAdminSubjects(),
          getAdminQuizTypes(),
          getAdminQuizCategories(),
          getAdminMaterialTopicGroups(),
          getAdminQuizTopicGroups(),
        ]);
      setSubjects(subjectRows);
      setUsers(userRows);
      setAdminQuizzes(quizRows);
      setAdminSubjects(adminSubjectRows);
      setQuizTypes(adminQuizTypesRows);
      setQuizCategoriesAdmin(adminQuizCategoriesRows);
      setMaterialTopicGroupsAdmin(materialTopicGroupRows);
      setQuizTopicGroupsAdmin(quizTopicGroupRows);
      if (materialTopicGroupRows.length > 0) {
        const firstGroupId = Number(materialTopicGroupRows[0].id);
        setSubjectForm((prev) => ({
          ...prev,
          material_topic_group_id: prev.material_topic_group_id || firstGroupId,
        }));
      }
      if (quizTopicGroupRows.length > 0) {
        const firstQuizGroupId = Number(quizTopicGroupRows[0].id);
        setNewQuizCategory((prev) => ({
          ...prev,
          quiz_topic_group_id: prev.quiz_topic_group_id || String(firstQuizGroupId),
        }));
      }
      if (!selectedSubjectId && subjectRows.length) {
        setSelectedSubjectId(subjectRows[0].id);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error loading data');
    }
  }

  async function loadMaterials(subjectId: number) {
    try {
      const rows = await getMaterialsBySubject(subjectId, lang);
      setMaterials(rows);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error loading materials');
    }
  }

  function onStartEditUser(item: any) {
    setEditingUserId(item.id);
    setEditUserForm({
      username: item.username || '',
      email: item.email || '',
      full_name: item.full_name || '',
      role: item.role || 'student',
      is_active: Boolean(item.is_active),
      password: '',
    });
  }

  function onCancelEditUser() {
    setEditingUserId(null);
    setEditUserForm({
      username: '',
      email: '',
      full_name: '',
      role: 'student',
      is_active: true,
      password: '',
    });
  }

  async function onSaveEditUser(item: any) {
    try {
      await updateAdminUser(item.id, {
        username: editUserForm.username,
        email: editUserForm.email,
        full_name: editUserForm.full_name,
        role: editUserForm.role,
        is_active: editUserForm.is_active,
        password: editUserForm.password ? editUserForm.password : undefined,
      });
      await loadAll();
      onCancelEditUser();
      showSuccess('Đã cập nhật người dùng', 'Usuario actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onToggleLockUser(item: any) {
    try {
      if (item.is_active) {
        await lockAdminUser(item.id);
      } else {
        await unlockAdminUser(item.id);
      }
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteUser(item: any) {
    if (!window.confirm(`Xóa user ${item.username}?`)) return;
    try {
      await deleteAdminUser(item.id);
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onViewUserDashboard(item: any) {
    if (viewingUserId === item.id) {
      setViewingUserId(null);
      setViewingUserDashboard(null);
      setViewingUserError('');
      return;
    }

    setViewingUserId(item.id);
    setViewingUserDashboard(null);
    setViewingUserError('');
    setViewingUserLoading(true);

    try {
      const data = await getAdminUserDashboard(item.id, lang);
      setViewingUserDashboard(data);
    } catch (error) {
      setViewingUserError(error instanceof Error ? error.message : 'Error loading dashboard');
    } finally {
      setViewingUserLoading(false);
    }
  }

  async function onCreateMaterialTopicGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!newMaterialTopicGroup.name_vi.trim() || !newMaterialTopicGroup.name_es.trim()) {
      showError(lang === 'vi' ? 'Nhập tên VI/ES' : 'Ingresa nombre VI/ES');
      return;
    }
    try {
      await createAdminMaterialTopicGroup({ ...newMaterialTopicGroup, is_active: true });
      setNewMaterialTopicGroup({
        name_vi: '',
        name_es: '',
        description_vi: '',
        description_es: '',
      });
      setMaterialTopicGroupCreateDialogOpen(false);
      await loadAll();
      showSuccess('Đã thêm lớp cha tài liệu', 'Grupo padre de material creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditMaterialTopicGroup(item: AdminTopicGroup) {
    setEditingMaterialTopicGroupId(item.id);
    setEditMaterialTopicGroupForm({
      code: item.code || '',
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
    });
  }

  async function onSaveEditMaterialTopicGroup(item: AdminTopicGroup) {
    try {
      await updateAdminMaterialTopicGroup(item.id, editMaterialTopicGroupForm);
      setEditingMaterialTopicGroupId(null);
      await loadAll();
      showSuccess('Đã cập nhật lớp cha tài liệu', 'Grupo padre de material actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteMaterialTopicGroup(item: AdminTopicGroup) {
    if (!window.confirm(`${lang === 'vi' ? 'Xóa lớp cha' : 'Eliminar grupo padre'} ${item.code}?`)) {
      return;
    }
    try {
      await deleteAdminMaterialTopicGroup(item.id);
      await loadAll();
      showSuccess('Đã xóa lớp cha tài liệu', 'Grupo padre de material eliminado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onCreateSubject(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createAdminSubject(subjectForm);
      setSubjectForm({
        material_topic_group_id: subjectForm.material_topic_group_id || 1,
        name_vi: '',
        name_es: '',
        description_vi: '',
        description_es: '',
      });
      setMaterialSubjectCreateDialogOpen(false);
      await loadAll();
      showSuccess('Đã thêm chủ đề tài liệu', 'Tema de material creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditSubject(item: AdminSubject) {
    setEditingSubjectId(item.id);
    setEditSubjectForm({
      material_topic_group_id: Number(item.material_topic_group_id || 1),
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
    });
  }

  function onCancelEditSubject() {
    setEditingSubjectId(null);
    setEditSubjectForm({
      material_topic_group_id: 1,
      name_vi: '',
      name_es: '',
      description_vi: '',
      description_es: '',
    });
  }

  async function onSaveEditSubject(item: AdminSubject) {
    try {
      await updateAdminSubject(item.id, editSubjectForm);
      await loadAll();
      onCancelEditSubject();
      showSuccess('Đã cập nhật chủ đề tài liệu', 'Tema de material actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteSubject(item: AdminSubject) {
    if (!window.confirm(`Xóa chủ đề ${item.code}?`)) return;
    try {
      await deleteAdminSubject(item.id);
      await loadAll();
      showSuccess('Đã xóa chủ đề tài liệu', 'Tema de material eliminado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onCreateBilingualMaterial(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSubjectId) return;
    if (!materialCreateStaged.vi || !materialCreateStaged.es) {
      showError(
        lang === 'vi'
          ? 'Cần chọn và tải lên đủ file VI và ES (số trang PDF lấy tự động từ file)'
          : 'Debes subir ambos archivos VI y ES (páginas PDF automáticas)'
      );
      return;
    }
    try {
      const sv = materialCreateStaged.vi;
      const se = materialCreateStaged.es;
      await createBilingualMaterial(
        selectedSubjectId,
        {
          ...materialForm,
          file_path_vi: sv.path,
          file_size_mb_vi: sv.sizeMb,
          page_count_vi: sv.pageCount,
          file_path_es: se.path,
          file_size_mb_es: se.sizeMb,
          page_count_es: se.pageCount,
        }
      );
      setMaterialForm({ title_vi: '', description_vi: '', title_es: '', description_es: '' });
      setMaterialCreateStaged({ vi: null, es: null });
      setMaterialCreateFileKey((k) => k + 1);
      await loadMaterials(selectedSubjectId);
      showSuccess('Đã thêm tài liệu song ngữ', 'Material bilingüe agregado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditMaterial(item: any) {
    setEditingMaterialId(item.id);
    setEditMaterialUploading({ vi: false, es: false });
    setEditMaterialPickedFileName({
      vi: fileNameFromStoredPath(String(item.file_path_vi || '')),
      es: fileNameFromStoredPath(String(item.file_path_es || '')),
    });
    setEditMaterialForm({
      subject_id: String(item.subject_id || selectedSubjectId || ''),
      title_vi: item.title_vi || '',
      title_es: item.title_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      file_path_vi: item.file_path_vi || '',
      file_path_es: item.file_path_es || '',
      file_size_mb_vi: item.file_size_mb_vi == null ? '' : String(item.file_size_mb_vi),
      file_size_mb_es: item.file_size_mb_es == null ? '' : String(item.file_size_mb_es),
      page_count_vi: item.page_count_vi == null ? '' : String(item.page_count_vi),
      page_count_es: item.page_count_es == null ? '' : String(item.page_count_es),
    });
  }

  function onCancelEditMaterial() {
    setEditingMaterialId(null);
    setEditMaterialUploading({ vi: false, es: false });
    setEditMaterialPickedFileName({ vi: '', es: '' });
    setEditMaterialForm({
      subject_id: '',
      title_vi: '',
      title_es: '',
      description_vi: '',
      description_es: '',
      file_path_vi: '',
      file_path_es: '',
      file_size_mb_vi: '',
      file_size_mb_es: '',
      page_count_vi: '',
      page_count_es: '',
    });
  }

  async function onSaveEditMaterial(item: any) {
    try {
      const subjectId = Number(editMaterialForm.subject_id);
      if (!Number.isFinite(subjectId) || subjectId <= 0) {
        showError(lang === 'vi' ? 'Vui lòng chọn chủ đề tài liệu' : 'Debes seleccionar tema');
        return;
      }
      const fileSizeVi = editMaterialForm.file_size_mb_vi
        ? Number(editMaterialForm.file_size_mb_vi)
        : null;
      const fileSizeEs = editMaterialForm.file_size_mb_es
        ? Number(editMaterialForm.file_size_mb_es)
        : null;

      await updateAdminMaterial(item.id, {
        subject_id: subjectId,
        title_vi: editMaterialForm.title_vi,
        title_es: editMaterialForm.title_es,
        description_vi: editMaterialForm.description_vi,
        description_es: editMaterialForm.description_es,
        file_path_vi: editMaterialForm.file_path_vi,
        file_path_es: editMaterialForm.file_path_es,
        file_size_mb_vi: fileSizeVi,
        file_size_mb_es: fileSizeEs,
        page_count_vi: parseMaterialPageCountFromForm(editMaterialForm.page_count_vi),
        page_count_es: parseMaterialPageCountFromForm(editMaterialForm.page_count_es),
      });
      if (selectedSubjectId !== subjectId) {
        setSelectedSubjectId(subjectId);
      } else {
        await loadMaterials(subjectId);
      }
      onCancelEditMaterial();
      showSuccess('Đã cập nhật tài liệu', 'Material actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteMaterial(item: any) {
    const materialName =
      (lang === 'vi' ? item.title_vi : item.title_es) || item.id;
    if (
      !window.confirm(
        lang === 'vi'
          ? `Xóa tài liệu ${materialName}?`
          : `¿Eliminar el material ${materialName}?`
      )
    ) {
      return;
    }
    try {
      await deleteAdminMaterial(item.id);
      await loadMaterials(selectedSubjectId!);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function updateCurrentQuestionField(field: string, value: string) {
    setQuestionDrafts((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = { ...next[currentQuestionIndex], [field]: value };
      return next;
    });
  }

  function updateCurrentQuestionImage(file: File | null) {
    setQuestionImageFiles((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = file;
      return next;
    });
  }

  function onChangeQuestionCount(rawValue: string) {
    const parsed = Number(rawValue);
    const nextCount = Number.isFinite(parsed) ? Math.max(1, Math.min(60, parsed)) : 1;
    setQuestionCount(nextCount);
    setQuestionDrafts((prev) => {
      const next = prev.slice(0, nextCount);
      while (next.length < nextCount) next.push(createEmptyQuestionDraft());
      return next;
    });
    setQuestionImageFiles((prev) => {
      const next = prev.slice(0, nextCount);
      while (next.length < nextCount) next.push(null);
      return next;
    });
    setCurrentQuestionIndex((prev) => Math.min(prev, nextCount - 1));
  }

  async function onCreateQuiz(event: React.FormEvent) {
    event.preventDefault();
    if (creatingQuiz) return;
    const source = questionDrafts.slice(0, questionCount);
    for (let index = 0; index < source.length; index++) {
      const draft = source[index];
      const miss = [
        draft.question_text_vi,
        draft.question_text_es,
        draft.answer_vi_1,
        draft.answer_vi_2,
        draft.answer_vi_3,
        draft.answer_es_1,
        draft.answer_es_2,
        draft.answer_es_3,
      ].some((value) => !String(value || '').trim());
      if (miss) {
        setCurrentQuestionIndex(index);
        showError(
          lang === 'vi'
            ? `Câu ${index + 1} chưa đủ dữ liệu`
            : `La pregunta ${index + 1} no está completa`
        );
        return;
      }
    }
    setCreatingQuiz(true);
    try {
      const questions: any[] = [];
      for (let index = 0; index < source.length; index++) {
        const draft = source[index];
        const file = questionImageFiles[index];
        let imageUrl: string | null = null;
        if (file) {
          const uploaded = await uploadQuestionImage(file);
          imageUrl = buildStoredMediaPath(uploaded) || null;
        }
        const correctIndex = Number(draft.correct_index);
        const answers = [1, 2, 3].map((answerIndex) => ({
          answer_text_vi: draft[`answer_vi_${answerIndex}` as keyof typeof draft],
          answer_text_es: draft[`answer_es_${answerIndex}` as keyof typeof draft],
          is_correct: answerIndex === correctIndex,
        }));
        questions.push({
          question_text_vi: draft.question_text_vi,
          question_text_es: draft.question_text_es,
          explanation_vi: draft.explanation_vi,
          explanation_es: draft.explanation_es,
          image_url: imageUrl,
          answers,
        });
      }
      await createManualQuiz(
        {
          ...quizForm,
          category_id: quizForm.category_id ? Number(quizForm.category_id) : null,
          duration_minutes: 0,
          passing_score: 10,
          questions,
        },
        lang
      );
      setQuizForm({
        quiz_topic_group_id: '',
        category_id: '',
        quiz_type: 'general',
        title_vi: '',
        title_es: '',
        description_vi: '',
        description_es: '',
        instructions_vi: '',
        instructions_es: '',
      });
      setQuestionCount(1);
      setCurrentQuestionIndex(0);
      setQuestionDrafts([createEmptyQuestionDraft()]);
      setQuestionImageFiles([null]);
      setQuizCreateModalStep('meta');
      setQuizCreateDialogOpen(false);
      await loadAll();
      showSuccess('Đã tạo đề thi', 'Examen creado correctamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    } finally {
      setCreatingQuiz(false);
    }
  }

  function mapEditDetailQuestions(detailQuestions: any[] = []) {
    return detailQuestions.map((question: any) => ({
      id: question.id,
      order_number: question.order_number,
      question_text_vi: question.question_text_vi || '',
      question_text_es: question.question_text_es || '',
      explanation_vi: question.explanation_vi || '',
      explanation_es: question.explanation_es || '',
      image_url: question.image_url || '',
      answers: [...(question.answers || [])]
        .sort((a: any, b: any) => Number(a.order_number) - Number(b.order_number))
        .map((answer: any) => ({
          id: answer.id,
          order_number: answer.order_number,
          answer_text_vi: answer.answer_text_vi || '',
          answer_text_es: answer.answer_text_es || '',
          is_correct: Boolean(answer.is_correct),
        })),
    }));
  }

  function updateEditQuestionField(questionIndex: number, field: string, value: string) {
    setEditQuizQuestions((prev) => {
      const next = [...prev];
      next[questionIndex] = { ...next[questionIndex], [field]: value };
      return next;
    });
  }

  function updateEditAnswerField(
    questionIndex: number,
    answerIndex: number,
    field: string,
    value: string
  ) {
    setEditQuizQuestions((prev) => {
      const next = [...prev];
      const answers = [...(next[questionIndex]?.answers || [])];
      answers[answerIndex] = { ...answers[answerIndex], [field]: value };
      next[questionIndex] = { ...next[questionIndex], answers };
      return next;
    });
  }

  function setEditCorrectAnswer(questionIndex: number, correctAnswerIndex: number) {
    setEditQuizQuestions((prev) => {
      const next = [...prev];
      const answers = [...(next[questionIndex]?.answers || [])].map((answer, index) => ({
        ...answer,
        is_correct: index === correctAnswerIndex,
      }));
      next[questionIndex] = { ...next[questionIndex], answers };
      return next;
    });
  }

  function updateEditQuestionImage(questionIndex: number, file: File | null) {
    setEditQuizQuestionImageFiles((prev) => {
      const next = [...prev];
      next[questionIndex] = file;
      return next;
    });
  }

  function onAddEditQuestion() {
    setEditQuizQuestions((prev) => {
      const next = [...prev, createEmptyEditQuestionDraft()];
      setCurrentEditQuestionIndex(next.length - 1);
      return next;
    });
    setEditQuizQuestionImageFiles((prev) => [...prev, null]);
  }

  async function onStartEditQuiz(item: any) {
    const initialCategoryId = item.category_id ? String(item.category_id) : '';
    const initialCategory = quizCategoriesAdmin.find((c) => String(c.id) === initialCategoryId);
    setEditingQuizId(item.id);
    setEditQuizModalStep('meta');
    setEditQuizForm({
      quiz_topic_group_id: initialCategory?.quiz_topic_group_id
        ? String(initialCategory.quiz_topic_group_id)
        : '',
      category_id: initialCategoryId,
      quiz_type: item.quiz_type || 'general',
      title_vi: item.title_vi || '',
      title_es: item.title_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      instructions_vi: item.instructions_vi || '',
      instructions_es: item.instructions_es || '',
      is_active: Boolean(item.is_active),
    });
    setLoadingEditQuizDetail(true);
    setEditQuizQuestions([]);
    setEditQuizQuestionImageFiles([]);
    setCurrentEditQuestionIndex(0);

    try {
      const detail = await getAdminQuizDetail(item.id);
      setEditQuizForm({
        quiz_topic_group_id: detail.category_id
          ? String(
              quizCategoriesAdmin.find((c) => Number(c.id) === Number(detail.category_id))
                ?.quiz_topic_group_id || ''
            )
          : '',
        category_id: detail.category_id ? String(detail.category_id) : '',
        quiz_type: String(detail.quiz_type || item.quiz_type || 'general'),
        title_vi: detail.title_vi || '',
        title_es: detail.title_es || '',
        description_vi: detail.description_vi || '',
        description_es: detail.description_es || '',
        instructions_vi: detail.instructions_vi || '',
        instructions_es: detail.instructions_es || '',
        is_active: Boolean(detail.is_active),
      });
      const mappedQuestions = mapEditDetailQuestions(detail.questions || []);
      setEditQuizQuestions(mappedQuestions);
      setEditQuizQuestionImageFiles(Array(mappedQuestions.length).fill(null));
      setCurrentEditQuestionIndex(0);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    } finally {
      setLoadingEditQuizDetail(false);
    }
  }

  function onCancelEditQuiz() {
    setEditingQuizId(null);
    setEditQuizModalStep('meta');
    setEditQuizForm({
      quiz_topic_group_id: '',
      category_id: '',
      quiz_type: 'general',
      title_vi: '',
      title_es: '',
      description_vi: '',
      description_es: '',
      instructions_vi: '',
      instructions_es: '',
      is_active: true,
    });
    setEditQuizQuestions([]);
    setEditQuizQuestionImageFiles([]);
    setCurrentEditQuestionIndex(0);
    setLoadingEditQuizDetail(false);
    setSavingEditQuizDetail(false);
  }

  async function onSaveEditQuiz(item: any) {
    if (savingEditQuizDetail) return;

    try {
      setSavingEditQuizDetail(true);

      if (!editQuizQuestions.length) {
        await updateAdminQuiz(item.id, {
          ...item,
          quiz_type: editQuizForm.quiz_type,
          title_vi: editQuizForm.title_vi,
          title_es: editQuizForm.title_es,
          description_vi: editQuizForm.description_vi,
          description_es: editQuizForm.description_es,
          instructions_vi: editQuizForm.instructions_vi,
          instructions_es: editQuizForm.instructions_es,
          passing_score: 10,
          is_active: editQuizForm.is_active,
        });
        await loadAll();
        onCancelEditQuiz();
        showSuccess('Đã cập nhật đề thi', 'Examen actualizado');
        return;
      }

      for (let questionIndex = 0; questionIndex < editQuizQuestions.length; questionIndex += 1) {
        const question = editQuizQuestions[questionIndex];
        if (!String(question.question_text_vi || '').trim() || !String(question.question_text_es || '').trim()) {
          showError(
            lang === 'vi'
              ? `Câu ${questionIndex + 1} thiếu nội dung`
              : `La pregunta ${questionIndex + 1} no está completa`
          );
          return;
        }

        const answers = question.answers || [];
        if (answers.length !== 3) {
          showError(
            lang === 'vi'
              ? `Câu ${questionIndex + 1} phải có đúng 3 trả lời`
              : `La pregunta ${questionIndex + 1} debe tener 3 respuestas`
          );
          return;
        }

        const hasMissingAnswer = answers.some(
          (answer: any) =>
            !String(answer.answer_text_vi || '').trim() || !String(answer.answer_text_es || '').trim()
        );
        if (hasMissingAnswer) {
          showError(
            lang === 'vi'
              ? `Câu ${questionIndex + 1} thiếu trả lời`
              : `Faltan respuestas en la pregunta ${questionIndex + 1}`
          );
          return;
        }

        const correctCount = answers.filter((answer: any) => answer.is_correct).length;
        if (correctCount !== 1) {
          showError(
            lang === 'vi'
              ? `Câu ${questionIndex + 1} phải có đúng 1 trả lời đúng`
              : `La pregunta ${questionIndex + 1} debe tener 1 respuesta correcta`
          );
          return;
        }
      }

      const preparedQuestions: any[] = [];
      for (let questionIndex = 0; questionIndex < editQuizQuestions.length; questionIndex += 1) {
        const question = editQuizQuestions[questionIndex];
        const imageFile = editQuizQuestionImageFiles[questionIndex] || null;
        let imageUrl = question.image_url || null;

        if (imageFile) {
          const uploaded = await uploadQuestionImage(imageFile);
          imageUrl = buildStoredMediaPath(uploaded) || null;
        }

        const preparedQuestion: any = {
          question_text_vi: question.question_text_vi,
          question_text_es: question.question_text_es,
          explanation_vi: question.explanation_vi || null,
          explanation_es: question.explanation_es || null,
          image_url: imageUrl || null,
          answers: (question.answers || []).map((answer: any) => {
            const preparedAnswer: any = {
              answer_text_vi: answer.answer_text_vi,
              answer_text_es: answer.answer_text_es,
              is_correct: Boolean(answer.is_correct),
            };

            if (Number.isInteger(Number(answer.id)) && Number(answer.id) > 0) {
              preparedAnswer.id = Number(answer.id);
            }

            return preparedAnswer;
          }),
        };

        if (Number.isInteger(Number(question.id)) && Number(question.id) > 0) {
          preparedQuestion.id = Number(question.id);
        }

        preparedQuestions.push(preparedQuestion);
      }

      await updateAdminQuizDetail(item.id, {
        category_id: editQuizForm.category_id ? Number(editQuizForm.category_id) : null,
        quiz_type: editQuizForm.quiz_type,
        title_vi: editQuizForm.title_vi,
        title_es: editQuizForm.title_es,
        description_vi: editQuizForm.description_vi || null,
        description_es: editQuizForm.description_es || null,
        instructions_vi: editQuizForm.instructions_vi || null,
        instructions_es: editQuizForm.instructions_es || null,
        passing_score: 10,
        is_active: editQuizForm.is_active,
        questions: preparedQuestions,
      });

      await loadAll();
      onCancelEditQuiz();
      showSuccess('Đã cập nhật đề thi', 'Examen actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    } finally {
      setSavingEditQuizDetail(false);
    }
  }

  async function onToggleQuiz(item: any) {
    try {
      await updateAdminQuiz(item.id, {
        ...item,
        is_active: !item.is_active,
      });
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteQuiz(item: any) {
    if (!window.confirm(`Xóa đề ${item.code}?`)) return;
    try {
      await deleteAdminQuiz(item.id);
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onCreateQuizTopicGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!newQuizTopicGroup.name_vi.trim() || !newQuizTopicGroup.name_es.trim()) {
      showError(lang === 'vi' ? 'Nhập tên VI/ES' : 'Ingresa nombre VI/ES');
      return;
    }
    try {
      await createAdminQuizTopicGroup({ ...newQuizTopicGroup, is_active: true });
      setNewQuizTopicGroup({
        name_vi: '',
        name_es: '',
        description_vi: '',
        description_es: '',
      });
      setQuizTopicGroupCreateDialogOpen(false);
      await loadAll();
      showSuccess('Đã thêm lớp cha bài thi', 'Grupo padre de examen creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditQuizTopicGroup(item: AdminTopicGroup) {
    setEditingQuizTopicGroupId(item.id);
    setEditQuizTopicGroupForm({
      code: item.code || '',
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
    });
  }

  async function onSaveEditQuizTopicGroup(item: AdminTopicGroup) {
    try {
      await updateAdminQuizTopicGroup(item.id, editQuizTopicGroupForm);
      setEditingQuizTopicGroupId(null);
      await loadAll();
      showSuccess('Đã cập nhật lớp cha bài thi', 'Grupo padre de examen actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteQuizTopicGroup(item: AdminTopicGroup) {
    if (!window.confirm(`${lang === 'vi' ? 'Xóa lớp cha' : 'Eliminar grupo padre'} ${item.code}?`)) return;
    try {
      await deleteAdminQuizTopicGroup(item.id);
      await loadAll();
      showSuccess('Đã xóa lớp cha bài thi', 'Grupo padre de examen eliminado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onCreateQuizType(event: React.FormEvent) {
    event.preventDefault();
    const topicGroupId = Number(newQuizType.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showError(lang === 'vi' ? 'Can chon loai chu de' : 'Debes seleccionar grupo de tema');
      return;
    }
    if (!newQuizType.name_vi.trim() || !newQuizType.name_es.trim()) {
      showError(lang === 'vi' ? 'Can nhap ten VI va ES' : 'Debes ingresar nombre VI y ES');
      return;
    }

    try {
      await createAdminQuizType({
        quiz_topic_group_id: topicGroupId,
        name_vi: newQuizType.name_vi,
        name_es: newQuizType.name_es,
        description_vi: newQuizType.description_vi,
        description_es: newQuizType.description_es,
        is_active: true,
      });
      setNewQuizType({
        quiz_topic_group_id: '',
        name_vi: '',
        name_es: '',
        description_vi: '',
        description_es: '',
      });
      await loadAll();
      showSuccess('Da them loai de', 'Tipo creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditQuizType(item: AdminQuizType) {
    setEditingQuizTypeId(item.id);
    setEditQuizTypeValue({
      quiz_topic_group_id: item.quiz_topic_group_id ? String(item.quiz_topic_group_id) : '',
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
    });
  }

  async function onSaveEditQuizType(typeId: number) {
    const topicGroupId = Number(editQuizTypeValue.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showError(lang === 'vi' ? 'Can chon loai chu de' : 'Debes seleccionar grupo de tema');
      return;
    }
    if (!editQuizTypeValue.name_vi.trim() || !editQuizTypeValue.name_es.trim()) {
      showError(lang === 'vi' ? 'Can nhap ten VI va ES' : 'Debes ingresar nombre VI y ES');
      return;
    }

    try {
      await updateAdminQuizType(typeId, {
        quiz_topic_group_id: topicGroupId,
        name_vi: editQuizTypeValue.name_vi,
        name_es: editQuizTypeValue.name_es,
        description_vi: editQuizTypeValue.description_vi,
        description_es: editQuizTypeValue.description_es,
        is_active: editQuizTypeValue.is_active,
      });
      setEditingQuizTypeId(null);
      setEditQuizTypeValue({
        quiz_topic_group_id: '',
        name_vi: '',
        name_es: '',
        description_vi: '',
        description_es: '',
        is_active: true,
      });
      await loadAll();
      showSuccess('Da cap nhat loai de', 'Tipo actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteQuizType(item: AdminQuizType) {
    if (!window.confirm(`${lang === 'vi' ? 'Xoa loai de' : 'Eliminar tipo'} ${item.code}?`)) return;
    try {
      await deleteAdminQuizType(item.id);
      await loadAll();
      if (quizForm.quiz_type === item.code) {
        setQuizForm((prev) => ({ ...prev, quiz_type: DEFAULT_QUIZ_TYPE_CODE }));
      }
      if (editQuizForm.quiz_type === item.code) {
        setEditQuizForm((prev) => ({ ...prev, quiz_type: DEFAULT_QUIZ_TYPE_CODE }));
      }
      showSuccess('Da xoa loai de', 'Tipo eliminado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onCreateQuizCategory(event: React.FormEvent) {
    event.preventDefault();
    const topicGroupId = Number(newQuizCategory.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showError(lang === 'vi' ? 'Can chon loai chu de' : 'Debes seleccionar grupo de tema');
      return;
    }
    if (!newQuizCategory.name_vi.trim() || !newQuizCategory.name_es.trim()) {
      showError(lang === 'vi' ? 'Can nhap ten VI va ES' : 'Debes ingresar nombre VI y ES');
      return;
    }
    try {
      await createAdminQuizCategory({
        quiz_topic_group_id: topicGroupId,
        name_vi: newQuizCategory.name_vi,
        name_es: newQuizCategory.name_es,
        description_vi: newQuizCategory.description_vi,
        description_es: newQuizCategory.description_es,
        is_active: true,
      });
      setNewQuizCategory((prev) => ({
        ...prev,
        name_vi: '',
        name_es: '',
        description_vi: '',
        description_es: '',
      }));
      setQuizCategoryCreateDialogOpen(false);
      await loadAll();
      showSuccess('Da them chu de bai thi', 'Tema de examen creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditQuizCategory(item: AdminQuizCategory) {
    setEditingQuizCategoryId(item.id);
    setEditQuizCategoryForm({
      quiz_topic_group_id: item.quiz_topic_group_id ? String(item.quiz_topic_group_id) : '',
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      slug: item.slug || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
    });
  }

  async function onSaveEditQuizCategory(item: AdminQuizCategory) {
    const topicGroupId = Number(editQuizCategoryForm.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showError(lang === 'vi' ? 'Can chon loai chu de' : 'Debes seleccionar grupo de tema');
      return;
    }
    if (!editQuizCategoryForm.name_vi.trim() || !editQuizCategoryForm.name_es.trim()) {
      showError(lang === 'vi' ? 'Can nhap ten VI va ES' : 'Debes ingresar nombre VI y ES');
      return;
    }
    try {
      await updateAdminQuizCategory(item.id, {
        quiz_topic_group_id: topicGroupId,
        name_vi: editQuizCategoryForm.name_vi,
        name_es: editQuizCategoryForm.name_es,
        slug: editQuizCategoryForm.slug || undefined,
        description_vi: editQuizCategoryForm.description_vi,
        description_es: editQuizCategoryForm.description_es,
        is_active: editQuizCategoryForm.is_active,
      });
      setEditingQuizCategoryId(null);
      await loadAll();
      showSuccess('Da cap nhat chu de bai thi', 'Tema de examen actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteQuizCategory(item: AdminQuizCategory) {
    if (!window.confirm(`${lang === 'vi' ? 'Xoa chu de' : 'Eliminar tema'} ${item.name_vi}?`)) return;
    try {
      await deleteAdminQuizCategory(item.id);
      await loadAll();
      showSuccess('Da xoa chu de bai thi', 'Tema de examen eliminado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  if (!isAdmin) return null;

  const tabButtons = getAdminTabButtons(lang);
  const tabIconMap = {
    users: Users,
    materials: BookOpen,
    quizzes: FileText,
  } as const;

  return (
    <div className="app-page admin-redesign min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_10%,rgba(122,32,56,0.10),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(244,114,182,0.08),transparent_34%),linear-gradient(180deg,#fdf9fa_0%,#f8f1f4_46%,#f4edf1_100%)]">
      <style>{ADMIN_REDESIGN_CSS}</style>
      <Navbar />
      <main className="flex-1 px-0 py-0">
        <div className="w-full min-h-full p-0">
          <AdminNoticeBanner notice={notice} SuccessIcon={CheckCircle2} ErrorIcon={XCircle} />
          <AdminPageHeader lang={lang} />

          <div className="flex flex-col gap-0 sm:flex-row">
            <AdminSidebarTabs
              lang={lang}
              tabButtons={tabButtons}
              tabIconMap={tabIconMap}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Content */}
            <div
              className={
                activeTab === 'users'
                  ? 'flex-1 overflow-auto rounded-none border border-[#e3d7dc] bg-white shadow-sm'
                  : 'flex-1 overflow-auto rounded-none border border-[#e3d7dc] bg-white shadow-sm'
              }
            >
              {activeTab === 'users' && (
                <AdminUsersTab
                  lang={lang}
                  users={users}
                  filteredUsers={filteredUsers}
                  adminUserQuickStats={adminUserQuickStats}
                  userRoleFilter={userRoleFilter}
                  setUserRoleFilter={setUserRoleFilter}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                  userStatusFilter={userStatusFilter}
                  setUserStatusFilter={setUserStatusFilter}
                  userCreatedSort={userCreatedSort}
                  setUserCreatedSort={setUserCreatedSort}
                  userCreatedFrom={userCreatedFrom}
                  setUserCreatedFrom={setUserCreatedFrom}
                  userCreatedTo={userCreatedTo}
                  setUserCreatedTo={setUserCreatedTo}
                  paginatedUsers={paginatedUsers}
                  formatUserRole={formatUserRole}
                  formatDateTime={formatDateTime}
                  onViewUserDashboard={onViewUserDashboard}
                  viewingUserId={viewingUserId}
                  viewingUserLoading={viewingUserLoading}
                  viewingUserError={viewingUserError}
                  viewingUserDashboard={viewingUserDashboard}
                  editingUserId={editingUserId}
                  onStartEditUser={onStartEditUser}
                  onToggleLockUser={onToggleLockUser}
                  onDeleteUser={onDeleteUser}
                  onCancelEditUser={onCancelEditUser}
                  editUserForm={editUserForm}
                  setEditUserForm={setEditUserForm}
                  onSaveEditUser={onSaveEditUser}
                  adminUsersPage={adminUsersPage}
                  setAdminUsersListPage={setAdminUsersListPage}
                />
              )}

              {activeTab === 'materials' && (
                <AdminMaterialsSection
                  {...{
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
                  }}
                />
              )}
              {activeTab === 'quizzes' && (
                <AdminQuizzesSection
                  {...{
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
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}
