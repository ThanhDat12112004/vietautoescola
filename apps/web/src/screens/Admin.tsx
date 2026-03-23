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
  createAdminUser,
  createBilingualMaterial,
  createManualQuiz,
  deleteAdminMaterial,
  deleteAdminQuiz,
  deleteAdminQuizType,
  deleteAdminSubject,
  deleteAdminUser,
  getAdminQuizTypes,
  getAdminQuizzes,
  getAdminSubjects,
  getAdminUsers,
  getMaterialsBySubject,
  getSubjects,
  lockAdminUser,
  unlockAdminUser,
  updateAdminMaterial,
  updateAdminQuiz,
  updateAdminQuizType,
  updateAdminSubject,
  updateAdminUser,
  uploadMaterialFile,
  uploadQuestionImage,
  type AdminQuizType,
  type AdminSubject,
  type MaterialItem,
  type Subject,
} from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import type { Language } from '@/lib/data';
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
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'student',
    is_active: true,
    password: '',
  });
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'student',
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
  const [materialLang, setMaterialLang] = useState<Language>('vi');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState({
    title: '',
    description: '',
    file_path: '',
    file_size_mb: '',
  });
  const [materialFiles, setMaterialFiles] = useState<{ vi: File | null; es: File | null }>({
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

  const currentQuestionDraft = questionDrafts[currentQuestionIndex] || createEmptyQuestionDraft();
  const currentQuestionImageFile = questionImageFiles[currentQuestionIndex] || null;

  const activeQuizTypes = useMemo(() => quizTypes.filter((item) => item.is_active), [quizTypes]);

  function getQuizTypeLabel(typeItem: AdminQuizType) {
    return lang === 'es' ? typeItem.name_es : typeItem.name_vi;
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
    loadMaterials(selectedSubjectId, materialLang);
  }, [selectedSubjectId, materialLang, auth?.token, isAdmin]);

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

  async function loadMaterials(subjectId: number, langCode: Language) {
    try {
      const rows = await getMaterialsBySubject(subjectId, langCode);
      setMaterials(rows);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error loading materials');
    }
  }

  async function onCreateUser(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createAdminUser(newUser);
      setNewUser({ username: '', email: '', password: '', full_name: '', role: 'student' });
      await loadAll();
      showSuccess('Tạo user thành công', 'Usuario creado correctamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
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
        },
        lang
      );
      setMaterialForm({ title_vi: '', description_vi: '', title_es: '', description_es: '' });
      setMaterialFiles({ vi: null, es: null });
      await loadMaterials(selectedSubjectId, materialLang);
      showSuccess('Đã thêm tài liệu song ngữ', 'Material bilingüe agregado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  function onStartEditMaterial(item: any) {
    setEditingMaterialId(item.id);
    setEditMaterialForm({
      title: item.title || '',
      description: item.description || '',
      file_path: item.file_path || '',
      file_size_mb: item.file_size_mb == null ? '' : String(item.file_size_mb),
    });
  }

  function onCancelEditMaterial() {
    setEditingMaterialId(null);
    setEditMaterialForm({
      title: '',
      description: '',
      file_path: '',
      file_size_mb: '',
    });
  }

  async function onSaveEditMaterial(item: any) {
    try {
      await updateAdminMaterial(
        item.id,
        {
          title: editMaterialForm.title,
          description: editMaterialForm.description,
          file_path: editMaterialForm.file_path,
          file_size_mb: editMaterialForm.file_size_mb
            ? Number(editMaterialForm.file_size_mb)
            : null,
        },
        lang
      );
      await loadMaterials(selectedSubjectId!, materialLang);
      onCancelEditMaterial();
      showSuccess('Đã cập nhật tài liệu', 'Material actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onDeleteMaterial(item: any) {
    if (!window.confirm(`Xóa tài liệu ${item.title}?`)) return;
    try {
      await deleteAdminMaterial(item.id, lang);
      await loadMaterials(selectedSubjectId!, materialLang);
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

  function onStartEditQuiz(item: any) {
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
  }

  async function onSaveEditQuiz(item: any) {
    try {
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
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  }

  async function onToggleQuiz(item: any) {
    try {
      await updateAdminQuiz(item.id, { ...item, is_active: !item.is_active });
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
    <div className="app-page min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-2 md:px-4 py-3 md:py-4">
        <div className="w-full min-h-full bg-transparent p-0">
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
            <aside className="border border-[#dbe3ee] bg-white/82 backdrop-blur-sm rounded-2xl shadow-sm p-3 sm:w-56 sm:shrink-0">
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
            <div className="flex-1 border border-[#dbe3ee] bg-white/82 backdrop-blur-sm rounded-2xl shadow-sm p-3 md:p-4 lg:p-5 overflow-auto">
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Add User Form */}
                  <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                    <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                      {lang === 'vi' ? 'Thêm người dùng mới' : 'Agregar usuario'}
                    </h3>
                    <form
                      onSubmit={onCreateUser}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      <div>
                        <Label className="text-xs text-[#5b5b5b]">Username</Label>
                        <Input
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          required
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#5b5b5b]">Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          required
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#5b5b5b]">
                          {lang === 'vi' ? 'Mật khẩu' : 'Contraseña'}
                        </Label>
                        <Input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#5b5b5b]">
                          {lang === 'vi' ? 'Họ tên' : 'Nombre'}
                        </Label>
                        <Input
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                          className="border-[#d2d2d2] bg-white h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#5b5b5b]">
                          {lang === 'vi' ? 'Vai trò' : 'Rol'}
                        </Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                        >
                          <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
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
                      <div className="flex items-end">
                        <Button
                          type="submit"
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {lang === 'vi' ? 'Thêm' : 'Agregar'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Users List */}
                  <div className="border border-[#dbe3ee] bg-white rounded-2xl shadow-sm p-4 md:p-5">
                    <h3 className="font-bold text-[#5a1428] mb-3 text-base md:text-lg">
                      {lang === 'vi' ? 'Danh sách người dùng' : 'Lista de usuarios'} ({users.length}
                      )
                    </h3>
                    <div className="space-y-2">
                      {users.map((item: any) => (
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
                          </div>
                          <div className="flex gap-1 flex-wrap">
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
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {lang === 'vi' ? 'Ngôn ngữ' : 'Idioma'}
                          </Label>
                          <Select
                            value={materialLang}
                            onValueChange={(v) => setMaterialLang(v as Language)}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vi">Tiếng Việt</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
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
                        {materials.length})
                      </h3>
                      <div className="space-y-2">
                        {materials.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-[#d2d2d2] bg-white rounded-sm"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#5a1428]">{item.title}</div>
                              <div className="text-xs text-[#5b5b5b]">
                                {item.description || '-'}{' '}
                                {item.file_size_mb && `(${item.file_size_mb}MB)`}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                <a href={item.file_path} target="_blank" rel="noreferrer">
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
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Tiêu đề' : 'Título'}
                                  </Label>
                                  <Input
                                    value={editMaterialForm.title}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        title: e.target.value,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">URL</Label>
                                  <Input
                                    value={editMaterialForm.file_path}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        file_path: e.target.value,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {lang === 'vi' ? 'Mô tả' : 'Descripción'}
                                  </Label>
                                  <Textarea
                                    value={editMaterialForm.description}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        description: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="border-[#d2d2d2] bg-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">Size (MB)</Label>
                                  <Input
                                    type="number"
                                    value={editMaterialForm.file_size_mb}
                                    onChange={(e) =>
                                      setEditMaterialForm({
                                        ...editMaterialForm,
                                        file_size_mb: e.target.value,
                                      })
                                    }
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  />
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
                              <div className="space-y-2">
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
                                <Input
                                  placeholder="Đáp án A"
                                  value={currentQuestionDraft.answer_vi_1}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('answer_vi_1', e.target.value)
                                  }
                                  required
                                  className="border-[#d2d2d2] bg-white h-8"
                                />
                                <Input
                                  placeholder="Đáp án B"
                                  value={currentQuestionDraft.answer_vi_2}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('answer_vi_2', e.target.value)
                                  }
                                  required
                                  className="border-[#d2d2d2] bg-white h-8"
                                />
                                <Input
                                  placeholder="Đáp án C"
                                  value={currentQuestionDraft.answer_vi_3}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('answer_vi_3', e.target.value)
                                  }
                                  required
                                  className="border-[#d2d2d2] bg-white h-8"
                                />
                              </div>
                            </div>
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-3 rounded-sm">
                              <h5 className="font-semibold text-[#5a1428] mb-2 text-sm">
                                🇪🇸 Español
                              </h5>
                              <div className="space-y-2">
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
                                <Input
                                  placeholder="Respuesta A"
                                  value={currentQuestionDraft.answer_es_1}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('answer_es_1', e.target.value)
                                  }
                                  required
                                  className="border-[#d2d2d2] bg-white h-8"
                                />
                                <Input
                                  placeholder="Respuesta B"
                                  value={currentQuestionDraft.answer_es_2}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('answer_es_2', e.target.value)
                                  }
                                  required
                                  className="border-[#d2d2d2] bg-white h-8"
                                />
                                <Input
                                  placeholder="Respuesta C"
                                  value={currentQuestionDraft.answer_es_3}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('answer_es_3', e.target.value)
                                  }
                                  required
                                  className="border-[#d2d2d2] bg-white h-8"
                                />
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
                        {adminQuizzes.length})
                      </h3>
                      <div className="space-y-2">
                        {adminQuizzes.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-[#d2d2d2] bg-white rounded-sm"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#5a1428]">{item.code}</span>
                                <span className="text-xs text-[#5b5b5b]">{item.title_vi}</span>
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
                              <div className="text-xs text-[#5b5b5b]">
                                {item.title_es} | {item.quiz_type} | {item.total_questions}{' '}
                                {lang === 'vi' ? 'câu' : 'preg'}
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
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => onSaveEditQuiz(item)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                  >
                                    {lang === 'vi' ? 'Lưu' : 'Guardar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onCancelEditQuiz}
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
