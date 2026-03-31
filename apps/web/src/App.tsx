import { Toaster as Sonner, toast } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { pingSession } from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import FloatingContactButton from './components/FloatingContactButton';
import Admin from './screens/Admin';
import Index from './screens/Index';
import Leaderboard from './screens/Leaderboard';
import Login from './screens/Login';
import Materials from './screens/Materials';
import NotFound from './screens/NotFound';
import Profile from './screens/Profile';
import QuizTake from './screens/QuizTake';
import Quizzes from './screens/Quizzes';
import Register from './screens/Register';

const queryClient = new QueryClient();

/** Khi tab đang mở: ~2 req/phút/user (đủ phát hiện đăng nhập chỗ khác trong ~30s). Tab ẩn: không poll để giảm tải server. */
const SESSION_POLL_VISIBLE_MS = 30_000;

const AuthSessionManager = () => {
  const { t } = useLanguage();

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      const stored = getStoredAuth();
      if (!stored?.token) return;
      try {
        await pingSession();
      } catch {
        // 401: apiRequest clears auth and dispatches auth-session-ended.
      }
    };

    const arm = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      intervalId = setInterval(() => {
        void tick();
      }, SESSION_POLL_VISIBLE_MS);
    };

    const onVisibility = () => {
      if (!document.hidden) {
        void tick();
      }
      arm();
    };

    void tick();
    arm();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    const onSessionEnded = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail;
      const reason = String(detail?.reason || '').toLowerCase();

      if (reason.includes('session expired on this device')) {
        toast.error(
          t(
            'Phiên đăng nhập đã bị thay thế bởi thiết bị khác.',
            'La sesión fue reemplazada por otro dispositivo.'
          ),
          {
            description: t(
              'Vui lòng đăng nhập lại để tiếp tục.',
              'Por favor, inicia sesión de nuevo para continuar.'
            ),
          }
        );
        return;
      }

      toast.error(t('Phiên đăng nhập đã hết hạn.', 'La sesión ha expirado.'), {
        description: t('Vui lòng đăng nhập lại.', 'Por favor, inicia sesión nuevamente.'),
      });
    };

    window.addEventListener('auth-session-ended', onSessionEnded as EventListener);

    return () => {
      window.removeEventListener('auth-session-ended', onSessionEnded as EventListener);
    };
  }, [t]);

  return null;
};

const AppShell = () => {
  const { pathname } = useLocation();
  const hideFloatingContact = pathname.startsWith('/quiz/');

  return (
    <>
      {!hideFloatingContact && <FloatingContactButton />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quiz/:id" element={<QuizTake />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <AuthSessionManager />
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppShell />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
