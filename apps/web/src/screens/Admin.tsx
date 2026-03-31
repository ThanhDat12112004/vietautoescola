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
  getMaterialsBySubject,
  resolveMediaUrl,
  getSubjects,
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
  uploadMaterialFile,
  uploadQuestionImage,
  type AdminQuizCategory,
  type AdminQuizType,
  type AdminSubject,
  type AdminTopicGroup,
  type DashboardResponse,
  type MaterialItem,
  type Subject,
} from '@/lib/api';
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
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function createEmptyQuestionDraft() {
  return {
    question_text_vi: '',
    question_text_es: '',
    explanation_vi: '',
    explanation_es: '',
    answer_vi_1: '',
    answer_vi_2: '',
    answer_vi_3: '',
    answer_es_1: '',
    answer_es_2: '',
    answer_es_3: '',
    correct_index: '1',
  };
}

function createEmptyEditQuestionDraft() {
  return {
    question_text_vi: '',
    question_text_es: '',
    explanation_vi: '',
    explanation_es: '',
    image_url: '',
    answers: [
      {
        order_number: 1,
        answer_text_vi: '',
        answer_text_es: '',
        is_correct: true,
      },
      {
        order_number: 2,
        answer_text_vi: '',
        answer_text_es: '',
        is_correct: false,
      },
      {
        order_number: 3,
        answer_text_vi: '',
        answer_text_es: '',
        is_correct: false,
      },
    ],
  };
}

function buildStoredMediaPath(uploaded: { key?: string; cdn_url?: string } | null | undefined) {
  if (!uploaded) return '';

  const key = String(uploaded.key || '').trim();
  if (key) {
    return `/media/static/${key}`;
  }

  const cdnUrl = String(uploaded.cdn_url || '').trim();
  if (!cdnUrl) return '';

  try {
    const parsed = new URL(cdnUrl);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return cdnUrl.startsWith('/') ? cdnUrl : `/${cdnUrl}`;
  }
}

function parseMaterialPageCountFromForm(s: string): number | null {
  if (s === '' || s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function fileNameFromStoredPath(path: string): string {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

function isPdfFile(file: File): boolean {
  const t = (file.type || '').toLowerCase();
  if (t === 'application/pdf') return true;
  return file.name.toLowerCase().endsWith('.pdf');
}

/** Hiển thị vai trò tài khoản bằng ngôn ngữ người dùng (không dùng mã tiếng Anh thuần). */
function formatUserRole(role: string, lang: 'vi' | 'es'): string {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return lang === 'vi' ? 'Quản trị viên' : 'Administración';
  if (r === 'teacher') return lang === 'vi' ? 'Giáo viên' : 'Profesor';
  if (r === 'student') return lang === 'vi' ? 'Học viên' : 'Alumno';
  return role || '—';
}

/** Số dòng tối đa mỗi trang trong các danh sách admin (tài khoản, tài liệu, đề thi). */
const ADMIN_LIST_PAGE_SIZE = 50;

function AdminActionIconButton({
  onClick,
  title,
  kind,
  icon,
  className = 'h-8 w-8 px-0',
}: {
  onClick: () => void;
  title: string;
  kind: 'edit' | 'delete';
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      title={title}
      className={`${kind === 'edit' ? 'admin-btn-edit' : 'admin-btn-delete'} ${className}`}
    >
      {icon}
    </Button>
  );
}

function AdminListPaginationControls({
  lang,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  lang: 'vi' | 'es';
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="mt-0 border-t border-[#e8dfe3] bg-white px-3 py-2">
      <p className="text-center text-xs text-[#5b5b5b]">
        {lang === 'vi'
          ? `Hiển thị ${from}–${to} trong ${total} mục`
          : `Mostrando ${from}–${to} de ${total}`}
      </p>
        <div className="mt-0 flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-[#d8ccd1] bg-white hover:bg-[#f7f7f8]"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          {lang === 'vi' ? 'Trước' : 'Anterior'}
        </Button>
        <span className="rounded-sm border border-[#d8ccd1] bg-white px-2 py-1 text-xs font-semibold tabular-nums text-[#5a1428]">
          {safePage} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-[#d8ccd1] bg-white hover:bg-[#f7f7f8]"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          {lang === 'vi' ? 'Sau' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}

const DEFAULT_QUIZ_TYPE_CODE = 'general';

export default function Admin() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [notice, setNotice] = useState({ text: '', type: 'error' });
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
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'student',
    is_active: true,
    password: '',
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [adminSubjects, setAdminSubjects] = useState<AdminSubject[]>([]);
  const [materialTopicGroupsAdmin, setMaterialTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [newMaterialTopicGroup, setNewMaterialTopicGroup] = useState({
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editingMaterialTopicGroupId, setEditingMaterialTopicGroupId] = useState<number | null>(null);
  const [editMaterialTopicGroupForm, setEditMaterialTopicGroupForm] = useState({
    code: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  });
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    material_topic_group_id: 1,
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editSubjectForm, setEditSubjectForm] = useState({
    material_topic_group_id: 1,
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState({
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
  const [materialCreateUploading, setMaterialCreateUploading] = useState({ vi: false, es: false });
  const [materialCreateFileKey, setMaterialCreateFileKey] = useState(0);
  const [materialCreateDialogOpen, setMaterialCreateDialogOpen] = useState(false);
  const [quizCreateDialogOpen, setQuizCreateDialogOpen] = useState(false);
  const [quizCreateModalStep, setQuizCreateModalStep] = useState<'meta' | 'questions'>('meta');
  const [materialTopicGroupCreateDialogOpen, setMaterialTopicGroupCreateDialogOpen] = useState(false);
  const [materialSubjectCreateDialogOpen, setMaterialSubjectCreateDialogOpen] = useState(false);
  const [quizTopicGroupCreateDialogOpen, setQuizTopicGroupCreateDialogOpen] = useState(false);
  const [quizCategoryCreateDialogOpen, setQuizCategoryCreateDialogOpen] = useState(false);
  const [editMaterialUploading, setEditMaterialUploading] = useState({ vi: false, es: false });
  const [editMaterialPickedFileName, setEditMaterialPickedFileName] = useState({
    vi: '',
    es: '',
  });
  const [materialForm, setMaterialForm] = useState({
    title_vi: '',
    description_vi: '',
    title_es: '',
    description_es: '',
  });

  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionDrafts, setQuestionDrafts] = useState([createEmptyQuestionDraft()]);
  const [questionImageFiles, setQuestionImageFiles] = useState<(File | null)[]>([null]);
  const [currentQuestionImagePreview, setCurrentQuestionImagePreview] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
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
  const [quizTypes, setQuizTypes] = useState<AdminQuizType[]>([]);
  const [quizCategoriesAdmin, setQuizCategoriesAdmin] = useState<AdminQuizCategory[]>([]);
  const [quizTopicGroupsAdmin, setQuizTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [newQuizTopicGroup, setNewQuizTopicGroup] = useState({
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editingQuizTopicGroupId, setEditingQuizTopicGroupId] = useState<number | null>(null);
  const [editQuizTopicGroupForm, setEditQuizTopicGroupForm] = useState({
    code: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  });
  const [newQuizType, setNewQuizType] = useState({
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editingQuizTypeId, setEditingQuizTypeId] = useState<number | null>(null);
  const [editQuizTypeValue, setEditQuizTypeValue] = useState({
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  });
  const [newQuizCategory, setNewQuizCategory] = useState({
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editingQuizCategoryId, setEditingQuizCategoryId] = useState<number | null>(null);
  const [editQuizCategoryForm, setEditQuizCategoryForm] = useState({
    quiz_topic_group_id: '',
    name_vi: '',
    name_es: '',
    slug: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  });
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
  const [editQuizForm, setEditQuizForm] = useState({
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
    return lang === 'es' ? typeItem.name_es : typeItem.name_vi;
  }

  function getQuizTopicGroupLabel(group: AdminTopicGroup) {
    return lang === 'es' ? group.name_es : group.name_vi;
  }

  function getQuizTypeFilterKey(item: any) {
    if (item.quiz_type_id != null) return String(item.quiz_type_id);

    const byCode = quizTypes.find((typeItem) => typeItem.code === String(item.quiz_type || ''));
    if (byCode) return String(byCode.id);

    return String(item.quiz_type || '');
  }

  function getQuizTypeDisplayName(item: any) {
    if (lang === 'es' && item.quiz_type_name_es) return item.quiz_type_name_es;
    if (lang === 'vi' && item.quiz_type_name_vi) return item.quiz_type_name_vi;

    const byId = quizTypes.find((typeItem) => String(typeItem.id) === getQuizTypeFilterKey(item));
    if (byId) return getQuizTypeLabel(byId);

    return item.quiz_type || '-';
  }

  function getQuizDisplayTitle(item: any) {
    if (lang === 'es') return item.title_es || item.title_vi || item.code || '-';
    return item.title_vi || item.title_es || item.code || '-';
  }

  function getQuizDisplayDescription(item: any) {
    if (lang === 'es') return item.description_es || item.description_vi || '-';
    return item.description_vi || item.description_es || '-';
  }

  function parseDateSafe(value: unknown) {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDateTime(value: unknown) {
    const parsed = parseDateSafe(value);
    if (!parsed) return '-';

    return parsed.toLocaleString(lang === 'vi' ? 'vi-VN' : 'es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    return materialTopicGroupsAdmin
      .map((g) => ({
        id: g.id,
        name: (lang === 'vi' ? g.name_vi : g.name_es) || `Group #${g.id}`,
      }))
      .sort((a, b) => a.id - b.id);
  }, [materialTopicGroupsAdmin, lang]);
  const filteredAdminSubjectsByGroup = useMemo(() => {
    if (materialSubjectFilterGroupId === 'all') return adminSubjects;
    const gid = Number(materialSubjectFilterGroupId);
    if (!Number.isFinite(gid) || gid <= 0) return adminSubjects;
    return adminSubjects.filter((item) => Number(item.material_topic_group_id) === gid);
  }, [adminSubjects, materialSubjectFilterGroupId]);
  const filteredMaterialTopicGroups = useMemo(() => {
    const keyword = materialTopicGroupSearch.trim().toLowerCase();
    if (!keyword) return materialTopicGroupsAdmin;
    return materialTopicGroupsAdmin.filter((item) =>
      [
        String(item.code || ''),
        String(item.name_vi || ''),
        String(item.name_es || ''),
        String(item.description_vi || ''),
        String(item.description_es || ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [materialTopicGroupsAdmin, materialTopicGroupSearch]);
  const filteredAdminSubjects = useMemo(() => {
    const keyword = materialSubjectSearch.trim().toLowerCase();
    if (!keyword) return filteredAdminSubjectsByGroup;
    return filteredAdminSubjectsByGroup.filter((item) =>
      [
        String(item.code || ''),
        String(item.name_vi || ''),
        String(item.name_es || ''),
        String(item.description_vi || ''),
        String(item.description_es || ''),
        String(item.material_topic_group_name_vi || ''),
        String(item.material_topic_group_name_es || ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [filteredAdminSubjectsByGroup, materialSubjectSearch]);
  const createSubjectsByGroup = useMemo(() => {
    if (materialCreateFilterGroupId === 'all') return subjects;
    const gid = Number(materialCreateFilterGroupId);
    if (!Number.isFinite(gid) || gid <= 0) return subjects;
    return subjects.filter((item: any) => Number(item.material_topic_group_id) === gid);
  }, [subjects, materialCreateFilterGroupId]);
  const listSubjectsByGroup = useMemo(() => {
    if (materialListFilterGroupId === 'all') return subjects;
    const gid = Number(materialListFilterGroupId);
    if (!Number.isFinite(gid) || gid <= 0) return subjects;
    return subjects.filter((item: any) => Number(item.material_topic_group_id) === gid);
  }, [subjects, materialListFilterGroupId]);
  const filteredQuizCategoriesByGroup = useMemo(() => {
    if (quizCategoryFilterGroupId === 'all') return quizCategoriesAdmin;
    const gid = Number(quizCategoryFilterGroupId);
    if (!Number.isFinite(gid) || gid <= 0) return quizCategoriesAdmin;
    return quizCategoriesAdmin.filter((item) => Number(item.quiz_topic_group_id) === gid);
  }, [quizCategoriesAdmin, quizCategoryFilterGroupId]);
  const filteredQuizTopicGroups = useMemo(() => {
    const keyword = quizTopicGroupSearch.trim().toLowerCase();
    if (!keyword) return quizTopicGroupsAdmin;
    return quizTopicGroupsAdmin.filter((item) =>
      [
        String(item.code || ''),
        String(item.name_vi || ''),
        String(item.name_es || ''),
        String(item.description_vi || ''),
        String(item.description_es || ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [quizTopicGroupsAdmin, quizTopicGroupSearch]);
  const filteredQuizCategories = useMemo(() => {
    const keyword = quizCategorySearch.trim().toLowerCase();
    if (!keyword) return filteredQuizCategoriesByGroup;
    return filteredQuizCategoriesByGroup.filter((item) =>
      [
        String(item.name_vi || ''),
        String(item.name_es || ''),
        String(item.description_vi || ''),
        String(item.description_es || ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [filteredQuizCategoriesByGroup, quizCategorySearch]);
  const listQuizCategoriesByGroup = useMemo(() => {
    if (quizListFilterGroupId === 'all') return quizCategoriesAdmin;
    const gid = Number(quizListFilterGroupId);
    if (!Number.isFinite(gid) || gid <= 0) return quizCategoriesAdmin;
    return quizCategoriesAdmin.filter((item) => Number(item.quiz_topic_group_id) === gid);
  }, [quizCategoriesAdmin, quizListFilterGroupId]);
  const createQuizCategories = useMemo(() => {
    const gid = Number(quizForm.quiz_topic_group_id);
    if (!Number.isFinite(gid) || gid <= 0) return quizCategoriesAdmin;
    return quizCategoriesAdmin.filter((item) => Number(item.quiz_topic_group_id) === gid);
  }, [quizCategoriesAdmin, quizForm.quiz_topic_group_id]);
  const editQuizCategories = useMemo(() => {
    const gid = Number(editQuizForm.quiz_topic_group_id);
    if (!Number.isFinite(gid) || gid <= 0) return quizCategoriesAdmin;
    return quizCategoriesAdmin.filter((item) => Number(item.quiz_topic_group_id) === gid);
  }, [quizCategoriesAdmin, editQuizForm.quiz_topic_group_id]);
  const filteredAdminQuizzes = useMemo(
    () => {
      const byType =
        selectedQuizTypeFilter === 'all'
          ? adminQuizzes
          : adminQuizzes.filter(
              (quizItem) => getQuizTypeFilterKey(quizItem) === selectedQuizTypeFilter
            );
      const byGroup =
        quizListFilterGroupId === 'all'
          ? byType
          : byType.filter(
              (item) => Number(item.quiz_topic_group_id) === Number(quizListFilterGroupId)
            );
      const byCategory =
        quizListFilterCategoryId === 'all'
          ? byGroup
          : byGroup.filter((item) => Number(item.category_id) === Number(quizListFilterCategoryId));

      const keyword = quizSearch.trim().toLowerCase();
      if (!keyword) return byCategory;

      return byCategory.filter((item) =>
        [
          String(item.id || ''),
          String(item.title_vi || ''),
          String(item.title_es || ''),
          String(getQuizTypeDisplayName(item) || ''),
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    },
    [
      adminQuizzes,
      selectedQuizTypeFilter,
      quizTypes,
      lang,
      quizSearch,
      quizListFilterGroupId,
      quizListFilterCategoryId,
    ]
  );

  const adminUserQuickStats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const newToday = users.filter((u) => {
      const ca = parseDateSafe(u.created_at);
      return ca != null && ca >= start && ca <= end;
    }).length;
    return { total, active, inactive: total - active, newToday };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    const fromDate = userCreatedFrom ? new Date(`${userCreatedFrom}T00:00:00`) : null;
    const toDate = userCreatedTo ? new Date(`${userCreatedTo}T23:59:59`) : null;

    const filtered = users.filter((item) => {
      const roleLower = String(item.role || '').toLowerCase();
      if (userRoleFilter !== 'all' && roleLower !== userRoleFilter) return false;

      if (userStatusFilter === 'active' && !item.is_active) return false;
      if (userStatusFilter === 'inactive' && item.is_active) return false;

      const matchesKeyword = keyword
        ? [
            String(item.username || ''),
            String(item.email || ''),
            String(item.full_name || ''),
            String(item.role || ''),
          ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        : true;

      if (!matchesKeyword) return false;

      const createdAt = parseDateSafe(item.created_at);
      if (!createdAt) return true;
      if (fromDate && createdAt < fromDate) return false;
      if (toDate && createdAt > toDate) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      const aTime = parseDateSafe(a.created_at)?.getTime() ?? 0;
      const bTime = parseDateSafe(b.created_at)?.getTime() ?? 0;
      return userCreatedSort === 'desc' ? bTime - aTime : aTime - bTime;
    });
  }, [
    users,
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userRoleFilter,
    userStatusFilter,
  ]);

  const filteredMaterials = useMemo(() => {
    const keyword = materialSearch.trim().toLowerCase();
    if (!keyword) return materials;

    return materials.filter((item) =>
      [
        String(item.title_vi || ''),
        String(item.title_es || ''),
        String(item.description_vi || ''),
        String(item.description_es || ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [materials, materialSearch]);

  useEffect(() => {
    setAdminUsersListPage(1);
  }, [
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userRoleFilter,
    userStatusFilter,
  ]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ADMIN_LIST_PAGE_SIZE));
    setAdminUsersListPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredUsers.length]);

  useEffect(() => {
    setAdminMaterialsListPage(1);
  }, [materialSearch, selectedSubjectId]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ADMIN_LIST_PAGE_SIZE));
    setAdminMaterialsListPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredMaterials.length]);

  useEffect(() => {
    setAdminQuizzesListPage(1);
  }, [quizSearch, selectedQuizTypeFilter]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredAdminQuizzes.length / ADMIN_LIST_PAGE_SIZE));
    setAdminQuizzesListPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredAdminQuizzes.length]);

  const adminUsersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / ADMIN_LIST_PAGE_SIZE));
  const adminUsersPage = Math.min(Math.max(1, adminUsersListPage), adminUsersTotalPages);
  const paginatedUsers = useMemo(() => {
    const start = (adminUsersPage - 1) * ADMIN_LIST_PAGE_SIZE;
    return filteredUsers.slice(start, start + ADMIN_LIST_PAGE_SIZE);
  }, [filteredUsers, adminUsersPage]);

  const adminMaterialsTotalPages = Math.max(
    1,
    Math.ceil(filteredMaterials.length / ADMIN_LIST_PAGE_SIZE)
  );
  const adminMaterialsPage = Math.min(
    Math.max(1, adminMaterialsListPage),
    adminMaterialsTotalPages
  );
  const paginatedMaterials = useMemo(() => {
    const start = (adminMaterialsPage - 1) * ADMIN_LIST_PAGE_SIZE;
    return filteredMaterials.slice(start, start + ADMIN_LIST_PAGE_SIZE);
  }, [filteredMaterials, adminMaterialsPage]);

  const adminQuizzesTotalPages = Math.max(
    1,
    Math.ceil(filteredAdminQuizzes.length / ADMIN_LIST_PAGE_SIZE)
  );
  const adminQuizzesPage = Math.min(
    Math.max(1, adminQuizzesListPage),
    adminQuizzesTotalPages
  );
  const paginatedAdminQuizzes = useMemo(() => {
    const start = (adminQuizzesPage - 1) * ADMIN_LIST_PAGE_SIZE;
    return filteredAdminQuizzes.slice(start, start + ADMIN_LIST_PAGE_SIZE);
  }, [filteredAdminQuizzes, adminQuizzesPage]);

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
    setNotice({ text: message, type: 'error' });
    setTimeout(() => setNotice({ text: '', type: 'error' }), 5000);
  }

  function showSuccess(viText: string, esText: string) {
    setNotice({ text: lang === 'vi' ? viText : esText, type: 'success' });
    setTimeout(() => setNotice({ text: '', type: 'error' }), 5000);
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

  const tabButtons: {
    id: 'users' | 'materials' | 'quizzes';
    label: string;
    desc: string;
    icon: typeof Users;
  }[] = [
    {
      id: 'users',
      label: lang === 'vi' ? 'Học viên & tài khoản' : 'Usuarios y cuentas',
      desc:
        lang === 'vi'
          ? 'Xem danh sách, chỉnh sửa, khóa hoặc mở đăng nhập'
          : 'Ver listado, editar datos, bloquear o activar cuentas',
      icon: Users,
    },
    {
      id: 'materials',
      label: lang === 'vi' ? 'Tài Liệu' : 'Temario',
      desc:
        lang === 'vi'
          ? 'Chủ đề, tải lên và quản lý file cho học viên'
          : 'Temas, subir archivos y gestionar el temario',
      icon: BookOpen,
    },
    {
      id: 'quizzes',
      label: lang === 'vi' ? 'Bài thi' : 'Exámenes',
      desc:
        lang === 'vi'
          ? 'Loại đề, tạo bài và chỉnh câu hỏi trắc nghiệm'
          : 'Tipos de examen, crear tests y editar preguntas',
      icon: FileText,
    },
  ];

  return (
    <div className="app-page admin-redesign min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_10%,rgba(122,32,56,0.10),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(244,114,182,0.08),transparent_34%),linear-gradient(180deg,#fdf9fa_0%,#f8f1f4_46%,#f4edf1_100%)]">
      <style>{`
        .admin-redesign {
          font-family: 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .admin-redesign input,
        .admin-redesign textarea,
        .admin-redesign select {
          border-radius: 0.6rem;
          border-color: rgba(122, 32, 56, 0.24);
          background: #ffffff;
        }

        .admin-redesign button {
          letter-spacing: 0.005em;
          transition: all 0.18s ease;
        }

        .admin-redesign button[type='submit'] {
          min-height: 2.5rem;
          padding-inline: 1rem;
          border-radius: 0.65rem;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(122, 32, 56, 0.16);
        }

        .admin-redesign .admin-row-actions button {
          opacity: 0.82;
        }
        .admin-redesign .group:hover .admin-row-actions button {
          opacity: 1;
        }

        .admin-redesign .admin-btn-edit {
          border: 1px solid #cfa6b1;
          background: #fff6f8;
          color: #5a1428;
        }
        .admin-redesign .admin-btn-edit:hover {
          background: #fdecef;
          border-color: #c392a0;
        }

        .admin-redesign .admin-btn-delete {
          border: 1px solid #ef9aa8;
          background: #fff6f7;
          color: #b42318;
        }
        .admin-redesign .admin-btn-delete:hover {
          background: #ffecee;
          border-color: #e47b8d;
          color: #9d1c12;
        }

        .admin-redesign .rounded-sm {
          border-radius: 0.5rem;
        }

        .admin-redesign .bg-white {
          background: rgba(255, 255, 255, 0.96);
        }

        .admin-redesign .shadow-sm {
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
        }

        .admin-redesign .border {
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }

        .admin-redesign .border:hover {
          border-color: rgba(122, 32, 56, 0.38);
        }

        .admin-redesign input:focus,
        .admin-redesign textarea:focus,
        .admin-redesign button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(122, 32, 56, 0.16);
        }

        .admin-surface-view {
          border: 1px solid rgba(122, 32, 56, 0.28);
          background: linear-gradient(135deg, rgba(255, 247, 250, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
          box-shadow: inset 3px 0 0 0 #7a2038;
        }
        .admin-surface-edit {
          border: 1px solid rgba(244, 114, 182, 0.4);
          background: linear-gradient(135deg, rgba(253, 242, 248, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
          box-shadow: inset 3px 0 0 0 #ec4899;
        }
      `}</style>
      <Navbar />
      <main className="flex-1 px-0 py-0">
        <div className="w-full min-h-full p-0">
          {/* Notice */}
          {notice.text && (
            <div
              className={`mb-2 p-3 border rounded ${notice.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-destructive bg-destructive/10 text-destructive'}`}
            >
              <div className="flex items-center gap-2">
                {notice.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {notice.text}
              </div>
            </div>
          )}

          <header className="mb-2 border border-[#e3d7dc] bg-white/95 shadow-sm">
            <div className="w-full px-3 py-4 sm:px-4 md:py-5">
              <div className="max-w-3xl border-l-4 border-[#7a2038]/75 pl-3 sm:pl-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                  {lang === 'vi' ? 'Quản trị' : 'Administración'}
                </p>
                <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                  {lang === 'vi' ? 'Trang quản trị' : 'Panel de administración'}
                </h1>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                  {lang === 'vi'
                    ? 'Quản lý tài khoản, tài liệu và bài thi cho học viên.'
                    : 'Gestiona cuentas, temario y exámenes para alumnos.'}
                </p>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-0 sm:flex-row">
            <aside className="rounded-none border border-[#e3d7dc] bg-white p-3 shadow-sm sm:w-64 sm:shrink-0">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#7a2038]/70">
                {lang === 'vi' ? 'Chọn nội dung cần làm' : 'Elija qué gestionar'}
              </p>
              <div className="space-y-0 overflow-hidden rounded-md border border-[#e3d7dc] divide-y divide-[#f0e8eb]">
                {tabButtons.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full rounded-none border-0 px-3 py-2.5 text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#f6dce4] text-[#6b1b31]'
                          : 'bg-white text-[#5f5f5f] hover:bg-[#f9f3f6]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-bold leading-tight">{tab.label}</span>
                      </span>
                      <span className="mt-1 block pl-6 text-[11px] font-normal leading-snug text-[#7b6d73]">
                        {tab.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Content */}
            <div
              className={
                activeTab === 'users'
                  ? 'flex-1 overflow-auto rounded-none border border-[#e3d7dc] bg-white shadow-sm'
                  : 'flex-1 overflow-auto rounded-none border border-[#e3d7dc] bg-white shadow-sm'
              }
            >
              {activeTab === 'users' && (
                <div className="space-y-2 p-3">
                  {/* Users List */}
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
                            ({adminUserQuickStats.inactive}{' '}
                            {lang === 'vi' ? 'khóa' : 'bloq.'})
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
                          {(
                            [
                              { id: 'all' as const, vi: 'Tất cả', es: 'Todas' },
                              { id: 'student' as const, vi: 'Học viên', es: 'Alumnos' },
                              { id: 'teacher' as const, vi: 'Giáo viên', es: 'Profesores' },
                              { id: 'admin' as const, vi: 'Quản trị', es: 'Admin' },
                            ] as const
                          ).map((tab) => (
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
                              placeholder={
                                lang === 'vi' ? 'Trạng thái tài khoản' : 'Estado de la cuenta'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {lang === 'vi' ? 'Mọi trạng thái' : 'Todos los estados'}
                            </SelectItem>
                            <SelectItem value="active">
                              {lang === 'vi' ? 'Đang hoạt động' : 'Activa'}
                            </SelectItem>
                            <SelectItem value="inactive">
                              {lang === 'vi' ? 'Đã khóa' : 'Bloqueada'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={userCreatedSort}
                          onValueChange={(value: 'asc' | 'desc') => setUserCreatedSort(value)}
                        >
                          <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                            <SelectValue
                              placeholder={
                                lang === 'vi' ? 'Sắp xếp theo ngày đăng ký' : 'Ordenar por fecha'
                              }
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
                            setUserSearch('');
                            setUserRoleFilter('all');
                            setUserStatusFilter('all');
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
                              {lang === 'vi' ? 'Đăng ký:' : 'Alta:'}{' '}
                              {formatDateTime(item.created_at)}
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
                              {item.is_active ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
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
                                      {viewingUserDashboard.history.slice(0, 10).map((h) => (
                                        <div
                                          key={h.id}
                                          className="grid grid-cols-1 gap-1 rounded border border-[#ecd7dd] bg-white/95 p-2 text-xs sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-2"
                                        >
                                          <span className="min-w-0 font-semibold text-[#5a1428]">
                                            {h.quiz_title}
                                          </span>
                                          <span className="text-[#5b5b5b]">
                                            <span className="font-medium text-[#7a2038]">
                                              {Number(h.percentage || 0).toFixed(1)}%
                                            </span>
                                            <span className="md:hidden"> · </span>
                                          </span>
                                          <span className="text-[#5b5b5b]">
                                            {lang === 'vi' ? 'Điểm:' : 'Nota:'}{' '}
                                            <span className="font-semibold text-[#5a1428]">
                                              {Number(h.score || 0).toFixed(1)}
                                            </span>
                                          </span>
                                          <span className="text-[#5b5b5b]">
                                            {h.correct_count}/{h.total_questions}
                                          </span>
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
                                  onValueChange={(v) =>
                                    setEditUserForm({ ...editUserForm, role: v })
                                  }
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
              )}

              {activeTab === 'materials' && (
                <div className="space-y-0">
                  <div className="sticky top-0 z-10 mb-2 flex flex-wrap gap-2 border-b border-[#e3d7dc] bg-white px-2 py-2">
                    {[
                      {
                        id: 'topic_groups',
                        label: lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema',
                      },
                      {
                        id: 'subjects',
                        label: lang === 'vi' ? 'Chủ đề' : 'Tema',
                      },
                      {
                        id: 'manage',
                        label: lang === 'vi' ? 'Tài liệu' : 'Materiales',
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() =>
                          setMaterialsSubTab(
                            tab.id as 'topic_groups' | 'subjects' | 'manage'
                          )
                        }
                        className={`px-3 py-2 rounded-md border font-semibold text-sm transition-colors ${
                          materialsSubTab === tab.id
                            ? 'border-[#7a2038] bg-[#f6dce4] text-[#6b1b31]'
                            : 'border-[#e3d7dc] bg-white text-[#5f5f5f] hover:bg-[#f9f3f6]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Subject Management */}
                  {(materialsSubTab === 'topic_groups' || materialsSubTab === 'subjects') && (
                    <div className="rounded-none border border-[#dbe3ee] bg-white p-3">
                      <div className="mb-1">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
                          {lang === 'vi'
                            ? materialsSubTab === 'topic_groups'
                              ? 'Loại chủ đề (để phân loại tài liệu)'
                              : 'Chủ đề (để phân loại tài liệu)'
                            : 'Temas (para organizar el temario)'}
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
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div className="space-y-0">
                  <div className="sticky top-0 z-10 mb-2 flex flex-wrap gap-2 border-b border-[#e3d7dc] bg-white px-2 py-2">
                    {[
                      {
                        id: 'topic_groups',
                        label: lang === 'vi' ? 'Loại chủ đề' : 'Grupo de tema',
                      },
                      {
                        id: 'types',
                        label: lang === 'vi' ? 'Chủ đề' : 'Temas',
                      },
                      {
                        id: 'manage',
                        label: lang === 'vi' ? 'Bài thi' : 'Exámenes',
                      },
                    ].map((tab) => {
                      const isActive =
                        tab.id === 'topic_groups'
                          ? quizzesSubTab === 'types' && quizzesHierarchyTab === 'topic_groups'
                          : tab.id === 'types'
                            ? quizzesSubTab === 'types' && quizzesHierarchyTab === 'types'
                            : quizzesSubTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (tab.id === 'topic_groups' || tab.id === 'types') {
                              setQuizzesSubTab('types');
                              setQuizzesHierarchyTab(tab.id as 'topic_groups' | 'types');
                              return;
                            }
                            setQuizzesSubTab(tab.id as 'manage');
                          }}
                          className={`px-3 py-2 rounded-md border font-semibold text-sm transition-colors ${
                            isActive
                              ? 'border-[#7a2038] bg-[#f6dce4] text-[#6b1b31]'
                              : 'border-[#e3d7dc] bg-white text-[#5f5f5f] hover:bg-[#f9f3f6]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {quizzesSubTab === 'types' && (
                    <div className="rounded-none border border-[#dbe3ee] bg-white p-3">
                      <div className="mb-1">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
                          {lang === 'vi'
                            ? quizzesHierarchyTab === 'topic_groups'
                              ? 'Loại chủ đề (để phân loại bài thi)'
                              : 'Chủ đề (để phân loại bài thi)'
                            : quizzesHierarchyTab === 'topic_groups'
                              ? 'Grupo de tema (para organizar exámenes)'
                              : 'Temas (para organizar exámenes)'}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}
