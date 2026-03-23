"use client";

export default function AppHeader({ t, lang, onChangeLang, user }) {
  return (
    <section className="panel top-bar">
      <div>
        <h1>{t.appTitle}</h1>
        <p className="meta">{t.appSub}</p>
      </div>
      <div className="top-right">
        <div className="lang-switch">
          <button
            className={lang === 'vi' ? 'chip active' : 'chip'}
            onClick={() => onChangeLang('vi')}
          >
            VI
          </button>
          <button
            className={lang === 'es' ? 'chip active' : 'chip'}
            onClick={() => onChangeLang('es')}
          >
            ES
          </button>
        </div>
        <div className="meta">
          {t.candidate}: {user?.full_name || user?.username || 'Guest'}
        </div>
      </div>
    </section>
  );
}
