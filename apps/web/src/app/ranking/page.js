"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from 'components/layouts/AppHeader';
import AppNav from 'components/layouts/AppNav';
import { getLeaderboard } from 'lib/api';
import { useLang } from 'hooks/useLang';
import { logoutWithToken } from 'lib/auth';
import { TEXT } from 'lib/i18n';
import { getStoredAuth } from 'lib/session';

export default function RankingPage() {
  const router = useRouter();
  const { lang, setLang } = useLang('es');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

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

    loadLeaderboard();
  }, [token, lang]);

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard(lang, 20);
      setLeaderboard(data);
    } catch (error) {
      setMessage(error.message);
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

      <section className="panel ranking-shell">
        <h2>{t.leaderboard}</h2>
        <div className="ranking-table">
          <div className="ranking-row head">
            <span>{t.rank}</span>
            <span>{t.candidate}</span>
            <span>{t.score}</span>
            <span>{t.attempts}</span>
            <span>{t.avg}</span>
          </div>
          {leaderboard.map((item, index) => (
            <div key={item.id} className="ranking-row">
              <span>{index + 1}</span>
              <span>{item.full_name || item.username}</span>
              <span>{item.total_score}</span>
              <span>{item.total_quizzes}</span>
              <span>{item.average_percentage}%</span>
            </div>
          ))}
        </div>
      </section>

      {!!message && <p className="panel meta error-msg">{message}</p>}
    </main>
  );
}
