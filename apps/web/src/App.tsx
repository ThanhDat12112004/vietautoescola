import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { APP_ROUTES } from '@/constants/routes';
import { useAuthSessionManager } from '@/hooks/useAuthSessionManager';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import FloatingContactButton from './components/FloatingContactButton';

const Admin = lazy(() => import('./screens/Admin'));
const Index = lazy(() => import('./screens/Index'));
const Leaderboard = lazy(() => import('./screens/Leaderboard'));
const Login = lazy(() => import('./screens/Login'));
const Materials = lazy(() => import('./screens/Materials'));
const NotFound = lazy(() => import('./screens/NotFound'));
const Profile = lazy(() => import('./screens/Profile'));
const QuizTake = lazy(() => import('./screens/QuizTake'));
const Quizzes = lazy(() => import('./screens/Quizzes'));
const Register = lazy(() => import('./screens/Register'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const AuthSessionManager = () => {
  const { t } = useLanguage();

  useAuthSessionManager(t);

  return null;
};

const AppShell = () => {
  const { pathname } = useLocation();
  const hideFloatingContact = pathname.startsWith(APP_ROUTES.QUIZ_PREFIX);

  return (
    <>
      {!hideFloatingContact && <FloatingContactButton />}
      <Suspense fallback={<div className="px-4 py-8 text-sm text-muted-foreground">Loading...</div>}>
        <Routes>
          <Route path={APP_ROUTES.HOME} element={<Index />} />
          <Route path={APP_ROUTES.LOGIN} element={<Login />} />
          <Route path={APP_ROUTES.REGISTER} element={<Register />} />
          <Route path={APP_ROUTES.QUIZZES} element={<Quizzes />} />
          <Route path={APP_ROUTES.QUIZ_TAKE} element={<QuizTake />} />
          <Route path={APP_ROUTES.LEADERBOARD} element={<Leaderboard />} />
          <Route path={APP_ROUTES.MATERIALS} element={<Materials />} />
          <Route path={APP_ROUTES.PROFILE} element={<Profile />} />
          <Route path={APP_ROUTES.ADMIN} element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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
