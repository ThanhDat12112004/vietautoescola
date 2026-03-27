import {
  BookOpen,
  FileText,
  Globe2,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  User,
  X,
} from '@/components/BrandIcons';
import BrandLogo from '@/components/BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { logout, resolveMediaUrl } from '@/lib/api';
import { clearAuth, getStoredAuth, type AuthUser } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAuthenticated(Boolean(auth?.token));
      setAuthUser(auth?.user || null);
    };
    syncAuth();

    const onStorageChange = () => syncAuth();
    const onAuthUpdated = () => syncAuth();
    window.addEventListener('storage', onStorageChange);
    window.addEventListener('auth-updated', onAuthUpdated);
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('auth-updated', onAuthUpdated);
    };
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 170);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore to keep logout UX resilient.
    } finally {
      clearAuth();
      setIsAuthenticated(false);
      setAuthUser(null);
      setMobileOpen(false);
    }
  };

  const userDisplayName = authUser?.full_name || authUser?.username || 'User';
  const userAvatarUrl = authUser?.avatar_url ? resolveMediaUrl(authUser.avatar_url) : null;
  const isAdmin = (authUser?.role || '').toLowerCase() === 'admin';

  const navItems = [
    { path: '/', label: t('Trang chủ', 'Inicio'), icon: Home },
    { path: '/quizzes', label: t('Làm bài thi', 'Exámenes'), icon: BookOpen },
    { path: '/materials', label: t('Tài liệu', 'Materiales'), icon: FileText },
    { path: '/leaderboard', label: t('Xếp hạng', 'Ranking'), icon: Trophy },
    ...(isAdmin ? [{ path: '/admin', label: t('Quản trị', 'Admin'), icon: ShieldCheck }] : []),
  ];

  const desktopNavItems = [
    { path: '/', label: t('Trang chủ', 'Inicio'), icon: Home },
    { path: '/quizzes', label: t('Bài thi', 'Exámenes'), icon: BookOpen },
    { path: '/materials', label: t('Tài liệu', 'Materiales'), icon: FileText },
    { path: '/leaderboard', label: t('Xếp hạng', 'Ranking'), icon: Trophy },
  ];

  const renderDesktopMenuStrip = (compact = false) => (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${desktopNavItems.length}, minmax(0, 1fr))`,
      }}
    >
      {desktopNavItems.map((item) => {
        const active = location.pathname === item.path;

        return (
          <Link
            key={`${item.path}-${compact ? 'compact' : 'base'}`}
            to={item.path}
            className={`desktop-nav-tile${active ? ' active' : ''}`}
          >
            <span className="desktop-nav-tile-badge">
              <item.icon className="desktop-nav-tile-icon" />
            </span>
            <span className="desktop-nav-tile-label">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{`
        .navbar-root {
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .navbar-logo-text {
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .nav-link-pill {
          position: relative;
        }

        .nav-link-pill::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 24px;
          height: 2px;
          border-radius: 99px;
          background: var(--nav-accent, #8B1E2D);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-link-pill.active::after,
        .nav-link-pill:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }

          100% {
            background-position: 200% center;
          }
        }

        .avatar-ring {
          background: linear-gradient(90deg, #8B1E2D 0%, #9B1B30 50%, #8B1E2D 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .mobile-nav-item {
          transition: background 0.18s, transform 0.18s, border-color 0.18s;
        }

        .mobile-nav-item:hover {
          transform: translateX(4px);
        }

        .mobile-nav-item.active {
          background: linear-gradient(90deg, rgba(139, 30, 45, 0.14) 0%, transparent 100%);
          border-left: 3px solid #8B1E2D;
        }

        .dd-item {
          transition: background 0.15s;
        }

        .dd-item:hover {
          background: rgba(139, 30, 45, 0.08) !important;
        }

        .desktop-nav-strip {
          background: linear-gradient(180deg, #8B1E2D 0%, #6B0F1A 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          border-bottom: 1px solid rgba(60, 10, 18, 0.7);
        }

        .desktop-nav-strip--base {
          position: relative;
          z-index: 20;
        }

        .desktop-nav-strip--sticky {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          transform: translateY(-110%);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.22s ease, opacity 0.18s ease;
          box-shadow: 0 8px 24px rgba(58, 10, 20, 0.25);
        }

        .desktop-nav-strip--sticky.visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .desktop-nav-tile {
          min-height: 102px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #fff5f6;
          text-decoration: none;
          border-right: 1px solid rgba(255, 255, 255, 0.14);
          transition: background 0.22s ease, color 0.22s ease;
          text-align: center;
        }

        .desktop-nav-strip.compact .desktop-nav-tile {
          min-height: 66px;
          gap: 6px;
        }

        .desktop-nav-tile:first-child {
          border-left: 1px solid rgba(255, 255, 255, 0.14);
        }

        .desktop-nav-tile:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .desktop-nav-tile.active {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          box-shadow: inset 0 -4px 0 #E3C565;
          color: #ffffff;
        }

        .desktop-nav-tile-badge {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.56);
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .desktop-nav-tile-icon {
          width: 20px;
          height: 20px;
          color: currentColor;
          transform: rotate(-45deg);
        }

        .desktop-nav-tile-label {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.015em;
        }

        .desktop-nav-strip.compact .desktop-nav-tile-badge {
          width: 30px;
          height: 30px;
          border-radius: 6px;
        }

        .desktop-nav-strip.compact .desktop-nav-tile-icon {
          width: 15px;
          height: 15px;
        }

        .desktop-nav-strip.compact .desktop-nav-tile-label {
          font-size: 0.88rem;
        }

        @media (max-width: 1023px) {
          .desktop-nav-tile {
            min-height: 86px;
            gap: 8px;
          }

          .desktop-nav-tile-badge {
            width: 34px;
            height: 34px;
            border-radius: 7px;
          }

          .desktop-nav-tile-icon {
            width: 17px;
            height: 17px;
          }

          .desktop-nav-tile-label {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 639px) {
          .desktop-nav-tile {
            min-height: 74px;
            gap: 6px;
          }

          .desktop-nav-tile-badge {
            width: 30px;
            height: 30px;
            border-radius: 6px;
          }

          .desktop-nav-tile-icon {
            width: 15px;
            height: 15px;
          }

          .desktop-nav-tile-label {
            font-size: 0.8rem;
            line-height: 1.05;
          }
        }
      `}</style>

      <nav
        className="navbar-root relative z-50"
        style={
          {
            background: scrolled ? 'rgba(255,250,250,0.96)' : 'rgba(255,252,252,0.88)',
            backdropFilter: 'blur(14px)',
            borderBottom: scrolled
              ? '1px solid rgba(107,15,26,0.2)'
              : '1px solid rgba(107,15,26,0.08)',
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
            boxShadow: scrolled ? '0 10px 28px rgba(107,15,26,0.14)' : 'none',
            '--nav-accent': '#8B1E2D',
          } as React.CSSProperties
        }
      >
        <div
          style={{
            width: '100%',
            padding: '0 clamp(12px, 2.8vw, 32px)',
            minHeight: 66,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <span className="sm:hidden">
              <BrandLogo imageClassName="h-9" withText textClassName="text-[1.08rem] font-black tracking-tight" />
            </span>
            <span className="hidden sm:inline-flex">
              <BrandLogo imageClassName="h-12" withText textClassName="text-[1.62rem] font-black tracking-tight" />
            </span>
          </Link>

          <div className="hidden lg:block" />

          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 10 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('Chọn ngôn ngữ', 'Seleccionar idioma')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid rgba(107,15,26,0.28)',
                    background: 'rgba(255,252,252,0.96)',
                    borderRadius: 10,
                    padding: '6px 10px',
                    color: '#5e3a41',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Globe2 style={{ width: 15, height: 15, color: '#8B1E2D' }} />
                  <span>{lang === 'vi' ? '🇻🇳 VI' : '🇪🇸 ES'}</span>
                  <span style={{ fontSize: 10, color: '#8B1E2D' }}>▼</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                style={{
                  minWidth: 120,
                  background: 'rgba(255,252,252,0.98)',
                  border: '1px solid rgba(107,15,26,0.2)',
                  borderRadius: 10,
                  boxShadow: '0 12px 28px rgba(83,24,32,0.14)',
                  padding: 6,
                }}
              >
                <DropdownMenuItem
                  className="dd-item"
                  onClick={() => setLang('vi')}
                  style={{ borderRadius: 8, fontWeight: 700, color: '#5e3a41', cursor: 'pointer' }}
                >
                  🇻🇳 VI
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="dd-item"
                  onClick={() => setLang('es')}
                  style={{ borderRadius: 8, fontWeight: 700, color: '#5e3a41', cursor: 'pointer' }}
                >
                  🇪🇸 ES
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 7px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.88';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div
                      className="avatar-ring"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        padding: 2,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#fff5f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {userAvatarUrl ? (
                          <img
                            src={userAvatarUrl}
                            alt={userDisplayName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          <User style={{ width: 16, height: 16, color: '#8B1E2D' }} />
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        maxWidth: 126,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#2f171b',
                        lineHeight: 1.1,
                      }}
                    >
                      {userDisplayName}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  style={{
                    width: 176,
                    background: 'rgba(255,252,252,0.98)',
                    border: '1px solid rgba(107,15,26,0.2)',
                    borderRadius: 12,
                    boxShadow: '0 16px 48px rgba(83,24,32,0.16)',
                    padding: '6px',
                  }}
                >
                  <DropdownMenuLabel
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#8B1E2D',
                      padding: '6px 10px 4px',
                    }}
                  >
                    {t('Tài khoản', 'Cuenta')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator
                    style={{ background: 'rgba(107,15,26,0.12)', margin: '4px 0' }}
                  />
                  {isAdmin && (
                    <DropdownMenuItem asChild className="dd-item">
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: 13.5,
                          color: '#3f262b',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <ShieldCheck style={{ width: 14, height: 14, color: '#8B1E2D' }} />
                        {t('Quản trị', 'Admin')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="dd-item">
                    <Link
                      to="/profile"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: 13.5,
                        color: '#3f262b',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <User style={{ width: 14, height: 14, color: '#8B1E2D' }} />
                      {t('Hồ sơ', 'Perfil')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator
                    style={{ background: 'rgba(107,15,26,0.12)', margin: '4px 0' }}
                  />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="dd-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      color: '#8B1E2D',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut style={{ width: 14, height: 14 }} />
                    {t('Đăng xuất', 'Salir')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(107,15,26,0.35)',
                      background: 'transparent',
                      color: '#6d434a',
                      fontSize: 13.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#8B1E2D';
                      e.currentTarget.style.color = '#8B1E2D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(107,15,26,0.35)';
                      e.currentTarget.style.color = '#6d434a';
                    }}
                  >
                    {t('Đăng nhập', 'Entrar')}
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #8B1E2D',
                      background: 'linear-gradient(135deg, #8B1E2D 0%, #9B1B30 100%)',
                      color: '#fff6f7',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.88';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {t('Đăng ký', 'Registro')}
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('Chọn ngôn ngữ', 'Seleccionar idioma')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid rgba(107,15,26,0.28)',
                    background: 'rgba(255,252,252,0.96)',
                    borderRadius: 8,
                    padding: '4px 8px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#8B1E2D',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Globe2 style={{ width: 14, height: 14, color: '#8B1E2D' }} />
                  <span>{lang === 'vi' ? 'VI' : 'ES'}</span>
                  <span style={{ fontSize: 9 }}>▼</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                style={{
                  minWidth: 110,
                  background: 'rgba(255,252,252,0.98)',
                  border: '1px solid rgba(107,15,26,0.2)',
                  borderRadius: 10,
                  boxShadow: '0 12px 28px rgba(83,24,32,0.14)',
                  padding: 6,
                }}
              >
                <DropdownMenuItem
                  className="dd-item"
                  onClick={() => setLang('vi')}
                  style={{ borderRadius: 8, fontWeight: 700, color: '#5e3a41', cursor: 'pointer' }}
                >
                  🇻🇳 VI
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="dd-item"
                  onClick={() => setLang('es')}
                  style={{ borderRadius: 8, fontWeight: 700, color: '#5e3a41', cursor: 'pointer' }}
                >
                  🇪🇸 ES
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: '1px solid rgba(107,15,26,0.28)',
                background: 'rgba(107,15,26,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#71444b',
              }}
            >
              {mobileOpen ? (
                <X style={{ width: 18, height: 18 }} />
              ) : (
                <Menu style={{ width: 18, height: 18 }} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                overflow: 'hidden',
                borderTop: '1px solid rgba(107,15,26,0.14)',
                background: 'rgba(255,252,252,0.98)',
              }}
              className="lg:hidden"
            >
              <div style={{ padding: '12px 20px 20px' }}>
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(107,15,26,0.2)',
                      background: 'rgba(107,15,26,0.05)',
                      textDecoration: 'none',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      className="avatar-ring"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        padding: 2,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#fff5f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {userAvatarUrl ? (
                          <img
                            src={userAvatarUrl}
                            alt={userDisplayName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          <User style={{ width: 16, height: 16, color: '#8B1E2D' }} />
                        )}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#2f171b', margin: 0 }}>
                        {userDisplayName}
                      </p>
                      <p style={{ fontSize: 13.5, color: '#8B1E2D', margin: 0, marginTop: 1 }}>
                        {t('Xem hồ sơ →', 'Ver perfil →')}
                      </p>
                    </div>
                  </Link>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`mobile-nav-item${active ? ' active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '9px 12px',
                          borderRadius: 10,
                          borderLeft: active ? '3px solid #8B1E2D' : '3px solid transparent',
                          background: active ? 'rgba(107,15,26,0.1)' : 'transparent',
                          color: active ? '#8B1E2D' : '#6f4a50',
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <item.icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(107,15,26,0.14)',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 10,
                        border: '1px solid rgba(107,15,26,0.28)',
                        background: 'rgba(107,15,26,0.08)',
                        color: '#8B1E2D',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        fontFamily: 'inherit',
                      }}
                    >
                      <LogOut style={{ width: 15, height: 15 }} />
                      {t('Đăng xuất', 'Salir')}
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        style={{ flex: 1, textDecoration: 'none' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        <button
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 10,
                            border: '1px solid rgba(107,15,26,0.3)',
                            background: 'transparent',
                            color: '#6b434a',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {t('Đăng nhập', 'Entrar')}
                        </button>
                      </Link>
                      <Link
                        to="/register"
                        style={{ flex: 1, textDecoration: 'none' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        <button
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 10,
                            border: 'none',
                            background: 'linear-gradient(135deg, #8B1E2D 0%, #9B1B30 100%)',
                            color: '#fff6f7',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {t('Đăng ký', 'Registro')}
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="desktop-nav-strip desktop-nav-strip--base">
        {renderDesktopMenuStrip(false)}
      </div>

      <div className={`desktop-nav-strip desktop-nav-strip--sticky compact${scrolled ? ' visible' : ''}`}>
        {renderDesktopMenuStrip(true)}
      </div>
    </>
  );
};

export default Navbar;
