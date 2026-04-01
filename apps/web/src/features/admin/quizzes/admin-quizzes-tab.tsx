import {
  getQuizzesSubtabs,
  isQuizzesSubtabActive,
  resolveQuizzesSubtabState,
} from '@/features/admin/admin.subtab-config';
import type { ReactNode } from 'react';

export function AdminQuizzesTabShell(props: {
  lang: 'vi' | 'es';
  quizzesSubTab: 'types' | 'manage';
  quizzesHierarchyTab: 'topic_groups' | 'types';
  setQuizzesSubTab: (tab: 'types' | 'manage') => void;
  setQuizzesHierarchyTab: (tab: 'topic_groups' | 'types') => void;
  children: ReactNode;
}) {
  const {
    lang,
    quizzesSubTab,
    quizzesHierarchyTab,
    setQuizzesSubTab,
    setQuizzesHierarchyTab,
    children,
  } = props;

  return (
    <div className="space-y-0">
      <div className="sticky top-0 z-10 mb-2 flex flex-wrap gap-2 border-b border-[#e3d7dc] bg-white px-2 py-2">
        {getQuizzesSubtabs(lang).map((tab) => {
          const isActive = isQuizzesSubtabActive(tab.id, quizzesSubTab, quizzesHierarchyTab);
          return (
            <button
              key={tab.id}
              onClick={() => {
                const nextState = resolveQuizzesSubtabState(tab.id);
                setQuizzesSubTab(nextState.quizzesSubTab);
                if (nextState.quizzesHierarchyTab) {
                  setQuizzesHierarchyTab(nextState.quizzesHierarchyTab);
                }
              }}
              className={`px-3 py-2 rounded-md border font-semibold text-sm transition-colors ${
                isActive
                  ? 'border-[#7a2038] bg-[#f6dce4] text-[#6b1b31]'
                  : 'border-[#e3d7dc] bg-white text-[#5f5f5f] hover:bg-[#f9f3f6]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
