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
import { logout } from '@/lib/api';
import { clearAuth, getStoredAuth, type AuthUser } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Globe,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  User,
  X,
} from 'lucide-react';
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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
  const userAvatarUrl = authUser?.avatar_url || null;
  const isAdmin = (authUser?.role || '').toLowerCase() === 'admin';

  const navItems = [
    { path: '/', label: t('Trang chủ', 'Inicio'), icon: Home },
    { path: '/quizzes', label: t('Làm bài thi', 'Exámenes'), icon: BookOpen },
    { path: '/leaderboard', label: t('Xếp hạng', 'Ranking'), icon: Trophy },
    { path: '/materials', label: t('Tài liệu', 'Materiales'), icon: FileText },
    ...(isAdmin ? [{ path: '/admin', label: t('Quản trị', 'Admin'), icon: ShieldCheck }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .navbar-root {
          font-family: 'DM Sans', sans-serif;
        }

        .navbar-logo-text {
          font-family: 'DM Serif Display', serif;
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
          width: 20px;
          height: 2px;
          border-radius: 99px;
          background: var(--nav-accent, #8b1e2d);
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
          background: linear-gradient(90deg, #8b1e2d 0%, #b63b4f 50%, #8b1e2d 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .mobile-nav-item {
          transition: background 0.18s, transform 0.18s;
        }

        .mobile-nav-item:hover {
          transform: translateX(4px);
        }

        .mobile-nav-item.active {
          background: linear-gradient(90deg, rgba(139, 30, 45, 0.12) 0%, transparent 100%);
          border-left: 3px solid #8b1e2d;
        }

        .dd-item {
          transition: background 0.15s;
        }

        .dd-item:hover {
          background: rgba(139, 30, 45, 0.08) !important;
        }
      `}</style>

      <nav
        className="navbar-root sticky top-0 z-50"
        style={
          {
            background: scrolled ? 'rgba(255,250,250,0.96)' : 'rgba(255,252,252,0.9)',
            backdropFilter: 'blur(14px)',
            borderBottom: scrolled
              ? '1px solid rgba(139,30,45,0.2)'
              : '1px solid rgba(139,30,45,0.08)',
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
            boxShadow: scrolled ? '0 8px 28px rgba(139,30,45,0.12)' : 'none',
            '--nav-accent': '#8b1e2d',
          } as React.CSSProperties
        }
      >
        <div
          style={{
            width: '100%',
            padding: '0 clamp(12px, 2.8vw, 32px)',
            height: 72,
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
              <BrandLogo imageClassName="h-10" />
            </span>
            <span className="hidden sm:inline-flex">
              <BrandLogo imageClassName="h-11" withText />
            </span>
          </Link>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link-pill${active ? ' active' : ''}`}
                  style={{
                    padding: '16px 16px',
                    borderRadius: 8,
                    fontSize: 20,
                    fontWeight: active ? 600 : 400,
                    letterSpacing: '0.01em',
                    color: active ? '#8b1e2d' : '#6b4a4f',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#2f171b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#6b4a4f';
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setLang(lang === 'vi' ? 'es' : 'vi')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 13px',
                borderRadius: 8,
                border: '1px solid rgba(139,30,45,0.28)',
                background: 'rgba(139,30,45,0.05)',
                color: '#7a4b53',
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,30,45,0.55)';
                e.currentTarget.style.color = '#8b1e2d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,30,45,0.28)';
                e.currentTarget.style.color = '#7a4b53';
              }}
            >
              <Globe style={{ width: 15, height: 15 }} />
              {lang === 'vi' ? '🇻🇳 VI' : '🇪🇸 ES'}
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 8px',
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
                          <User style={{ width: 16, height: 16, color: '#8b1e2d' }} />
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 14,
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
                    border: '1px solid rgba(139,30,45,0.2)',
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
                      color: '#8b1e2d',
                      padding: '6px 10px 4px',
                    }}
                  >
                    {t('Tài khoản', 'Cuenta')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator
                    style={{ background: 'rgba(139,30,45,0.12)', margin: '4px 0' }}
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
                        <ShieldCheck style={{ width: 14, height: 14, color: '#8b1e2d' }} />
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
                      <User style={{ width: 14, height: 14, color: '#8b1e2d' }} />
                      {t('Hồ sơ', 'Perfil')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator
                    style={{ background: 'rgba(139,30,45,0.12)', margin: '4px 0' }}
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
                      color: '#8b1e2d',
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
                      padding: '7px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(139,30,45,0.35)',
                      background: 'transparent',
                      color: '#6d434a',
                      fontSize: 13.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#8b1e2d';
                      e.currentTarget.style.color = '#8b1e2d';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139,30,45,0.35)';
                      e.currentTarget.style.color = '#6d434a';
                    }}
                  >
                    {t('Đăng nhập', 'Entrar')}
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '7px 16px',
                      borderRadius: 8,
                      border: '1px solid #8b1e2d',
                      background: 'linear-gradient(135deg, #8b1e2d 0%, #b63b4f 100%)',
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

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setLang(lang === 'vi' ? 'es' : 'vi')}
              style={{
                padding: '5px 10px',
                borderRadius: 7,
                border: '1px solid rgba(139,30,45,0.28)',
                background: 'transparent',
                fontSize: 17,
                cursor: 'pointer',
              }}
            >
              {lang === 'vi' ? '🇻🇳' : '🇪🇸'}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                border: '1px solid rgba(139,30,45,0.28)',
                background: 'rgba(139,30,45,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#71444b',
              }}
            >
              {mobileOpen ? (
                <X style={{ width: 20, height: 20 }} />
              ) : (
                <Menu style={{ width: 20, height: 20 }} />
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
                borderTop: '1px solid rgba(139,30,45,0.14)',
                background: 'rgba(255,252,252,0.98)',
              }}
              className="md:hidden"
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
                      border: '1px solid rgba(139,30,45,0.2)',
                      background: 'rgba(139,30,45,0.05)',
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
                          <User style={{ width: 16, height: 16, color: '#8b1e2d' }} />
                        )}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#2f171b', margin: 0 }}>
                        {userDisplayName}
                      </p>
                      <p style={{ fontSize: 13.5, color: '#8b1e2d', margin: 0, marginTop: 1 }}>
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
                          padding: '11px 14px',
                          borderRadius: 10,
                          borderLeft: active ? '3px solid #8b1e2d' : '3px solid transparent',
                          background: active ? 'rgba(139,30,45,0.1)' : 'transparent',
                          color: active ? '#8b1e2d' : '#6f4a50',
                          textDecoration: 'none',
                          fontSize: 16,
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <item.icon style={{ width: 17, height: 17, flexShrink: 0 }} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(139,30,45,0.14)',
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
                        border: '1px solid rgba(139,30,45,0.28)',
                        background: 'rgba(139,30,45,0.08)',
                        color: '#8b1e2d',
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
                            border: '1px solid rgba(139,30,45,0.3)',
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
                            background: 'linear-gradient(135deg, #8b1e2d 0%, #b63b4f 100%)',
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
    </>
  );
};

export default Navbar;
