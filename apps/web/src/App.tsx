import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
