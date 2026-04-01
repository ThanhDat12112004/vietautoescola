import { getMaterialsSubtabs, resolveMaterialsSubtabState } from '@/features/admin/admin.subtab-config';
import type { ReactNode } from 'react';

export function AdminMaterialsTabShell(props: {
  lang: 'vi' | 'es';
  materialsSubTab: 'topic_groups' | 'subjects' | 'manage';
  setMaterialsSubTab: (tab: 'topic_groups' | 'subjects' | 'manage') => void;
  children: ReactNode;
}) {
  const { lang, materialsSubTab, setMaterialsSubTab, children } = props;

  return (
    <div className="space-y-0">
      <div className="sticky top-0 z-10 mb-2 flex flex-wrap gap-2 border-b border-[#e3d7dc] bg-white px-2 py-2">
        {getMaterialsSubtabs(lang).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMaterialsSubTab(resolveMaterialsSubtabState(tab.id))}
            className={`px-3 py-2 rounded-md border font-semibold text-sm transition-colors ${
              materialsSubTab === tab.id
                ? 'border-[#7a2038] bg-[#f6dce4] text-[#6b1b31]'
                : 'border-[#e3d7dc] bg-white text-[#5f5f5f] hover:bg-[#f9f3f6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
