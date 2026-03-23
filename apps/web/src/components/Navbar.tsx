import { Button } from '@/components/ui/button';
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
import { BookOpen, Car, FileText, Globe, Home, LogOut, Menu, Trophy, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAuthenticated(Boolean(auth?.token));
      setAuthUser(auth?.user || null);
    };

    syncAuth();

    const onStorageChange = () => {
      syncAuth();
    };

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [location.pathname]);

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

  const userDisplayName = authUser?.username || 'User';

  const navItems = [
    { path: '/', label: t('Trang chủ', 'Inicio'), icon: Home },
    { path: '/quizzes', label: t('Làm bài thi', 'Exámenes'), icon: BookOpen },
    { path: '/leaderboard', label: t('Xếp hạng', 'Ranking'), icon: Trophy },
    { path: '/materials', label: t('Tài liệu', 'Materiales'), icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Car className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-800 tracking-tight">
            Viet Auto<span className="text-primary"> Escola</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-1.5 md:flex">
          <button
            onClick={() => setLang(lang === 'vi' ? 'es' : 'vi')}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === 'vi' ? '🇻🇳 VI' : '🇪🇸 ES'}
          </button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-border px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t('Mở menu tài khoản', 'Abrir menú de cuenta')}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="max-w-[88px] truncate text-[10px] font-semibold leading-none">
                    {userDisplayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">
                  {t('Tài khoản', 'Cuenta')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer text-xs">
                    <User className="mr-2 h-3.5 w-3.5" />
                    {t('Hồ sơ', 'Perfil')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-xs">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  {t('Đăng xuất', 'Salir')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  {t('Đăng nhập', 'Entrar')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-xs">
                  {t('Đăng ký', 'Registro')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile: lang toggle + menu */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setLang(lang === 'vi' ? 'es' : 'vi')}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium"
          >
            {lang === 'vi' ? '🇻🇳' : '🇪🇸'}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="mb-1 flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {userDisplayName}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('Xem hồ sơ', 'Ver perfil')}</p>
                  </div>
                </Link>
              )}

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2 mt-1 border-t border-border">
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full" size="sm" onClick={handleLogout}>
                    {t('Đăng xuất', 'Salir')}
                  </Button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full" size="sm">
                        {t('Đăng nhập', 'Entrar')}
                      </Button>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full" size="sm">
                        {t('Đăng ký', 'Registro')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
