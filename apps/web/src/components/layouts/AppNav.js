"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth, getStoredAuth } from 'lib/session';

const MENUS = [
  { key: 'exam', href: '/exam' },
  { key: 'materials', href: '/materials' },
  { key: 'ranking', href: '/ranking' },
  { key: 'history', href: '/history' },
];

export default function AppNav({ t, onLogout, user }) {
  const pathname = usePathname();
  const menus = user?.role === 'admin' ? [...MENUS, { key: 'admin', href: '/admin' }] : MENUS;

  useEffect(() => {
    let sent = false;

    const flushLogoutOnClose = () => {
      if (sent) {
        return;
      }

      const { token } = getStoredAuth();
      if (!token) {
        return;
      }

      sent = true;
      const payload = JSON.stringify({ token });
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

      try {
        if (navigator.sendBeacon && apiBase) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${apiBase}/auth/logout-beacon`, blob);
        } else if (apiBase) {
          fetch(`${apiBase}/auth/logout-beacon`, {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          }).catch(() => {});
        }
      } finally {
        clearAuth();
      }
    };

    window.addEventListener('pagehide', flushLogoutOnClose);
    window.addEventListener('beforeunload', flushLogoutOnClose);

    return () => {
      window.removeEventListener('pagehide', flushLogoutOnClose);
      window.removeEventListener('beforeunload', flushLogoutOnClose);
    };
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) {
      return () => {};
    }

    const runHeartbeat = () => {
      const { token } = getStoredAuth();
      if (!token) {
        return;
      }

      fetch(`${apiBase}/auth/heartbeat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    };

    runHeartbeat();
    const intervalId = window.setInterval(runHeartbeat, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="panel auth-ok">
      <div className="menu-row">
        {menus.map((menu) => {
          const labelByKey = {
            exam: t.menuExam,
            materials: t.menuMaterials,
            ranking: t.menuRanking,
            history: t.menuHistory,
            admin: t.menuAdmin,
          };
          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.key}
              href={menu.href}
              className={isActive ? 'menu-btn active menu-link' : 'menu-btn menu-link'}
            >
              {labelByKey[menu.key]}
            </Link>
          );
        })}
      </div>
      <button className="secondary" onClick={onLogout}>
        {t.logout}
      </button>
    </section>
  );
}
