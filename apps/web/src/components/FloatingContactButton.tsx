import { useLanguage } from "@/hooks/useLanguage";
import { ChevronUp, Mail, MapPin, PhoneCall } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CONTACT_PHONE = "+34 900 000 000";
const CONTACT_TEL_LINK = "tel:+34900000000";
const CONTACT_EMAIL = "support@vietautoescola.com";
const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`;
const CONTACT_MAP_LINK = "https://maps.google.com/?q=Madrid,Espana";
const CONTACT_LINKEDIN = "#";

const FloatingContactButton = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {isOpen && (
        <div className="w-[248px] overflow-hidden rounded-2xl border border-primary/20 bg-card-overlay p-2 shadow-[0_16px_34px_rgba(90,20,35,0.22)] backdrop-blur-sm">
          <a
            href={CONTACT_LINKEDIN}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-hover-surface"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a66c2] text-base font-bold text-white shadow-[0_6px_14px_rgba(10,102,194,0.3)]">
              in
            </span>
            <span className="text-sm font-semibold text-text-muted-dark">LinkedIn</span>
          </a>
          <a
            href={CONTACT_TEL_LINK}
            className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-hover-surface"
            title={CONTACT_PHONE}
            aria-label={t("Gọi điện", "Llamar")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_14px_rgba(139,30,45,0.34)]">
              <PhoneCall className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-text-muted-dark">{t("Gọi điện", "Llamar")}</span>
          </a>
          <a
            href={CONTACT_EMAIL_LINK}
            className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-hover-surface"
            title={CONTACT_EMAIL}
            aria-label={t("Gửi Gmail", "Enviar Gmail")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c76a17] text-white shadow-[0_6px_14px_rgba(199,106,23,0.32)]">
              <Mail className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-text-muted-dark">{t("Gmail", "Gmail")}</span>
          </a>
          <a
            href={CONTACT_MAP_LINK}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-hover-surface"
            aria-label={t("Xem địa chỉ", "Ver direccion")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c7d86] text-white shadow-[0_6px_14px_rgba(12,125,134,0.3)]">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-text-muted-dark">{t("Địa chỉ", "Direccion")}</span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(100,22,38,0.42)] transition-all hover:-translate-y-0.5 hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-label={t("Mở menu liên hệ", "Abrir menu de contacto")}
        title={t("Liên hệ", "Contacto")}
      >
        <span>{t("Liên hệ", "Contacto")}</span>
        {isOpen ? (
          <span className="text-2xl font-bold leading-none">+</span>
        ) : (
          <ChevronUp className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default FloatingContactButton;