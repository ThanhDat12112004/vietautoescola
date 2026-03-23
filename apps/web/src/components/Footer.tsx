import { Car, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container py-8 md:py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Car className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold text-secondary-foreground">
                Viet Auto<span className="text-accent"> Escola</span>
              </span>
            </Link>
            <p className="text-xs text-secondary-foreground/60 leading-relaxed">
              {t(
                "Nền tảng luyện thi bằng lái xe song ngữ Việt - Tây Ban Nha.",
                "Plataforma bilingüe vietnamita-español para el examen de conducir."
              )}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-sm mb-2">{t("Học tập", "Aprendizaje")}</h4>
            <div className="flex flex-col gap-1.5 text-xs text-secondary-foreground/70">
              <Link to="/quizzes" className="hover:text-accent transition-colors">{t("Làm bài thi", "Exámenes")}</Link>
              <Link to="/materials" className="hover:text-accent transition-colors">{t("Tài liệu", "Materiales")}</Link>
              <Link to="/leaderboard" className="hover:text-accent transition-colors">{t("Bảng xếp hạng", "Ranking")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-2">{t("Tài khoản", "Cuenta")}</h4>
            <div className="flex flex-col gap-1.5 text-xs text-secondary-foreground/70">
              <Link to="/login" className="hover:text-accent transition-colors">{t("Đăng nhập", "Iniciar sesión")}</Link>
              <Link to="/register" className="hover:text-accent transition-colors">{t("Đăng ký", "Registrarse")}</Link>
              <Link to="/profile" className="hover:text-accent transition-colors">{t("Hồ sơ", "Perfil")}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-sm mb-2">{t("Liên hệ", "Contacto")}</h4>
            <div className="flex flex-col gap-1.5 text-xs text-secondary-foreground/70">
              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> support@vietautoescola.com</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +34 900 000 000</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Madrid, España</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-secondary-foreground/10 pt-4 text-center text-[10px] text-secondary-foreground/40">
          © 2026 Viet Auto Escola. {t("Bảo lưu mọi quyền.", "Todos los derechos reservados.")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
