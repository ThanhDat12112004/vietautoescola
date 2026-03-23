"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from 'components/layouts/AppHeader';
import AppNav from 'components/layouts/AppNav';
import { getMaterialsBySubject, getSubjects } from 'lib/api';
import { useLang } from 'hooks/useLang';
import { logoutWithToken } from 'lib/auth';
import { TEXT } from 'lib/i18n';
import { getStoredAuth } from 'lib/session';

export default function MaterialsPage() {
  const router = useRouter();
  const { lang, setLang } = useLang('es');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [materials, setMaterials] = useState([]);

  const t = TEXT[lang];

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth.token) {
      router.replace('/');
      return;
    }

    setToken(auth.token);
    setUser(auth.user);
  }, [router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadSubjects();
  }, [token, lang]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setMaterials([]);
      return;
    }

    loadMaterials(selectedSubjectId);
  }, [selectedSubjectId, lang]);

  async function onLogout() {
    await logoutWithToken(token);
    router.replace('/');
  }

  function onChangeLang(nextLang) {
    setLang(nextLang);
  }

  async function loadSubjects() {
    try {
      const data = await getSubjects(lang);
      setSubjects(data);
      if (data.length) {
        setSelectedSubjectId((prev) => prev || data[0].id);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadMaterials(subjectId) {
    try {
      const data = await getMaterialsBySubject(subjectId, lang);
      setMaterials(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="dgt-page">
      <AppHeader t={t} lang={lang} onChangeLang={onChangeLang} user={user} />
      <AppNav t={t} onLogout={onLogout} user={user} />

      <section className="panel materials-shell">
        <h2>{t.menuMaterials}</h2>
        <div className="grid two">
          <div>
            <label>
              {t.chooseSubject}
              <select value={selectedSubjectId || ''} onChange={(e) => setSelectedSubjectId(Number(e.target.value) || null)}>
                {!subjects.length && <option value="">{t.noSubject}</option>}
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="materials-list">
            {materials.length ? (
              materials.map((item) => (
                <div key={item.id} className="material-item">
                  <strong>{item.title}</strong>
                  <p className="meta">{item.description || '...'}</p>
                  <a href={item.file_path} target="_blank" rel="noreferrer">{t.openDoc}</a>
                </div>
              ))
            ) : (
              <p className="meta">{t.noMaterials}</p>
            )}
          </div>
        </div>
      </section>

      {!!message && <p className="panel meta error-msg">{message}</p>}
    </main>
  );
}
