"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from 'components/layouts/AppHeader';
import AppNav from 'components/layouts/AppNav';
import {
  createAdminUser,
  createBilingualMaterial,
  createManualQuiz,
  deleteAdminMaterial,
  deleteAdminQuiz,
  deleteAdminUser,
  getAdminQuizzes,
  getAdminUsers,
  getMaterialsBySubject,
  getSubjects,
  lockAdminUser,
  unlockAdminUser,
  updateAdminMaterial,
  updateAdminQuiz,
  updateAdminUser,
  uploadMaterialFile,
  uploadQuestionImage,
} from 'lib/api';
import { useLang } from 'hooks/useLang';
import { logoutWithToken } from 'lib/auth';
import { TEXT } from 'lib/i18n';
import { getStoredAuth } from 'lib/session';

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

export default function AdminPage() {
  const router = useRouter();
  const { lang, setLang } = useLang('es');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState({ text: '', type: 'error' });

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'student',
  });

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [materialLang, setMaterialLang] = useState('vi');
  const [materials, setMaterials] = useState([]);
  const [materialFiles, setMaterialFiles] = useState({ vi: null, es: null });
  const [materialForm, setMaterialForm] = useState({
    title_vi: '',
    description_vi: '',
    title_es: '',
    description_es: '',
  });

  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionDrafts, setQuestionDrafts] = useState([createEmptyQuestionDraft()]);
  const [questionImageFiles, setQuestionImageFiles] = useState([null]);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    quiz_type: 'general',
    title_vi: '',
    title_es: '',
    description_vi: '',
    description_es: '',
    instructions_vi: '',
    instructions_es: '',
    passing_score: '5',
  });
  const [adminQuizzes, setAdminQuizzes] = useState([]);

  const t = TEXT[lang];
  const currentQuestionDraft = questionDrafts[currentQuestionIndex] || createEmptyQuestionDraft();
  const currentQuestionImageFile = questionImageFiles[currentQuestionIndex] || null;

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  function showError(message) {
    setNotice({ text: message, type: 'error' });
  }

  function showSuccess(viText, esText) {
    setNotice({ text: lang === 'vi' ? viText : esText, type: 'success' });
  }

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth.token) {
      router.replace('/');
      return;
    }

    setToken(auth.token);
    setUser(auth.user);

    if (auth.user?.role !== 'admin') {
      router.replace('/exam');
    }
  }, [router]);

  useEffect(() => {
    if (!token || !isAdmin) {
      return;
    }

    loadAll();
  }, [token, isAdmin, lang]);

  useEffect(() => {
    if (!token || !selectedSubjectId || !isAdmin) {
      return;
    }

    loadMaterials(selectedSubjectId, materialLang);
  }, [selectedSubjectId, materialLang]);

  async function loadAll() {
    try {
      const [subjectRows, userRows, quizRows] = await Promise.all([
        getSubjects(lang),
        getAdminUsers(token),
        getAdminQuizzes(token),
      ]);

      setSubjects(subjectRows);
      setUsers(userRows);
      setAdminQuizzes(quizRows);

      if (!selectedSubjectId && subjectRows.length) {
        setSelectedSubjectId(subjectRows[0].id);
      }
    } catch (error) {
      showError(error.message);
    }
  }

  async function loadMaterials(subjectId, langCode) {
    try {
      const rows = await getMaterialsBySubject(subjectId, langCode);
      setMaterials(rows);
    } catch (error) {
      showError(error.message);
    }
  }

  function onChangeLang(nextLang) {
    setLang(nextLang);
  }

  async function onLogout() {
    await logoutWithToken(token);
    router.replace('/');
  }

  async function onCreateUser(event) {
    event.preventDefault();
    try {
      await createAdminUser(newUser, token);
      setNewUser({ username: '', email: '', password: '', full_name: '', role: 'student' });
      await loadAll();
      showSuccess('Tao user thanh cong', 'Usuario creado correctamente');
    } catch (error) {
      showError(error.message);
    }
  }

  async function onEditUser(item) {
    const fullName = window.prompt('Họ tên', item.full_name || '');
    if (fullName === null) return;

    const role = window.prompt('Role (admin/teacher/student)', item.role || 'student');
    if (role === null) return;

    try {
      await updateAdminUser(item.id, { full_name: fullName, role }, token);
      await loadAll();
    } catch (error) {
      showError(error.message);
    }
  }

  async function onToggleLockUser(item) {
    try {
      if (item.is_active) {
        await lockAdminUser(item.id, token);
      } else {
        await unlockAdminUser(item.id, token);
      }
      await loadAll();
    } catch (error) {
      showError(error.message);
    }
  }

  async function onDeleteUser(item) {
    if (!window.confirm(`Xóa user ${item.username}?`)) return;
    try {
      await deleteAdminUser(item.id, token);
      await loadAll();
    } catch (error) {
      showError(error.message);
    }
  }

  async function onCreateBilingualMaterial(event) {
    event.preventDefault();
    if (!selectedSubjectId) return;

    if (!materialFiles.vi || !materialFiles.es) {
      showError(lang === 'vi' ? 'Can chon du file VI va ES' : 'Debes seleccionar ambos archivos VI y ES');
      return;
    }

    try {
      const uploadedVi = await uploadMaterialFile(materialFiles.vi, token, 'vi');
      const uploadedEs = await uploadMaterialFile(materialFiles.es, token, 'es');

      await createBilingualMaterial(
        selectedSubjectId,
        {
          ...materialForm,
          file_path_vi: uploadedVi.cdn_url,
          file_size_mb_vi: uploadedVi.size ? Number((uploadedVi.size / (1024 * 1024)).toFixed(2)) : null,
          file_path_es: uploadedEs.cdn_url,
          file_size_mb_es: uploadedEs.size ? Number((uploadedEs.size / (1024 * 1024)).toFixed(2)) : null,
        },
        token,
        lang
      );

      setMaterialForm({ title_vi: '', description_vi: '', title_es: '', description_es: '' });
      setMaterialFiles({ vi: null, es: null });
      await loadMaterials(selectedSubjectId, materialLang);
      showSuccess('Da them tai lieu song ngu', 'Material bilingue agregado');
    } catch (error) {
      showError(error.message);
    }
  }

  async function onEditMaterial(item) {
    const title = window.prompt('Tiêu đề', item.title || '');
    if (title === null) return;

    const description = window.prompt('Mô tả', item.description || '');
    if (description === null) return;

    const filePath = window.prompt('URL tài liệu', item.file_path || '');
    if (filePath === null) return;

    try {
      await updateAdminMaterial(item.id, {
        title,
        description,
        file_path: filePath,
        file_size_mb: item.file_size_mb,
      }, token, lang);
      await loadMaterials(selectedSubjectId, materialLang);
    } catch (error) {
      showError(error.message);
    }
  }

  async function onDeleteMaterial(item) {
    if (!window.confirm(`Xóa tài liệu ${item.title}?`)) return;

    try {
      await deleteAdminMaterial(item.id, token, lang);
      await loadMaterials(selectedSubjectId, materialLang);
    } catch (error) {
      showError(error.message);
    }
  }

  function updateCurrentQuestionField(field, value) {
    setQuestionDrafts((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = {
        ...next[currentQuestionIndex],
        [field]: value,
      };
      return next;
    });
  }

  function updateCurrentQuestionImage(file) {
    setQuestionImageFiles((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = file;
      return next;
    });
  }

  function onChangeQuestionCount(rawValue) {
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

  async function onCreateQuiz(event) {
    event.preventDefault();
    if (!selectedSubjectId || creatingQuiz) return;

    const source = questionDrafts.slice(0, questionCount);
    for (let index = 0; index < source.length; index += 1) {
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
        showError(lang === 'vi' ? `Cau ${index + 1} chua du du lieu` : `La pregunta ${index + 1} no esta completa`);
        return;
      }
    }

    setCreatingQuiz(true);
    try {
      const questions = [];

      for (let index = 0; index < source.length; index += 1) {
        const draft = source[index];
        const file = questionImageFiles[index];
        let imageUrl = null;

        if (file) {
          const uploaded = await uploadQuestionImage(file, token);
          imageUrl = uploaded.cdn_url || null;
        }

        const correctIndex = Number(draft.correct_index);
        const answers = [1, 2, 3].map((answerIndex) => ({
          answer_text_vi: draft[`answer_vi_${answerIndex}`],
          answer_text_es: draft[`answer_es_${answerIndex}`],
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

      await createManualQuiz({
        ...quizForm,
        subject_id: Number(selectedSubjectId),
        duration_minutes: 0,
        passing_score: Number(quizForm.passing_score),
        questions,
      }, token, lang);

      setQuizForm({
        quiz_type: 'general',
        title_vi: '',
        title_es: '',
        description_vi: '',
        description_es: '',
        instructions_vi: '',
        instructions_es: '',
        passing_score: '5',
      });
      setQuestionCount(1);
      setCurrentQuestionIndex(0);
      setQuestionDrafts([createEmptyQuestionDraft()]);
      setQuestionImageFiles([null]);
      await loadAll();
      showSuccess('Da tao de thi', 'Examen creado correctamente');
    } catch (error) {
      showError(error.message);
    } finally {
      setCreatingQuiz(false);
    }
  }

  async function onEditQuiz(item) {
    const titleVi = window.prompt('Tiêu đề VI', item.title_vi || '');
    if (titleVi === null) return;
    const titleEs = window.prompt('Tiêu đề ES', item.title_es || '');
    if (titleEs === null) return;
    const passingScore = window.prompt('Điểm đạt', String(item.passing_score || '5'));
    if (passingScore === null) return;

    try {
      await updateAdminQuiz(item.id, {
        subject_id: item.subject_id,
        category_id: item.category_id,
        quiz_type: item.quiz_type || 'general',
        title_vi: titleVi,
        title_es: titleEs,
        description_vi: item.description_vi,
        description_es: item.description_es,
        instructions_vi: item.instructions_vi,
        instructions_es: item.instructions_es,
        passing_score: Number(passingScore),
        is_active: item.is_active,
      }, token);
      await loadAll();
    } catch (error) {
      showError(error.message);
    }
  }

  async function onToggleQuiz(item) {
    try {
      await updateAdminQuiz(item.id, {
        subject_id: item.subject_id,
        category_id: item.category_id,
        quiz_type: item.quiz_type || 'general',
        title_vi: item.title_vi,
        title_es: item.title_es,
        description_vi: item.description_vi,
        description_es: item.description_es,
        instructions_vi: item.instructions_vi,
        instructions_es: item.instructions_es,
        passing_score: Number(item.passing_score),
        is_active: !item.is_active,
      }, token);
      await loadAll();
    } catch (error) {
      showError(error.message);
    }
  }

  async function onDeleteQuiz(item) {
    if (!window.confirm(`Xóa đề ${item.code}?`)) return;

    try {
      await deleteAdminQuiz(item.id, token);
      await loadAll();
    } catch (error) {
      showError(error.message);
    }
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="dgt-page">
      <AppHeader t={t} lang={lang} onChangeLang={onChangeLang} user={user} />
      <AppNav t={t} onLogout={onLogout} user={user} />

      <section className="panel materials-shell">
        <h2>{t.menuAdmin}</h2>

        <div className="admin-box">
          <h3>Quản lý người dùng</h3>
          <form className="grid two" onSubmit={onCreateUser}>
            <input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
            <input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            <input placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
            <input placeholder="Full name" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
            <button type="submit">Thêm user</button>
          </form>
          <div style={{ marginTop: 8 }}>
            {users.map((item) => (
              <div key={item.id} className="material-item">
                <strong>{item.username} ({item.role})</strong>
                <p className="meta">{item.email} - {item.is_active ? 'active' : 'locked'}</p>
                <div className="actions-row">
                  <button type="button" className="secondary" onClick={() => onEditUser(item)}>Sửa</button>
                  <button type="button" className="secondary" onClick={() => onToggleLockUser(item)}>{item.is_active ? 'Khóa' : 'Mở khóa'}</button>
                  <button type="button" className="secondary" onClick={() => onDeleteUser(item)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-box" style={{ marginTop: 12 }}>
          <h3>Quản lý tài liệu</h3>
          <div className="grid two">
            <label>
              Chủ đề
              <select value={selectedSubjectId || ''} onChange={(e) => setSelectedSubjectId(Number(e.target.value) || null)}>
                {subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Ngôn ngữ danh sách
              <select value={materialLang} onChange={(e) => setMaterialLang(e.target.value)}>
                <option value="vi">vi</option>
                <option value="es">es</option>
              </select>
            </label>
          </div>

          <form className="grid two admin-split" style={{ marginTop: 8 }} onSubmit={onCreateBilingualMaterial}>
            <div className="admin-side">
              <h4>VI</h4>
              <input placeholder="Tiêu đề VI" value={materialForm.title_vi} onChange={(e) => setMaterialForm({ ...materialForm, title_vi: e.target.value })} required />
              <textarea placeholder="Mô tả VI" value={materialForm.description_vi} onChange={(e) => setMaterialForm({ ...materialForm, description_vi: e.target.value })} />
              <input type="file" onChange={(e) => setMaterialFiles({ ...materialFiles, vi: e.target.files?.[0] || null })} required />
            </div>
            <div className="admin-side">
              <h4>ES</h4>
              <input placeholder="Tiêu đề ES" value={materialForm.title_es} onChange={(e) => setMaterialForm({ ...materialForm, title_es: e.target.value })} required />
              <textarea placeholder="Mô tả ES" value={materialForm.description_es} onChange={(e) => setMaterialForm({ ...materialForm, description_es: e.target.value })} />
              <input type="file" onChange={(e) => setMaterialFiles({ ...materialFiles, es: e.target.files?.[0] || null })} required />
            </div>
            <button type="submit">Thêm tài liệu song ngữ</button>
          </form>

          <div style={{ marginTop: 8 }}>
            {materials.map((item) => (
              <div key={item.id} className="material-item">
                <strong>{item.title}</strong>
                <p className="meta">{item.description || '...'}</p>
                <div className="actions-row">
                  <a href={item.file_path} target="_blank" rel="noreferrer">{t.openDoc}</a>
                  <button type="button" className="secondary" onClick={() => onEditMaterial(item)}>Sửa</button>
                  <button type="button" className="secondary" onClick={() => onDeleteMaterial(item)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-box" style={{ marginTop: 12 }}>
          <h3>Quản lý đề thi</h3>
          <form onSubmit={onCreateQuiz}>
            <div className="grid two">
              <label>
                Loại đề
                <select value={quizForm.quiz_type} onChange={(e) => setQuizForm({ ...quizForm, quiz_type: e.target.value })}>
                  <option value="general">general</option>
                  <option value="bien_bao">bien_bao</option>
                  <option value="cao_toc">cao_toc</option>
                  <option value="ly_thuyet">ly_thuyet</option>
                  <option value="an_toan">an_toan</option>
                  <option value="sa_hinh">sa_hinh</option>
                </select>
              </label>
              <label>
                Điểm đạt
                <input value={quizForm.passing_score} onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })} required />
              </label>
            </div>

            <div className="grid two admin-split">
              <div className="admin-side">
                <h4>VI</h4>
                <input placeholder="Tiêu đề" value={quizForm.title_vi} onChange={(e) => setQuizForm({ ...quizForm, title_vi: e.target.value })} required />
                <textarea placeholder="Mô tả" value={quizForm.description_vi} onChange={(e) => setQuizForm({ ...quizForm, description_vi: e.target.value })} />
                <textarea placeholder="Hướng dẫn" value={quizForm.instructions_vi} onChange={(e) => setQuizForm({ ...quizForm, instructions_vi: e.target.value })} />
              </div>
              <div className="admin-side">
                <h4>ES</h4>
                <input placeholder="Título" value={quizForm.title_es} onChange={(e) => setQuizForm({ ...quizForm, title_es: e.target.value })} required />
                <textarea placeholder="Descripción" value={quizForm.description_es} onChange={(e) => setQuizForm({ ...quizForm, description_es: e.target.value })} />
                <textarea placeholder="Instrucciones" value={quizForm.instructions_es} onChange={(e) => setQuizForm({ ...quizForm, instructions_es: e.target.value })} />
              </div>
            </div>

            <div className="panel" style={{ marginTop: 8 }}>
              <h4>Câu hỏi tuần tự</h4>
              <div className="grid two" style={{ marginTop: 8 }}>
                <label>
                  Số câu hỏi
                  <input type="number" min="1" max="60" value={questionCount} onChange={(e) => onChangeQuestionCount(e.target.value)} />
                </label>
                <div>
                  <p className="meta" style={{ marginTop: 28 }}>Đang nhập câu {currentQuestionIndex + 1}/{questionCount}</p>
                </div>
              </div>

              <div className="actions-row" style={{ marginTop: 8 }}>
                <button type="button" className="secondary" onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0 || creatingQuiz}>Câu trước</button>
                <button type="button" className="secondary" onClick={() => setCurrentQuestionIndex((prev) => Math.min(questionCount - 1, prev + 1))} disabled={currentQuestionIndex >= questionCount - 1 || creatingQuiz}>Câu tiếp</button>
              </div>

              <fieldset disabled={creatingQuiz} style={{ border: 0, margin: 0, padding: 0 }}>
                <div className="grid two admin-split">
                  <div className="admin-side">
                    <h4>VI</h4>
                    <textarea placeholder="Nội dung câu hỏi" value={currentQuestionDraft.question_text_vi} onChange={(e) => updateCurrentQuestionField('question_text_vi', e.target.value)} required />
                    <textarea placeholder="Giải thích" value={currentQuestionDraft.explanation_vi} onChange={(e) => updateCurrentQuestionField('explanation_vi', e.target.value)} />
                    <input placeholder="Đáp án A" value={currentQuestionDraft.answer_vi_1} onChange={(e) => updateCurrentQuestionField('answer_vi_1', e.target.value)} required />
                    <input placeholder="Đáp án B" value={currentQuestionDraft.answer_vi_2} onChange={(e) => updateCurrentQuestionField('answer_vi_2', e.target.value)} required />
                    <input placeholder="Đáp án C" value={currentQuestionDraft.answer_vi_3} onChange={(e) => updateCurrentQuestionField('answer_vi_3', e.target.value)} required />
                  </div>
                  <div className="admin-side">
                    <h4>ES</h4>
                    <textarea placeholder="Texto de pregunta" value={currentQuestionDraft.question_text_es} onChange={(e) => updateCurrentQuestionField('question_text_es', e.target.value)} required />
                    <textarea placeholder="Explicación" value={currentQuestionDraft.explanation_es} onChange={(e) => updateCurrentQuestionField('explanation_es', e.target.value)} />
                    <input placeholder="Respuesta A" value={currentQuestionDraft.answer_es_1} onChange={(e) => updateCurrentQuestionField('answer_es_1', e.target.value)} required />
                    <input placeholder="Respuesta B" value={currentQuestionDraft.answer_es_2} onChange={(e) => updateCurrentQuestionField('answer_es_2', e.target.value)} required />
                    <input placeholder="Respuesta C" value={currentQuestionDraft.answer_es_3} onChange={(e) => updateCurrentQuestionField('answer_es_3', e.target.value)} required />
                  </div>
                </div>

                <div className="grid two" style={{ marginTop: 8 }}>
                  <label>
                    Đáp án đúng
                    <select value={currentQuestionDraft.correct_index} onChange={(e) => updateCurrentQuestionField('correct_index', e.target.value)}>
                      <option value="1">A</option>
                      <option value="2">B</option>
                      <option value="3">C</option>
                    </select>
                  </label>
                  <label>
                    Upload ảnh câu hỏi
                    <input key={`admin-question-image-${currentQuestionIndex}`} type="file" accept="image/*" onChange={(e) => updateCurrentQuestionImage(e.target.files?.[0] || null)} />
                  </label>
                  {currentQuestionImageFile && <p className="meta">{currentQuestionImageFile.name}</p>}
                </div>
              </fieldset>
            </div>

            <button type="submit" disabled={creatingQuiz}>{creatingQuiz ? 'Đang tạo đề thi...' : 'Tạo đề thi'}</button>
          </form>

          <div style={{ marginTop: 8 }}>
            {adminQuizzes.map((item) => (
              <div key={item.id} className="material-item">
                <strong>{item.code} - {item.title_vi}</strong>
                <p className="meta">{item.quiz_type} - {item.is_active ? 'active' : 'inactive'} - {item.total_questions} câu</p>
                <div className="actions-row">
                  <button type="button" className="secondary" onClick={() => onEditQuiz(item)}>Sửa</button>
                  <button type="button" className="secondary" onClick={() => onToggleQuiz(item)}>{item.is_active ? 'Ẩn' : 'Mở'}</button>
                  <button type="button" className="secondary" onClick={() => onDeleteQuiz(item)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!!notice.text && <p className={`panel meta notice-msg ${notice.type === 'success' ? 'notice-success' : 'notice-error'}`}>{notice.text}</p>}
    </main>
  );
}
