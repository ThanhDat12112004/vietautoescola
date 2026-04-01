import type { LucideIcon } from 'lucide-react';

type Lang = 'vi' | 'es';

type NoticeState = {
  text: string;
  type: 'error' | 'success';
};

type AdminTabButton = {
  id: 'users' | 'materials' | 'quizzes';
  label: string;
  desc: string;
  iconKey: 'users' | 'materials' | 'quizzes';
};

export function AdminNoticeBanner({
  notice,
  SuccessIcon,
  ErrorIcon,
}: {
  notice: NoticeState;
  SuccessIcon: LucideIcon;
  ErrorIcon: LucideIcon;
}) {
  if (!notice.text) return null;

  return (
    <div
      className={`mb-2 p-3 border rounded ${notice.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-destructive bg-destructive/10 text-destructive'}`}
    >
      <div className="flex items-center gap-2">
        {notice.type === 'success' ? (
          <SuccessIcon className="h-4 w-4" />
        ) : (
          <ErrorIcon className="h-4 w-4" />
        )}
        {notice.text}
      </div>
    </div>
  );
}

export function AdminPageHeader({ lang }: { lang: Lang }) {
  return (
    <header className="mb-2 border border-[#e3d7dc] bg-white/95 shadow-sm">
      <div className="w-full px-3 py-4 sm:px-4 md:py-5">
        <div className="max-w-3xl border-l-4 border-[#7a2038]/75 pl-3 sm:pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
            {lang === 'vi' ? 'Quản trị' : 'Administración'}
          </p>
          <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
            {lang === 'vi' ? 'Trang quản trị' : 'Panel de administración'}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
            {lang === 'vi'
              ? 'Quản lý tài khoản, tài liệu và bài thi cho học viên.'
              : 'Gestiona cuentas, temario y exámenes para alumnos.'}
          </p>
        </div>
      </div>
    </header>
  );
}

export function AdminSidebarTabs({
  lang,
  tabButtons,
  tabIconMap,
  activeTab,
  onTabChange,
}: {
  lang: Lang;
  tabButtons: AdminTabButton[];
  tabIconMap: Record<'users' | 'materials' | 'quizzes', LucideIcon>;
  activeTab: 'users' | 'materials' | 'quizzes';
  onTabChange: (tab: 'users' | 'materials' | 'quizzes') => void;
}) {
  return (
    <aside className="rounded-none border border-[#e3d7dc] bg-white p-3 shadow-sm sm:w-64 sm:shrink-0">
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#7a2038]/70">
        {lang === 'vi' ? 'Chọn nội dung cần làm' : 'Elija qué gestionar'}
      </p>
      <div className="space-y-0 overflow-hidden rounded-md border border-[#e3d7dc] divide-y divide-[#f0e8eb]">
        {tabButtons.map((tab) => {
          const Icon = tabIconMap[tab.iconKey];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`w-full rounded-none border-0 px-3 py-2.5 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#f6dce4] text-[#6b1b31]'
                  : 'bg-white text-[#5f5f5f] hover:bg-[#f9f3f6]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-bold leading-tight">{tab.label}</span>
              </span>
              <span className="mt-1 block pl-6 text-[11px] font-normal leading-snug text-[#7b6d73]">
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
