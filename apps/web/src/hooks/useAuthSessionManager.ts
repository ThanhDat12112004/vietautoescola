import { toast } from '@/components/ui/sonner';
import { pingSession } from '@/lib/api/auth';
import { getStoredAuth } from '@/lib/auth';
import { useEffect } from 'react';

const SESSION_POLL_VISIBLE_MS = 30_000;

type TranslateFn = (vi: string, es: string) => string;

export function useAuthSessionManager(t: TranslateFn) {
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
}
