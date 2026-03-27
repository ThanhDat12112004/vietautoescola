import BrandLogo from '@/components/BrandLogo';
import { useLanguage } from '@/hooks/useLanguage';
import { getStoredAuth } from '@/lib/auth';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAdmin((auth?.user?.role || '').toLowerCase() === 'admin');
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  return (
    <>
      <style>{`
        .ft-root {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: linear-gradient(180deg, #8b1e2d 0%, #7a1726 55%, #6b0f1a 100%);
          color: #f5e9ed;
          border-top: 1px solid rgba(227, 197, 101, 0.32);
          position: relative;
          overflow: hidden;
        }

        .ft-root::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(227, 197, 101, 0.7), transparent);
        }

        .ft-glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 160px;
          background: radial-gradient(ellipse, rgba(227, 197, 101, 0.16) 0%, transparent 70%);
          pointer-events: none;
        }

        .ft-inner {
          width: 100%;
          padding: 0 clamp(12px, 2.8vw, 32px);
          position: relative;
          z-index: 1;
        }

        .ft-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1.3fr;
          gap: 48px;
          padding: 56px 0 48px;
        }

        @media (max-width: 900px) {
          .ft-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
            padding: 40px 0 36px;
          }
        }

        @media (max-width: 540px) {
          .ft-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 36px 0 28px;
          }
        }

        .ft-brand-desc {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(250, 237, 241, 0.92);
          margin-top: 14px;
          max-width: 320px;
        }

        .ft-brand-row {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-left: -2px;
        }

        .ft-brand-name {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #fff5f8;
          line-height: 1;
        }

        .ft-brand-name span {
          color: #e3c565;
        }

        @media (max-width: 540px) {
          .ft-brand-name {
            font-size: 22px;
          }
        }

        .ft-socials {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .ft-social-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(255, 236, 242, 0.35);
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #fff5f8;
          text-decoration: none;
        }

        .ft-social-btn:hover {
          border-color: rgba(227, 197, 101, 0.8);
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          transform: translateY(-2px);
        }

        .ft-social-btn svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }

        .ft-col-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 18px;
          color: #fff5f8;
          letter-spacing: 0.01em;
          margin-bottom: 16px;
          position: relative;
          padding-bottom: 10px;
        }

        .ft-col-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 24px;
          height: 1.5px;
          background: linear-gradient(90deg, #e3c565, transparent);
          border-radius: 99px;
        }

        .ft-link-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ft-link {
          font-size: 15.5px;
          color: rgba(252, 236, 242, 0.92);
          text-decoration: none;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          width: fit-content;
        }

        .ft-link:hover {
          color: #fff;
          gap: 6px;
        }

        .ft-link-arrow {
          width: 14px;
          height: 14px;
          opacity: 0;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .ft-link:hover .ft-link-arrow {
          opacity: 1;
        }

        .ft-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14.5px;
          color: rgba(252, 236, 242, 0.92);
          line-height: 1.5;
        }

        .ft-contact-icon {
          width: 34px;
          height: 34px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 238, 243, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: -1px;
        }

        .ft-contact-icon svg {
          width: 15px;
          height: 15px;
          color: #fff4f7;
        }

        .ft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 235, 241, 0.35) 20%, rgba(255, 235, 241, 0.35) 80%, transparent);
        }

        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 0 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ft-copy {
          font-size: 14px;
          color: rgba(252, 236, 242, 0.88);
          letter-spacing: 0.02em;
        }

        .ft-copy span {
          color: #e3c565;
        }

        .ft-bottom-links {
          display: flex;
          gap: 20px;
        }

        .ft-bottom-link {
          font-size: 14px;
          color: rgba(252, 236, 242, 0.88);
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }

        .ft-bottom-link:hover {
          color: #fff;
        }

        .ft-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(227, 197, 101, 0.6);
          background: rgba(227, 197, 101, 0.14);
          font-size: 12px;
          font-weight: 600;
          color: #fff3d1;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .ft-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #e3c565;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }
      `}</style>

      <footer className="ft-root">
        <div className="ft-glow" />
        <div className="ft-inner">
          <div className="ft-grid">
            <div>
              <div className="ft-badge">
                <span className="ft-badge-dot" />
                {t('Đang hoạt động', 'En linea')}
              </div>
              <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
                <div className="ft-brand-row">
                  <BrandLogo imageClassName="h-11" />
                  <span className="ft-brand-name">
                    Việt <span>Autoescuela</span>
                  </span>
                </div>
              </Link>
              <p className="ft-brand-desc">
                {t(
                  'Hệ thống học và luyện thi bằng lái xe Tây Ban Nha',
                  'Sistema de aprendizaje y preparacion para el examen de conducir en Espana'
                )}
              </p>
              <div className="ft-socials">
                <a href="#" className="ft-social-btn" aria-label="Facebook">
                  <svg viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="ft-social-btn" aria-label="Zalo">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </a>
                <a href="#" className="ft-social-btn" aria-label="YouTube">
                  <svg viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon
                      points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                      style={{ fill: '#fff8f9' }}
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="ft-col-title">{t('Học tập', 'Aprendizaje')}</h4>
              <div className="ft-link-list">
                <Link to="/quizzes" className="ft-link">
                  {t('Làm bài thi', 'Examenes')}
                  <ArrowUpRight className="ft-link-arrow" />
                </Link>
                <Link to="/materials" className="ft-link">
                  {t('Tài liệu', 'Materiales')}
                  <ArrowUpRight className="ft-link-arrow" />
                </Link>
                <Link to="/leaderboard" className="ft-link">
                  {t('Bảng xếp hạng', 'Ranking')}
                  <ArrowUpRight className="ft-link-arrow" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="ft-col-title">{t('Tài khoản', 'Cuenta')}</h4>
              <div className="ft-link-list">
                <Link to="/login" className="ft-link">
                  {t('Đăng nhập', 'Iniciar sesion')}
                  <ArrowUpRight className="ft-link-arrow" />
                </Link>
                <Link to="/register" className="ft-link">
                  {t('Đăng ký', 'Registrarse')}
                  <ArrowUpRight className="ft-link-arrow" />
                </Link>
                <Link to="/profile" className="ft-link">
                  {t('Hồ sơ', 'Perfil')}
                  <ArrowUpRight className="ft-link-arrow" />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="ft-link">
                    {t('Quản trị', 'Administracion')}
                    <ArrowUpRight className="ft-link-arrow" />
                  </Link>
                )}
              </div>
            </div>

            <div>
              <h4 className="ft-col-title">{t('Liên hệ', 'Contacto')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="ft-contact-item">
                  <div className="ft-contact-icon">
                    <Mail />
                  </div>
                  <span>support@vietautoescola.com</span>
                </div>
                <div className="ft-contact-item">
                  <div className="ft-contact-icon">
                    <Phone />
                  </div>
                  <span>+34 900 000 000</span>
                </div>
                <div className="ft-contact-item">
                  <div className="ft-contact-icon">
                    <MapPin />
                  </div>
                  <span>Madrid, Espana</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ft-divider" />

          <div className="ft-bottom">
            <p className="ft-copy">
              © 2026 <span>Viet Auto Escola</span>.{' '}
              {t('Bảo lưu mọi quyền.', 'Todos los derechos reservados.')}
            </p>
            <div className="ft-bottom-links">
              <a href="#" className="ft-bottom-link">
                {t('Chính sách bảo mật', 'Privacidad')}
              </a>
              <a href="#" className="ft-bottom-link">
                {t('Điều khoản sử dụng', 'Terminos')}
              </a>
              <a href="#" className="ft-bottom-link">
                {t('Hỗ trợ', 'Soporte')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
