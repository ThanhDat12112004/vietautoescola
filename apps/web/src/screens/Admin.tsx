import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
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
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import {
  createAdminQuizType,
  createAdminSubject,
  createBilingualMaterial,
  createManualQuiz,
  deleteAdminMaterial,
  deleteAdminQuiz,
  deleteAdminQuizType,
  deleteAdminSubject,
  deleteAdminUser,
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
  updateAdminMaterial,
  updateAdminQuiz,
  updateAdminQuizDetail,
  updateAdminQuizType,
  updateAdminSubject,
  updateAdminUser,
  uploadMaterialFile,
  uploadQuestionImage,
  type AdminQuizType,
  type AdminSubject,
  type DashboardResponse,
  type MaterialItem,
  type Subject,
} from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import {
  BookOpen,
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

const DEFAULT_QUIZ_TYPE_CODE = 'general';

export default function Admin() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [notice, setNotice] = useState({ text: '', type: 'error' });
  const [activeTab, setActiveTab] = useState<'users' | 'materials' | 'quizzes'>('users');
  const [materialsSubTab, setMaterialsSubTab] = useState<'subjects' | 'create' | 'list'>(
    'subjects'
  );
  const [quizzesSubTab, setQuizzesSubTab] = useState<'types' | 'create' | 'list'>('types');
  const [auth, setAuth] = useState(() => getStoredAuth());

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userCreatedFrom, setUserCreatedFrom] = useState('');
  const [userCreatedTo, setUserCreatedTo] = useState('');
  const [userCreatedSort, setUserCreatedSort] = useState<'desc' | 'asc'>('desc');
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
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editSubjectForm, setEditSubjectForm] = useState({
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState({
    title_vi: '',
    title_es: '',
    description_vi: '',
    description_es: '',
    file_path_vi: '',
    file_path_es: '',
    file_size_mb_vi: '',
    file_size_mb_es: '',
  });
  const [materialFiles, setMaterialFiles] = useState<{ vi: File | null; es: File | null }>({
    vi: null,
    es: null,
  });
  const [editMaterialFiles, setEditMaterialFiles] = useState<{ vi: File | null; es: File | null }>({
    vi: null,
    es: null,
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
    quiz_type: 'general',
    title_vi: '',
    title_es: '',
    description_vi: '',
    description_es: '',
    instructions_vi: '',
    instructions_es: '',
  });
  const [quizTypes, setQuizTypes] = useState<AdminQuizType[]>([]);
  const [newQuizType, setNewQuizType] = useState({
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
  });
  const [editingQuizTypeId, setEditingQuizTypeId] = useState<number | null>(null);
  const [editQuizTypeValue, setEditQuizTypeValue] = useState({
    name_vi: '',
    name_es: '',
    description_vi: '',
    description_es: '',
    is_active: true,
  });
  const [adminQuizzes, setAdminQuizzes] = useState<any[]>([]);
  const [selectedQuizTypeFilter, setSelectedQuizTypeFilter] = useState<string>('all');
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editQuizForm, setEditQuizForm] = useState({
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
  const filteredAdminQuizzes = useMemo(
    () => {
      const byType =
        selectedQuizTypeFilter === 'all'
          ? adminQuizzes
          : adminQuizzes.filter(
              (quizItem) => getQuizTypeFilterKey(quizItem) === selectedQuizTypeFilter
            );

      const keyword = quizSearch.trim().toLowerCase();
      if (!keyword) return byType;

      return byType.filter((item) =>
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
    [adminQuizzes, selectedQuizTypeFilter, quizTypes, lang, quizSearch]
  );

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    const fromDate = userCreatedFrom ? new Date(`${userCreatedFrom}T00:00:00`) : null;
    const toDate = userCreatedTo ? new Date(`${userCreatedTo}T23:59:59`) : null;

    const filtered = users.filter((item) => {
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
  }, [users, userSearch, userCreatedFrom, userCreatedTo, userCreatedSort]);

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
      const [subjectRows, userRows, quizRows, adminSubjectRows, adminQuizTypesRows] =
        await Promise.all([
          getSubjects(lang),
          getAdminUsers(),
          getAdminQuizzes(),
          getAdminSubjects(),
          getAdminQuizTypes(),
        ]);
      setSubjects(subjectRows);
      setUsers(userRows);
      setAdminQuizzes(quizRows);
      setAdminSubjects(adminSubjectRows);
      setQuizTypes(adminQuizTypesRows);
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

  async function onCreateSubject(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createAdminSubject(subjectForm);
      setSubjectForm({ name_vi: '', name_es: '', description_vi: '', description_es: '' });
      await loadAll();
      showSuccess('Đã thêm chủ đề tài liệu', 'Tema de material creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditSubject(item: AdminSubject) {
    setEditingSubjectId(item.id);
    setEditSubjectForm({
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
    });
  }

  function onCancelEditSubject() {
    setEditingSubjectId(null);
    setEditSubjectForm({ name_vi: '', name_es: '', description_vi: '', description_es: '' });
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
    if (!materialFiles.vi || !materialFiles.es) {
      showError(
        lang === 'vi' ? 'Cần chọn đủ file VI và ES' : 'Debes seleccionar ambos archivos VI y ES'
      );
      return;
    }
    try {
      const uploadedVi = await uploadMaterialFile(materialFiles.vi, 'vi');
      const uploadedEs = await uploadMaterialFile(materialFiles.es, 'es');
      await createBilingualMaterial(
        selectedSubjectId,
        {
          ...materialForm,
          file_path_vi: uploadedVi.cdn_url,
          file_size_mb_vi: uploadedVi.size
            ? Number((uploadedVi.size / (1024 * 1024)).toFixed(2))
            : null,
          file_path_es: uploadedEs.cdn_url,
          file_size_mb_es: uploadedEs.size
            ? Number((uploadedEs.size / (1024 * 1024)).toFixed(2))
            : null,
        }
      );
      setMaterialForm({ title_vi: '', description_vi: '', title_es: '', description_es: '' });
      setMaterialFiles({ vi: null, es: null });
      await loadMaterials(selectedSubjectId);
      showSuccess('Đã thêm tài liệu song ngữ', 'Material bilingüe agregado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditMaterial(item: any) {
    setEditingMaterialId(item.id);
    setEditMaterialFiles({ vi: null, es: null });
    setEditMaterialForm({
      title_vi: item.title_vi || '',
      title_es: item.title_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      file_path_vi: item.file_path_vi || '',
      file_path_es: item.file_path_es || '',
      file_size_mb_vi: item.file_size_mb_vi == null ? '' : String(item.file_size_mb_vi),
      file_size_mb_es: item.file_size_mb_es == null ? '' : String(item.file_size_mb_es),
    });
  }

  function onCancelEditMaterial() {
    setEditingMaterialId(null);
    setEditMaterialFiles({ vi: null, es: null });
    setEditMaterialForm({
      title_vi: '',
      title_es: '',
      description_vi: '',
      description_es: '',
      file_path_vi: '',
      file_path_es: '',
      file_size_mb_vi: '',
      file_size_mb_es: '',
    });
  }

  async function onSaveEditMaterial(item: any) {
    try {
      let filePathVi = editMaterialForm.file_path_vi;
      let filePathEs = editMaterialForm.file_path_es;
      let fileSizeVi = editMaterialForm.file_size_mb_vi
        ? Number(editMaterialForm.file_size_mb_vi)
        : null;
      let fileSizeEs = editMaterialForm.file_size_mb_es
        ? Number(editMaterialForm.file_size_mb_es)
        : null;

      if (editMaterialFiles.vi) {
        const uploadedVi = await uploadMaterialFile(editMaterialFiles.vi, 'vi');
        filePathVi = uploadedVi.cdn_url;
        fileSizeVi = uploadedVi.size ? Number((uploadedVi.size / (1024 * 1024)).toFixed(2)) : null;
      }

      if (editMaterialFiles.es) {
        const uploadedEs = await uploadMaterialFile(editMaterialFiles.es, 'es');
        filePathEs = uploadedEs.cdn_url;
        fileSizeEs = uploadedEs.size ? Number((uploadedEs.size / (1024 * 1024)).toFixed(2)) : null;
      }

      await updateAdminMaterial(item.id, {
        title_vi: editMaterialForm.title_vi,
        title_es: editMaterialForm.title_es,
        description_vi: editMaterialForm.description_vi,
        description_es: editMaterialForm.description_es,
        file_path_vi: filePathVi,
        file_path_es: filePathEs,
        file_size_mb_vi: fileSizeVi,
        file_size_mb_es: fileSizeEs,
      });
      await loadMaterials(selectedSubjectId!);
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
        let imageUrl = null;
        if (file) {
          const uploaded = await uploadQuestionImage(file);
          imageUrl = uploaded.cdn_url || null;
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
          duration_minutes: 0,
          passing_score: 10,
          questions,
        },
        lang
      );
      setQuizForm({
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
    setEditingQuizId(item.id);
    setEditQuizForm({
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
    setEditQuizForm({
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
              ? `Câu ${questionIndex + 1} phải có đúng 3 đáp án`
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
              ? `Câu ${questionIndex + 1} thiếu đáp án`
              : `Faltan respuestas en la pregunta ${questionIndex + 1}`
          );
          return;
        }

        const correctCount = answers.filter((answer: any) => answer.is_correct).length;
        if (correctCount !== 1) {
          showError(
            lang === 'vi'
              ? `Câu ${questionIndex + 1} phải có đúng 1 đáp án đúng`
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
          imageUrl = uploaded.cdn_url || null;
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
        category_id: item.category_id || null,
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

  async function onCreateQuizType(event: React.FormEvent) {
    event.preventDefault();
    if (!newQuizType.name_vi.trim() || !newQuizType.name_es.trim()) {
      showError(lang === 'vi' ? 'Can nhap ten VI va ES' : 'Debes ingresar nombre VI y ES');
      return;
    }

    try {
      await createAdminQuizType({
        name_vi: newQuizType.name_vi,
        name_es: newQuizType.name_es,
        description_vi: newQuizType.description_vi,
        description_es: newQuizType.description_es,
        is_active: true,
      });
      setNewQuizType({ name_vi: '', name_es: '', description_vi: '', description_es: '' });
      await loadAll();
      showSuccess('Da them loai de', 'Tipo creado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditQuizType(item: AdminQuizType) {
    setEditingQuizTypeId(item.id);
    setEditQuizTypeValue({
      name_vi: item.name_vi || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
    });
  }

  async function onSaveEditQuizType(typeId: number) {
    if (!editQuizTypeValue.name_vi.trim() || !editQuizTypeValue.name_es.trim()) {
      showError(lang === 'vi' ? 'Can nhap ten VI va ES' : 'Debes ingresar nombre VI y ES');
      return;
    }

    try {
      await updateAdminQuizType(typeId, {
        name_vi: editQuizTypeValue.name_vi,
        name_es: editQuizTypeValue.name_es,
        description_vi: editQuizTypeValue.description_vi,
        description_es: editQuizTypeValue.description_es,
        is_active: editQuizTypeValue.is_active,
      });
      setEditingQuizTypeId(null);
      setEditQuizTypeValue({
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

  if (!isAdmin) return null;

  const tabButtons = [
    { id: 'users' as const, label: lang === 'vi' ? 'Người dùng' : 'Usuarios', icon: Users },
    { id: 'materials' as const, label: lang === 'vi' ? 'Tài liệu' : 'Materiales', icon: BookOpen },
    { id: 'quizzes' as const, label: lang === 'vi' ? 'Đề thi' : 'Exámenes', icon: FileText },
  ];

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_20%,rgba(255,214,224,0.45),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(255,228,171,0.45),transparent_35%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_55%,#f7eef5_100%)]">
      <Navbar />
      <main className="flex-1 px-2 md:px-4 py-3 md:py-4">
        <div className="w-full min-h-full rounded-2xl border border-[#7a2038]/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(255,247,250,0.84)_45%,rgba(255,249,235,0.74)_100%)] p-3 shadow-[0_14px_34px_rgba(95,20,40,0.12)] md:p-4">
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

          <div className="flex flex-col sm:flex-row gap-2">
            <aside className="rounded-2xl border border-[#7a2038]/18 bg-white/90 p-3 shadow-sm backdrop-blur-sm sm:w-56 sm:shrink-0">
              <div className="space-y-1">
                {tabButtons.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm border font-semibold text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]'
                          : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 overflow-auto rounded-2xl border border-[#7a2038]/18 bg-white/90 p-3 shadow-sm backdrop-blur-sm md:p-4 lg:p-5">
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Users List */}
                  <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                    <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                      {lang === 'vi' ? 'Danh sách người dùng' : 'Lista de usuarios'} (
                      {filteredUsers.length})
                    </h3>
                    <div className="mb-3">
                      <Input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder={
                          lang === 'vi'
                            ? 'Tìm theo username, email, họ tên, vai trò...'
                            : 'Buscar por usuario, email, nombre, rol...'
                        }
                        className="h-9 border-[#d2d2d2] bg-white"
                      />
                    </div>
                    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
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
                    <div className="mb-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                        onClick={() => {
                          setUserCreatedFrom('');
                          setUserCreatedTo('');
                          setUserCreatedSort('desc');
                        }}
                      >
                        {lang === 'vi' ? 'Xóa bộ lọc ngày' : 'Limpiar filtro de fecha'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {filteredUsers.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-[#d2d2d2] bg-white rounded-sm"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#5a1428]">{item.username}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded border ${item.role === 'admin' ? 'border-red-300 bg-red-50 text-red-700' : item.role === 'teacher' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-green-300 bg-green-50 text-green-700'}`}
                              >
                                {item.role}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded border ${item.is_active ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-100 text-gray-600'}`}
                              >
                                {item.is_active ? (
                                  <CheckCircle2 className="h-3 w-3 inline" />
                                ) : (
                                  <Lock className="h-3 w-3 inline" />
                                )}
                              </span>
                            </div>
                            <div className="text-xs text-[#5b5b5b] mt-1">
                              {item.email} | {item.full_name || '-'}
                            </div>
                            <div className="text-xs text-[#5b5b5b] mt-1">
                              {lang === 'vi' ? 'Ngày đăng ký' : 'Fecha de registro'}:{' '}
                              {formatDateTime(item.created_at)}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewUserDashboard(item)}
                              className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onStartEditUser(item)}
                              className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onToggleLockUser(item)}
                              className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                            >
                              {item.is_active ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteUser(item)}
                              className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {viewingUserId === item.id && (
                            <div className="w-full mt-2 border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm">
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
                                    <div className="text-xs text-[#5b5b5b] mb-1">
                                      {lang === 'vi' ? 'Lịch sử làm bài gần nhất' : 'Historial reciente'}
                                    </div>
                                    <div className="max-h-56 overflow-auto space-y-1">
                                      {viewingUserDashboard.history.slice(0, 10).map((h) => (
                                        <div
                                          key={h.id}
                                          className="text-xs border border-[#d2d2d2] bg-white rounded-sm p-2 flex flex-wrap gap-2 justify-between"
                                        >
                                          <span className="text-[#5a1428] font-semibold">{h.quiz_title}</span>
                                          <span>{Number(h.percentage || 0).toFixed(2)}%</span>
                                          <span>{Number(h.score || 0).toFixed(2)}</span>
                                          <span>
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
                            <div className="w-full mt-2 border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs text-[#5b5b5b]">Username</Label>
                                <Input
                                  value={editUserForm.username}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, username: e.target.value })
                                  }
                                  className="h-9 border-[#d2d2d2] bg-white"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-[#5b5b5b]">Email</Label>
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
                                      {lang === 'vi' ? 'Quản trị' : 'Admin'}
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
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'subjects', label: lang === 'vi' ? 'Chủ đề tài liệu' : 'Temas' },
                      { id: 'create', label: lang === 'vi' ? 'Nhập tài liệu' : 'Crear material' },
                      {
                        id: 'list',
                        label: lang === 'vi' ? 'Danh sách tài liệu' : 'Lista materiales',
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setMaterialsSubTab(tab.id as 'subjects' | 'create' | 'list')}
                        className={`px-3 py-2 rounded-sm border font-semibold text-sm transition-colors ${
                          materialsSubTab === tab.id
                            ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]'
                            : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Subject Management */}
                  {materialsSubTab === 'subjects' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                      <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                        {lang === 'vi'
                          ? 'Quản trị chủ đề tài liệu'
                          : 'Gestión de temas de materiales'}
                      </h3>
                      <form
                        onSubmit={onCreateSubject}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3"
                      >
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
                          placeholder="Nombre ES"
                          value={subjectForm.name_es}
                          onChange={(e) =>
                            setSubjectForm({ ...subjectForm, name_es: e.target.value })
                          }
                          required
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                        <Input
                          placeholder={lang === 'vi' ? 'Mô tả VI' : 'Descripción VI'}
                          value={subjectForm.description_vi}
                          onChange={(e) =>
                            setSubjectForm({ ...subjectForm, description_vi: e.target.value })
                          }
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder={lang === 'vi' ? 'Mô tả ES' : 'Descripción ES'}
                            value={subjectForm.description_es}
                            onChange={(e) =>
                              setSubjectForm({ ...subjectForm, description_es: e.target.value })
                            }
                            className="border-[#d2d2d2] bg-white h-9"
                          />
                          <Button
                            type="submit"
                            className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                          >
                            {lang === 'vi' ? 'Thêm' : 'Agregar'}
                          </Button>
                        </div>
                      </form>

                      <div className="space-y-2">
                        {adminSubjects.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 border border-[#d2d2d2] bg-white rounded-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-bold text-[#5a1428]">
                                  {item.code} - {item.name_vi}
                                </div>
                                <div className="text-xs text-[#5b5b5b]">{item.name_es}</div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onStartEditSubject(item)}
                                  className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteSubject(item)}
                                  className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            {editingSubjectId === item.id && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
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
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Material Form */}
                  {materialsSubTab === 'create' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                      <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                        {lang === 'vi' ? 'Thêm tài liệu song ngữ' : 'Agregar material bilingüe'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Chủ đề' : 'Tema'}
                          </Label>
                          <Select
                            value={String(selectedSubjectId)}
                            onValueChange={(v) => setSelectedSubjectId(Number(v))}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
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
                      </div>
                      <form
                        onSubmit={onCreateBilingualMaterial}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        <div className="border border-[#d2d2d2] bg-white p-3 rounded-sm">
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
                              <Label className="text-xs text-[#5b5b5b]">File</Label>
                              <Input
                                type="file"
                                onChange={(e) =>
                                  setMaterialFiles({
                                    ...materialFiles,
                                    vi: e.target.files?.[0] || null,
                                  })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              {materialFiles.vi && (
                                <span className="text-xs text-[#5b5b5b]">
                                  {materialFiles.vi.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="border border-[#d2d2d2] bg-white p-3 rounded-sm">
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
                              <Label className="text-xs text-[#5b5b5b]">Archivo</Label>
                              <Input
                                type="file"
                                onChange={(e) =>
                                  setMaterialFiles({
                                    ...materialFiles,
                                    es: e.target.files?.[0] || null,
                                  })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              {materialFiles.es && (
                                <span className="text-xs text-[#5b5b5b]">
                                  {materialFiles.es.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Button
                            type="submit"
                            className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                          >
                            {lang === 'vi' ? 'Thêm tài liệu' : 'Agregar material'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Materials List */}
                  {materialsSubTab === 'list' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                      <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                        {lang === 'vi' ? 'Danh sách tài liệu' : 'Lista de materiales'} (
                        {filteredMaterials.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Chủ đề tài liệu' : 'Tema de material'}
                          </Label>
                          <Select
                            value={String(selectedSubjectId)}
                            onValueChange={(v) => setSelectedSubjectId(Number(v))}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
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
                      <div className="space-y-2">
                        {filteredMaterials.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-[#d2d2d2] bg-white rounded-sm"
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
                                  href={lang === 'vi' ? item.file_path_vi : item.file_path_es}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onStartEditMaterial(item)}
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteMaterial(item)}
                                className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            {editingMaterialId === item.id && (
                              <div className="w-full mt-2 border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-2">
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
                                    {lang === 'vi' ? 'File mới (VI)' : 'Archivo nuevo (VI)'}
                                  </Label>
                                  <Input
                                    type="file"
                                    onChange={(e) =>
                                      setEditMaterialFiles({
                                        ...editMaterialFiles,
                                        vi: e.target.files?.[0] || null,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {editMaterialFiles.vi
                                      ? editMaterialFiles.vi.name
                                      : lang === 'vi'
                                        ? 'Để trống nếu giữ file hiện tại'
                                        : 'Dejar vacío para mantener archivo actual'}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'File mới (ES)' : 'Archivo nuevo (ES)'}
                                  </Label>
                                  <Input
                                    type="file"
                                    onChange={(e) =>
                                      setEditMaterialFiles({
                                        ...editMaterialFiles,
                                        es: e.target.files?.[0] || null,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                  <div className="text-xs text-[#5b5b5b] mt-1">
                                    {editMaterialFiles.es
                                      ? editMaterialFiles.es.name
                                      : lang === 'vi'
                                        ? 'Để trống nếu giữ file hiện tại'
                                        : 'Dejar vacío para mantener archivo actual'}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">URL (VI)</Label>
                                  <a
                                    href={editMaterialForm.file_path_vi}
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
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">URL (ES)</Label>
                                  <a
                                    href={editMaterialForm.file_path_es}
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
                                </div>
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    size="sm"
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
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'types', label: lang === 'vi' ? 'Loại đề' : 'Tipos' },
                      { id: 'create', label: lang === 'vi' ? 'Nhập đề' : 'Crear examen' },
                      { id: 'list', label: lang === 'vi' ? 'Danh sách đề' : 'Lista exámenes' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setQuizzesSubTab(tab.id as 'types' | 'create' | 'list')}
                        className={`px-3 py-2 rounded-sm border font-semibold text-sm transition-colors ${
                          quizzesSubTab === tab.id
                            ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]'
                            : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {quizzesSubTab === 'types' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                      <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                        {lang === 'vi' ? 'Quản trị loại đề' : 'Gestionar tipos de examen'}
                      </h3>
                      <form
                        onSubmit={onCreateQuizType}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3"
                      >
                        <Input
                          placeholder={
                            lang === 'vi' ? 'Ten VI (cho phep dau, khoang trang)' : 'Nombre VI'
                          }
                          value={newQuizType.name_vi}
                          onChange={(e) =>
                            setNewQuizType((prev) => ({ ...prev, name_vi: e.target.value }))
                          }
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                        <Input
                          placeholder={
                            lang === 'vi' ? 'Ten ES (cho phep dau, khoang trang)' : 'Nombre ES'
                          }
                          value={newQuizType.name_es}
                          onChange={(e) =>
                            setNewQuizType((prev) => ({ ...prev, name_es: e.target.value }))
                          }
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                        <Input
                          placeholder={
                            lang === 'vi' ? 'Mo ta VI (tuy chon)' : 'Descripcion VI (opcional)'
                          }
                          value={newQuizType.description_vi}
                          onChange={(e) =>
                            setNewQuizType((prev) => ({ ...prev, description_vi: e.target.value }))
                          }
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                        <Input
                          placeholder={
                            lang === 'vi' ? 'Mo ta ES (tuy chon)' : 'Descripcion ES (opcional)'
                          }
                          value={newQuizType.description_es}
                          onChange={(e) =>
                            setNewQuizType((prev) => ({ ...prev, description_es: e.target.value }))
                          }
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                        <Button
                          type="submit"
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm loại đề' : 'Agregar tipo'}
                        </Button>
                      </form>
                      <div className="space-y-2">
                        {quizTypes.map((typeItem) => (
                          <div
                            key={typeItem.id}
                            className="p-2 border border-[#d2d2d2] bg-white rounded-sm flex items-center justify-between gap-2"
                          >
                            {editingQuizTypeId === typeItem.id ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                <Input
                                  value={editQuizTypeValue.name_vi}
                                  onChange={(e) =>
                                    setEditQuizTypeValue((prev) => ({
                                      ...prev,
                                      name_vi: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editQuizTypeValue.name_es}
                                  onChange={(e) =>
                                    setEditQuizTypeValue((prev) => ({
                                      ...prev,
                                      name_es: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editQuizTypeValue.description_vi}
                                  onChange={(e) =>
                                    setEditQuizTypeValue((prev) => ({
                                      ...prev,
                                      description_vi: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <Input
                                  value={editQuizTypeValue.description_es}
                                  onChange={(e) =>
                                    setEditQuizTypeValue((prev) => ({
                                      ...prev,
                                      description_es: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => onSaveEditQuizType(typeItem.id)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                  >
                                    {lang === 'vi' ? 'Lưu' : 'Guardar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingQuizTypeId(null)}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  >
                                    {lang === 'vi' ? 'Hủy' : 'Cancelar'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className="font-semibold text-[#5a1428]">
                                    {getQuizTypeLabel(typeItem)}
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">{typeItem.code}</div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onStartEditQuizType(typeItem)}
                                    className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteQuizType(typeItem)}
                                    className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create Quiz Form */}
                  {quizzesSubTab === 'create' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                      <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                        {lang === 'vi' ? 'Tạo đề thi mới' : 'Crear examen'}
                      </h3>
                      <form onSubmit={onCreateQuiz} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {lang === 'vi' ? 'Loại đề' : 'Tipo'}
                            </Label>
                            <Select
                              value={quizForm.quiz_type}
                              onValueChange={(v) => setQuizForm({ ...quizForm, quiz_type: v })}
                            >
                              <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {activeQuizTypes.map((typeItem) => (
                                  <SelectItem key={typeItem.id} value={typeItem.code}>
                                    {getQuizTypeLabel(typeItem)}
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
                          <div className="border border-[#d2d2d2] bg-white p-3 rounded-sm">
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
                          <div className="border border-[#d2d2d2] bg-white p-3 rounded-sm">
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

                        {/* Question Builder */}
                        <div className="border border-[#d2d2d2] bg-white p-3 rounded-sm">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm">
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
                                    placeholder="Đáp án A"
                                    value={currentQuestionDraft.answer_vi_1}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_1', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder="Đáp án B"
                                    value={currentQuestionDraft.answer_vi_2}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_2', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder="Đáp án C"
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
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm">
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
                                {lang === 'vi' ? 'Đáp án đúng' : 'Correcta'}
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

                        <Button
                          type="submit"
                          disabled={creatingQuiz}
                          className="h-10 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {creatingQuiz ? '⏳...' : lang === 'vi' ? 'Tạo đề thi' : 'Crear examen'}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Quizzes List */}
                  {quizzesSubTab === 'list' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                      <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                        {lang === 'vi' ? 'Danh sách đề thi' : 'Lista de exámenes'} (
                        {filteredAdminQuizzes.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Loại đề thi' : 'Tipo de examen'}
                          </Label>
                          <Select
                            value={selectedQuizTypeFilter}
                            onValueChange={setSelectedQuizTypeFilter}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {lang === 'vi' ? 'Tất cả loại đề' : 'Todos los tipos'}
                              </SelectItem>
                              {quizTypes.map((typeItem) => (
                                <SelectItem key={typeItem.id} value={String(typeItem.id)}>
                                  {getQuizTypeLabel(typeItem)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                      <div className="space-y-2">
                        {filteredAdminQuizzes.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-[#d2d2d2] bg-white rounded-sm"
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
                                <span className="text-xs text-[#5b5b5b]">{getQuizTypeDisplayName(item)}</span>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onStartEditQuiz(item)}
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteQuiz(item)}
                                className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            {editingQuizId === item.id && (
                              <div className="w-full mt-2 border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Loại đề' : 'Tipo'}
                                  </Label>
                                  <Select
                                    value={editQuizForm.quiz_type}
                                    onValueChange={(v) =>
                                      setEditQuizForm({ ...editQuizForm, quiz_type: v })
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {activeQuizTypes.map((typeItem) => (
                                        <SelectItem key={typeItem.id} value={typeItem.code}>
                                          {getQuizTypeLabel(typeItem)}
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
                                  <Label className="text-xs text-[#5b5b5b]">VI</Label>
                                  <Input
                                    value={editQuizForm.title_vi}
                                    onChange={(e) =>
                                      setEditQuizForm({ ...editQuizForm, title_vi: e.target.value })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">ES</Label>
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
                                <div className="md:col-span-2 border border-[#d2d2d2] bg-white rounded-sm p-3 space-y-3">
                                  <div className="text-sm font-semibold text-[#5a1428]">
                                    {lang === 'vi'
                                      ? 'Sửa chi tiết câu hỏi, đáp án và ảnh'
                                      : 'Editar preguntas, respuestas e imagen'}
                                  </div>

                                  {loadingEditQuizDetail ? (
                                    <div className="text-xs text-[#5b5b5b]">
                                      {lang === 'vi'
                                        ? 'Đang tải chi tiết đề thi...'
                                        : 'Cargando detalle del examen...'}
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {editQuizQuestions.length > 0 && (
                                        <>
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs text-[#5b5b5b]">
                                              {lang === 'vi' ? 'Câu' : 'Pregunta'} {currentEditQuestionIndex + 1}/
                                              {editQuizQuestions.length}
                                            </span>
                                            <div className="flex gap-1 flex-wrap">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={onAddEditQuestion}
                                                className="h-7 border-[#d2d2d2] bg-white px-2 text-xs"
                                              >
                                                {lang === 'vi' ? 'Thêm câu' : 'Agregar pregunta'}
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  setCurrentEditQuestionIndex((prev) => Math.max(0, prev - 1))
                                                }
                                                disabled={currentEditQuestionIndex === 0}
                                                className="h-7 border-[#d2d2d2] bg-white px-2 text-xs"
                                              >
                                                {lang === 'vi' ? 'Trước' : 'Prev'}
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  setCurrentEditQuestionIndex((prev) =>
                                                    Math.min(editQuizQuestions.length - 1, prev + 1)
                                                  )
                                                }
                                                disabled={currentEditQuestionIndex >= editQuizQuestions.length - 1}
                                                className="h-7 border-[#d2d2d2] bg-white px-2 text-xs"
                                              >
                                                {lang === 'vi' ? 'Sau' : 'Next'}
                                              </Button>
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-1">
                                            {editQuizQuestions.map((_, idx) => (
                                              <button
                                                key={`edit-q-${idx}`}
                                                type="button"
                                                onClick={() => setCurrentEditQuestionIndex(idx)}
                                                className={`h-7 w-7 text-xs font-bold rounded-sm border transition-colors ${idx === currentEditQuestionIndex ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]' : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'}`}
                                              >
                                                {idx + 1}
                                              </button>
                                            ))}
                                          </div>
                                        </>
                                      )}

                                      {currentEditQuestion && (
                                        <div
                                          key={`edit-question-${currentEditQuestion.id ?? currentEditQuestionIndex}`}
                                          className="border border-[#d2d2d2] rounded-sm p-3 bg-[#fcfcfc]"
                                        >
                                          <div className="text-xs font-bold text-[#7a2038] mb-2">
                                            {lang === 'vi' ? 'Câu' : 'Pregunta'} {currentEditQuestionIndex + 1}
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                              <Label className="text-xs text-[#5b5b5b]">VI</Label>
                                              <Textarea
                                                value={currentEditQuestion.question_text_vi}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_vi',
                                                    e.target.value
                                                  )
                                                }
                                                rows={2}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Textarea
                                                value={currentEditQuestion.explanation_vi}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_vi',
                                                    e.target.value
                                                  )
                                                }
                                                rows={2}
                                                placeholder={
                                                  lang === 'vi' ? 'Giải thích VI' : 'Explicación VI'
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>

                                            <div className="space-y-2">
                                              <Label className="text-xs text-[#5b5b5b]">ES</Label>
                                              <Textarea
                                                value={currentEditQuestion.question_text_es}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_es',
                                                    e.target.value
                                                  )
                                                }
                                                rows={2}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Textarea
                                                value={currentEditQuestion.explanation_es}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_es',
                                                    e.target.value
                                                  )
                                                }
                                                rows={2}
                                                placeholder={
                                                  lang === 'vi' ? 'Giải thích ES' : 'Explicación ES'
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>
                                          </div>

                                          <div className="mt-3 space-y-2">
                                            {(currentEditQuestion.answers || []).map(
                                              (answer: any, answerIndex: number) => (
                                                <div
                                                  key={`edit-answer-${currentEditQuestionIndex}-${answer.id ?? answerIndex}`}
                                                  className="grid grid-cols-1 md:grid-cols-12 gap-2"
                                                >
                                                  <div className="md:col-span-1 text-xs font-semibold text-[#7a2038] flex items-center">
                                                    {String.fromCharCode(65 + answerIndex)}
                                                  </div>
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
                                                    placeholder="VI"
                                                    className="md:col-span-5 h-9 border-[#d2d2d2] bg-white"
                                                  />
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
                                                    placeholder="ES"
                                                    className="md:col-span-5 h-9 border-[#d2d2d2] bg-white"
                                                  />
                                                  <div className="md:col-span-1 flex items-center justify-end">
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

                                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <Label className="text-xs text-[#5b5b5b]">
                                                {lang === 'vi' ? 'Đáp án đúng' : 'Respuesta correcta'}
                                              </Label>
                                              <Select
                                                value={String(
                                                  ((currentEditQuestion.answers || []).findIndex(
                                                    (answer: any) => answer.is_correct
                                                  ) >=
                                                  0
                                                    ? (currentEditQuestion.answers || []).findIndex(
                                                        (answer: any) => answer.is_correct
                                                      )
                                                    : 0) + 1
                                                )}
                                                onValueChange={(value) =>
                                                  setEditCorrectAnswer(
                                                    currentEditQuestionIndex,
                                                    Number(value) - 1
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
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
                                <div className="md:col-span-2 flex gap-2">
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
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
