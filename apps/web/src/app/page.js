"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from 'components/layouts/AppHeader';
import { login, register } from 'lib/api';
import { useLang } from 'hooks/useLang';
import { TEXT } from 'lib/i18n';
import { getStoredAuth, saveAuth } from 'lib/session';

export default function HomePage() {
  const router = useRouter();
  const { lang, setLang } = useLang('es');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const t = TEXT[lang];

  useEffect(() => {
    const { token } = getStoredAuth();

    if (token) {
      router.replace('/exam');
    }
  }, [router]);

  function onChangeLang(nextLang) {
    setLang(nextLang);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      if (authMode === 'login') {
        const payload = await login({
          email: authForm.email,
          password: authForm.password,
          lang,
        });

        saveAuth(payload.token, payload.user);
        router.replace('/exam');
      } else {
        await register(authForm, lang);
        setAuthMode('login');
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="dgt-page">
      <AppHeader t={t} lang={lang} onChangeLang={onChangeLang} user={null} />

      <section className="panel auth-panel">
        <div className="tabs">
          <button
            className={authMode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setAuthMode('login')}
          >
            {t.login}
          </button>
          <button
            className={authMode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setAuthMode('register')}
          >
            {t.register}
          </button>
        </div>

        <form className="grid two" onSubmit={handleAuthSubmit}>
          {authMode === 'register' && (
            <>
              <label>
                {t.username}
                <input
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                />
              </label>
              <label>
                {t.fullName}
                <input
                  value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                />
              </label>
            </>
          )}
          <label>
            {t.email}
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
          </label>
          <label>
            {t.password}
            <input
              type="password"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
          </label>
          <div>
            <button type="submit">{authMode === 'login' ? t.signIn : t.signUp}</button>
          </div>
        </form>
      </section>

      {!!message && <p className="panel meta error-msg">{message}</p>}
    </main>
  );
}
