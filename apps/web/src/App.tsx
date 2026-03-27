import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useLanguage } from "@/hooks/useLanguage";
import { heartbeat, logoutBeacon } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import Index from "./screens/Index";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Quizzes from "./screens/Quizzes";
import QuizTake from "./screens/QuizTake";
import Leaderboard from "./screens/Leaderboard";
import Materials from "./screens/Materials";
import Profile from "./screens/Profile";
import Admin from "./screens/Admin";
import NotFound from "./screens/NotFound";
import FloatingContactButton from "./components/FloatingContactButton";

const queryClient = new QueryClient();

const AuthSessionManager = () => {
  const { t } = useLanguage();

  useEffect(() => {
    const HEARTBEAT_MS = 15 * 1000;

    const sendHeartbeat = async () => {
      const stored = getStoredAuth();
      if (!stored?.token) return;

      try {
        await heartbeat();
      } catch {
        // apiRequest handles 401 cleanup and auth-updated event.
      }
    };

    const onBeforeUnload = () => {
      const stored = getStoredAuth();
      if (!stored?.token) return;
      logoutBeacon(stored.token);
    };

    const interval = window.setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_MS);

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const onSessionEnded = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail;
      const reason = String(detail?.reason || "").toLowerCase();

      if (reason.includes("session expired on this device")) {
        toast.error(t("Phiên đăng nhập đã bị thay thế bởi thiết bị khác.", "La sesión fue reemplazada por otro dispositivo."), {
          description: t(
            "Vui lòng đăng nhập lại để tiếp tục.",
            "Por favor, inicia sesión de nuevo para continuar."
          ),
        });
        return;
      }

      toast.error(t("Phiên đăng nhập đã hết hạn.", "La sesión ha expirado."), {
        description: t(
          "Vui lòng đăng nhập lại.",
          "Por favor, inicia sesión nuevamente."
        ),
      });
    };

    window.addEventListener("auth-session-ended", onSessionEnded as EventListener);

    return () => {
      window.removeEventListener("auth-session-ended", onSessionEnded as EventListener);
    };
  }, [t]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <AuthSessionManager />
        <Toaster />
        <Sonner />
        <FloatingContactButton />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
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
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
