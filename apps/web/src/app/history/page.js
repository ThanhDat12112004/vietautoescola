"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from 'components/layouts/AppHeader';
import AppNav from 'components/layouts/AppNav';
import { getDashboard } from 'lib/api';
import { useLang } from 'hooks/useLang';
import { logoutWithToken } from 'lib/auth';
import { TEXT } from 'lib/i18n';
import { getStoredAuth } from 'lib/session';

function formatStatus(value, t) {
  if (value === 'completed') {
    return t.completed;
  }
  if (value === 'abandoned') {
    return t.abandoned;
  }
  return t.inProgress;
}

export default function HistoryPage() {
  const router = useRouter();
  const { lang, setLang } = useLang('es');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);

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

    loadDashboard();
  }, [token, lang]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await getDashboard(lang, token);
      setDashboard(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    await logoutWithToken(token);
    router.replace('/');
  }

  function onChangeLang(nextLang) {
    setLang(nextLang);
  }

  return (
    <main className="dgt-page">
      <AppHeader t={t} lang={lang} onChangeLang={onChangeLang} user={user} />
      <AppNav t={t} onLogout={onLogout} user={user} />

      <section className="panel history-shell">
        <h2>{t.historyTitle}</h2>
        {dashboard?.history?.length ? (
          <div className="history-list">
            {dashboard.history.map((row) => (
              <div key={row.id} className="history-item">
                <strong>{row.quiz_title}</strong>
                <p className="meta">
                  {t.score}: {row.score} | {t.total}: {row.percentage}%
                </p>
                <p className="meta">
                  {t.status}: {formatStatus(row.status, t)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="meta">{loading ? t.loading : t.noHistory}</p>
        )}
      </section>

      {!!message && <p className="panel meta error-msg">{message}</p>}
    </main>
  );
}
